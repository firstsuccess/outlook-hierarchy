import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { it, expect } from "vitest";
import { counter, type CounterEnvironment } from "../worker/index";
const origin = "https://example.test";
function setup() {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync("drizzle/0000_sharp_lilith.sql", "utf8"));
  const env: CounterEnvironment = {
    DB: {
      prepare(sql) {
        return {
          bind(...values: unknown[]) {
            return {
              async first<T>() {
                return db
                  .prepare(sql)
                  .get(...(values as (string | number)[])) as T | null;
              },
              bind() {
                throw Error("Unused");
              },
            };
          },
          async first<T>() {
            return db.prepare(sql).get() as T | null;
          },
        };
      },
    },
  };
  return { db, env };
}
const visit = () =>
  new Request(origin + "/api/support-counter", {
    method: "POST",
    headers: { Origin: origin },
  });
it("starts at 20 and persists increments for different visitors", async () => {
  const { db, env } = setup();
  expect((await (await counter(visit(), env)).json()).count).toBe(20);
  expect((await (await counter(visit(), env)).json()).count).toBe(21);
  expect(
    (
      await (
        await counter(new Request(origin + "/api/support-counter"), env)
      ).json()
    ).count,
  ).toBe(21);
  expect(db.prepare("SELECT * FROM page_counters").all()).toEqual([
    { id: "support", value: 21 },
  ]);
  db.close();
});
it("counts concurrent requests atomically", async () => {
  const { db, env } = setup();
  await Promise.all(Array.from({ length: 20 }, () => counter(visit(), env)));
  expect(db.prepare("SELECT value FROM page_counters").get()?.value).toBe(39);
  db.close();
});
it("rejects cross-origin increments and unsupported methods", async () => {
  const { db, env } = setup();
  expect(
    (
      await counter(
        new Request(origin + "/api/support-counter", {
          method: "POST",
          headers: { Origin: "https://evil.test" },
        }),
        env,
      )
    ).status,
  ).toBe(403);
  expect(
    (
      await counter(
        new Request(origin + "/api/support-counter", { method: "DELETE" }),
        env,
      )
    ).status,
  ).toBe(405);
  expect(db.prepare("SELECT * FROM page_counters").all()).toEqual([]);
  db.close();
});
it("reports database failure without returning a fabricated count", async () => {
  const { db, env } = setup();
  db.close();
  const response = await counter(visit(), env);
  expect(response.status).toBe(503);
  expect(response.headers.get("cache-control")).toBe("no-store");
});
