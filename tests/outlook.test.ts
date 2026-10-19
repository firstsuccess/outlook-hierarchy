import { beforeEach, it, expect, vi } from "vitest";
import { addRecipients, canCompose } from "../src/outlook";
import type { Member } from "../src/model";
const member = (email: string): Member => ({
  id: email,
  key: email,
  name: "架空社員",
  org: "root",
  position: "",
  contact: "",
  order: 1,
  active: true,
  email,
});
function office() {
  const add = vi.fn((_r: any, cb: any) => cb({ status: "succeeded" }));
  const field = (emails: string[]) => ({
    getAsync: (cb: any) =>
      cb({
        status: "succeeded",
        value: emails.map((emailAddress) => ({ emailAddress })),
      }),
    addAsync: add,
  });
  vi.stubGlobal("Office", {
    AsyncResultStatus: { Succeeded: "succeeded" },
    context: {
      requirements: { isSetSupported: () => true },
      mailbox: {
        item: {
          to: field(["old@example.com"]),
          cc: field(["existing@example.com"]),
          bcc: field([]),
        },
      },
    },
  });
  return add;
}
beforeEach(() => vi.unstubAllGlobals());
it("appends only new unique valid recipients to selected field", async () => {
  const add = office();
  expect(
    await addRecipients("bcc", [
      member("old@example.com"),
      member("EXISTING@example.com"),
      member("new@example.com"),
      member("NEW@example.com"),
      member("bad"),
    ]),
  ).toBe(1);
  expect(add.mock.calls[0][0]).toEqual([
    { displayName: "架空社員", emailAddress: "new@example.com" },
  ]);
});
it("does not add when all are duplicates", async () => {
  const add = office();
  expect(await addRecipients("to", [member("old@example.com")])).toBe(0);
  expect(add).not.toHaveBeenCalled();
});
it("rejects read mode", async () => {
  office();
  (Office.context.mailbox as any).item = { to: [] };
  expect(canCompose()).toBe(false);
  await expect(addRecipients("to", [])).rejects.toThrow(/compose/);
});
it("enforces 100-recipient per call limit", async () => {
  const add = office();
  await expect(
    addRecipients(
      "cc",
      Array.from({ length: 101 }, (_, i) => member(`${i}@example.com`)),
    ),
  ).rejects.toThrow(/100/);
  expect(add).not.toHaveBeenCalled();
});
it("shows Office errors without overwriting", async () => {
  const add = office();
  add.mockImplementation((_r: any, cb: any) =>
    cb({ status: "failed", error: { message: "recipient limit" } }),
  );
  await expect(
    addRecipients("to", [member("new@example.com")]),
  ).rejects.toThrow("recipient limit");
});
