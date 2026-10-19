import { beforeEach, it, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  silent: vi.fn(),
  popup: vi.fn(),
  factory: vi.fn(),
  accounts: vi.fn(),
}));
vi.mock("@azure/msal-browser", () => ({
  createNestablePublicClientApplication: mocks.factory,
  InteractionRequiredAuthError: class extends Error {},
}));
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv("VITE_CLIENT_ID", "11111111-1111-1111-1111-111111111111");
  vi.stubGlobal("location", {
    href: "https://localhost:3002/index.html",
    origin: "https://localhost:3002",
  });
  vi.stubGlobal("Office", {
    context: {
      requirements: { isSetSupported: () => true },
      mailbox: { userProfile: { emailAddress: "user@example.com" } },
    },
  });
  mocks.accounts.mockReturnValue([{ username: "user@example.com" }]);
  mocks.factory.mockResolvedValue({
    getAllAccounts: mocks.accounts,
    acquireTokenSilent: mocks.silent,
    acquireTokenPopup: mocks.popup,
  });
});
it("gets Graph token silently through NAA", async () => {
  mocks.silent.mockResolvedValue({ accessToken: "mock" });
  const { token } = await import("../src/auth");
  expect(await token()).toBe("mock");
  expect(mocks.popup).not.toHaveBeenCalled();
});
it("uses organizations authority for all customer tenants, including legacy builds", async () => {
  vi.stubEnv("VITE_TENANT_ID", "a-previous-single-tenant-id");
  const { config } = await import("../src/auth");
  expect(config().auth.authority).toBe(
    "https://login.microsoftonline.com/organizations",
  );
  expect(config(true).auth.authority).toBe(
    "https://login.microsoftonline.com/organizations",
  );
});
it("selects the current Outlook account instead of another cached company account", async () => {
  const correct = { username: "USER@example.com" };
  mocks.accounts.mockReturnValue([
    { username: "other@another-company.example" },
    correct,
  ]);
  mocks.silent.mockResolvedValue({ accessToken: "current-account" });
  const { token } = await import("../src/auth");
  await token();
  expect(mocks.silent.mock.calls[0][0].account).toBe(correct);
});
it("prompts for first NAA account", async () => {
  mocks.accounts.mockReturnValue([]);
  mocks.silent.mockRejectedValue(Error("no account"));
  mocks.popup.mockResolvedValue({ accessToken: "interactive" });
  const { token } = await import("../src/auth");
  expect(await token()).toBe("interactive");
});
it("reports noninteraction NAA failures", async () => {
  mocks.silent.mockRejectedValue(Error("policy"));
  const { token } = await import("../src/auth");
  await expect(token()).rejects.toThrow("policy");
  expect(mocks.popup).not.toHaveBeenCalled();
});
it("does not operate with placeholder client ID", async () => {
  vi.stubEnv("VITE_CLIENT_ID", "00000000-0000-0000-0000-000000000000");
  const { token } = await import("../src/auth");
  await expect(token()).rejects.toThrow(/VITE_CLIENT_ID/);
});
it("uses Office Dialog fallback and accepts only matching nonce and origin", async () => {
  const handlers = new Map<string, (arg: any) => void>();
  const close = vi.fn();
  let opened = "";
  vi.stubGlobal("Office", {
    AsyncResultStatus: { Succeeded: "succeeded" },
    EventType: {
      DialogMessageReceived: "message",
      DialogEventReceived: "event",
    },
    context: {
      requirements: { isSetSupported: () => false },
      ui: {
        displayDialogAsync: (url: string, _options: unknown, cb: any) => {
          opened = url;
          cb({
            status: "succeeded",
            value: {
              close,
              addEventHandler: (name: string, handler: any) =>
                handlers.set(name, handler),
            },
          });
        },
      },
    },
  });
  const { token } = await import("../src/auth");
  const pending = token();
  const nonce = new URL(opened).searchParams.get("nonce");
  handlers.get("message")!({
    origin: "https://localhost:3002",
    message: JSON.stringify({
      nonce,
      token: "dialog-token",
      expires: Date.now() + 3600000,
    }),
  });
  expect(await pending).toBe("dialog-token");
  expect(await token()).toBe("dialog-token");
  expect(close).toHaveBeenCalledOnce();
  expect(mocks.factory).not.toHaveBeenCalled();
});
