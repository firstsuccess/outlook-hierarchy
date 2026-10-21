import { canCompose } from "./outlook";

/** Re-read Office's current item instead of retaining a draft across ItemChanged. */
export function watchComposeContext(
  changed: (compose: boolean) => void,
  failed: (message: string) => void,
): () => void {
  const mailbox = Office.context.mailbox;
  let disposed = false;
  let registered = false;
  const handler = () => {
    if (!disposed) changed(canCompose());
  };
  // Mailbox removal is per event type (unlike document APIs, no handler option).
  const remove = () => mailbox.removeHandlerAsync(Office.EventType.ItemChanged);
  if (!Office.context.requirements.isSetSupported("Mailbox", "1.5"))
    return () => {};
  mailbox.addHandlerAsync(Office.EventType.ItemChanged, handler, (result) => {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      registered = true;
      if (disposed) remove();
    } else if (!disposed) {
      failed(
        "メール切替の監視を開始できませんでした。アドインを開き直してください / Reopen the add-in: item-change monitoring failed.",
      );
    }
  });
  return () => {
    if (disposed) return;
    disposed = true;
    if (registered) remove();
  };
}
