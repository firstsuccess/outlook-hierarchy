import { it, expect, vi } from "vitest";
import { createSettingsStore, settingKey } from "../src/settings";
const a = {
    driveId: "drive",
    itemId: "a",
    webUrl: "https://x.sharepoint.com/a.xlsx",
  },
  b = { ...a, itemId: "b" };
function mock(fail = false) {
  const data = new Map();
  vi.stubGlobal("Office", { AsyncResultStatus: { Succeeded: "succeeded" } });
  return {
    data,
    store: createSettingsStore({
      get: (k: string) => data.get(k),
      set: (k: string, v: unknown) => data.set(k, v),
      remove: (k: string) => data.delete(k),
      saveAsync: (cb: any) =>
        cb(
          fail
            ? { status: "failed", error: { message: "quota" } }
            : { status: "succeeded" },
        ),
    } as unknown as Office.RoamingSettings),
  };
}
it("saves, changes and resets reference only", async () => {
  const { store, data } = mock();
  await store.save(a);
  expect(store.get()).toEqual(a);
  await store.save(b);
  expect(store.get()?.itemId).toBe("b");
  expect(Object.keys(data.get(settingKey))).toEqual([
    "driveId",
    "itemId",
    "webUrl",
  ]);
  await store.save(undefined);
  expect(store.get()).toBeUndefined();
});
it("keeps previous setting on save failure", async () => {
  const { store, data } = mock(true);
  data.set(settingKey, a);
  await expect(store.save(b)).rejects.toThrow("quota");
  expect(store.get()).toEqual(a);
  await expect(store.save(undefined)).rejects.toThrow();
  expect(store.get()).toEqual(a);
});
