import {
  createNestablePublicClientApplication,
  InteractionRequiredAuthError,
  type IPublicClientApplication,
  type Configuration,
} from "@azure/msal-browser";
export const scopes = ["https://graph.microsoft.com/Files.ReadWrite"];
export const redirectUri =
  import.meta.env.VITE_REDIRECT_URI || new URL("auth.html", location.href).href;
export function config(dialog = false): Configuration {
  const clientId = import.meta.env.VITE_CLIENT_ID;
  if (!clientId || clientId === "00000000-0000-0000-0000-000000000000")
    throw Error(
      "Entra IDのVITE_CLIENT_IDを設定してください / Configure VITE_CLIENT_ID",
    );
  return {
    auth: {
      clientId,
      // One publisher-owned registration accepts work/school accounts from any tenant.
      authority: "https://login.microsoftonline.com/organizations",
      redirectUri,
      navigateToLoginRequestUrl: false,
    },
    cache: { cacheLocation: dialog ? "sessionStorage" : "memoryStorage" },
  };
}
let app: Promise<IPublicClientApplication> | undefined;
let cached: { token: string; expires: number } | undefined;
export async function token(force = false): Promise<string> {
  if (!force && cached && cached.expires > Date.now() + 120000)
    return cached.token;
  config();
  if (Office.context.requirements.isSetSupported("NestedAppAuth", "1.1")) {
    app ??= createNestablePublicClientApplication(config());
    const client = await app;
    const loginHint = Office.context.mailbox.userProfile.emailAddress;
    const account = client
      .getAllAccounts()
      .find(
        (candidate) =>
          candidate.username?.toLowerCase() === loginHint.toLowerCase(),
      );
    const request = {
      scopes,
      account,
      loginHint,
    };
    try {
      return (
        await client.acquireTokenSilent({ ...request, forceRefresh: force })
      ).accessToken;
    } catch (e) {
      if (!(e instanceof InteractionRequiredAuthError) && account) throw e;
      return (await client.acquireTokenPopup(request)).accessToken;
    }
  }
  return new Promise((resolve, reject) => {
    const nonce = crypto.randomUUID();
    const url = new URL("auth.html", location.href);
    url.searchParams.set("nonce", nonce);
    Office.context.ui.displayDialogAsync(
      url.href,
      { height: 65, width: 40, displayInIframe: false },
      (r) => {
        if (r.status !== Office.AsyncResultStatus.Succeeded) {
          reject(Error(r.error.message));
          return;
        }
        const dialog = r.value;
        let settled = false;
        const fail = (message: string) => {
          if (settled) return;
          settled = true;
          dialog.close();
          reject(Error(message));
        };
        const timer = setTimeout(
          () => fail("認証タイムアウト / Sign-in timed out"),
          300000,
        );
        dialog.addEventHandler(
          Office.EventType.DialogMessageReceived,
          (arg) => {
            if (!("message" in arg)) return;
            try {
              if (arg.origin && arg.origin !== location.origin)
                throw Error("Invalid dialog origin");
              const data = JSON.parse(arg.message);
              if (data.nonce !== nonce) throw Error("Invalid dialog nonce");
              if (data.error) throw Error(data.error);
              if (
                typeof data.token !== "string" ||
                !Number.isFinite(data.expires)
              )
                throw Error("Invalid authentication response");
              cached = { token: data.token, expires: data.expires };
              settled = true;
              clearTimeout(timer);
              dialog.close();
              resolve(data.token);
            } catch (e) {
              clearTimeout(timer);
              fail(e instanceof Error ? e.message : "Sign-in error");
            }
          },
        );
        dialog.addEventHandler(Office.EventType.DialogEventReceived, () => {
          clearTimeout(timer);
          fail("認証画面が閉じられました / Sign-in closed");
        });
      },
    );
  });
}
