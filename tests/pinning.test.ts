import { beforeEach, it, expect, vi } from "vitest";
import { watchComposeContext } from "../src/pinning";
function setup(supported = true, deferred = false) {
  let eventHandler: (() => void) | undefined;
  let complete: ((result: any) => void) | undefined;
  const mailbox = {
    item: {
      to: { addAsync() {} },
      cc: { addAsync() {} },
      bcc: { addAsync() {} },
    } as any,
    addHandlerAsync: vi.fn(
      (_event: unknown, handler: () => void, callback: any) => {
        eventHandler = handler;
        complete = callback;
        if (!deferred) callback({ status: "succeeded" });
      },
    ),
    removeHandlerAsync: vi.fn(),
  };
  vi.stubGlobal("Office", {
    AsyncResultStatus: { Succeeded: "succeeded" },
    EventType: { ItemChanged: "itemChanged" },
    context: {
      mailbox,
      requirements: {
        isSetSupported: (_name: string, version: string) =>
          version === "1.3" || supported,
      },
    },
  });
  return {
    mailbox,
    fire: () => eventHandler?.(),
    complete: (result: any) => complete?.(result),
  };
}
beforeEach(() => vi.unstubAllGlobals());
it("tracks new compose messages, missing items, and read mode", () => {
  const { mailbox, fire } = setup();
  const changed = vi.fn(),
    failed = vi.fn();
  const stop = watchComposeContext(changed, failed);
  fire();
  expect(changed).toHaveBeenLastCalledWith(true);
  mailbox.item = null;
  fire();
  expect(changed).toHaveBeenLastCalledWith(false);
  mailbox.item = { to: [] };
  fire();
  expect(changed).toHaveBeenLastCalledWith(false);
  stop();
  stop();
  fire();
  expect(changed).toHaveBeenCalledTimes(3);
  expect(mailbox.removeHandlerAsync).toHaveBeenCalledTimes(1);
  expect(mailbox.removeHandlerAsync).toHaveBeenCalledWith("itemChanged");
  expect(failed).not.toHaveBeenCalled();
});
it("keeps older hosts usable without pin event registration", () => {
  const { mailbox } = setup(false);
  watchComposeContext(vi.fn(), vi.fn())();
  expect(mailbox.addHandlerAsync).not.toHaveBeenCalled();
});
it("removes a handler whose registration finishes after unmount", () => {
  const { mailbox, complete, fire } = setup(true, true);
  const changed = vi.fn();
  const stop = watchComposeContext(changed, vi.fn());
  stop();
  complete({ status: "succeeded" });
  fire();
  expect(mailbox.removeHandlerAsync).toHaveBeenCalledTimes(1);
  expect(changed).not.toHaveBeenCalled();
});
it("reports registration failure instead of silently retaining the old draft", () => {
  const { complete } = setup(true, true);
  const failed = vi.fn();
  watchComposeContext(vi.fn(), failed);
  complete({ status: "failed" });
  expect(failed).toHaveBeenCalledOnce();
});
