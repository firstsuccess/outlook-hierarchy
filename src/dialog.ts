import { PublicClientApplication } from "@azure/msal-browser";
import { config, scopes } from "./auth";
async function run() {
  await Office.onReady();
  const incoming = new URL(location.href).searchParams.get("nonce");
  if (incoming) sessionStorage.setItem("hab.nonce", incoming);
  const nonce = sessionStorage.getItem("hab.nonce");
  try {
    const app = new PublicClientApplication(config(true));
    await app.initialize();
    const result = await app.handleRedirectPromise();
    if (result) {
      sessionStorage.removeItem("hab.nonce");
      await app.clearCache();
      Office.context.ui.messageParent(
        JSON.stringify({
          nonce,
          token: result.accessToken,
          expires: result.expiresOn?.getTime() ?? Date.now() + 300000,
        }),
        { targetOrigin: location.origin },
      );
    } else {
      await app.acquireTokenRedirect({ scopes });
    }
  } catch {
    Office.context.ui.messageParent(
      JSON.stringify({
        nonce,
        error: "Microsoft 365認証に失敗しました / Authentication failed",
      }),
      { targetOrigin: location.origin },
    );
  }
}
void run();
