import { uniqueRecipients, type Member } from "./model";
export type RecipientKind = "to" | "cc" | "bcc";
export function canCompose() {
  const item = Office.context.mailbox?.item as
    Office.MessageCompose | undefined;
  return (
    !!item &&
    ["to", "cc", "bcc"].every(
      (k) => typeof (item as any)[k]?.addAsync === "function",
    ) &&
    Office.context.requirements.isSetSupported("Mailbox", "1.3")
  );
}
export async function addRecipients(kind: RecipientKind, members: Member[]) {
  if (!canCompose())
    throw Error("メール作成画面で使用 / Open a compose message");
  const item = Office.context.mailbox.item as Office.MessageCompose;
  const existing = (
    await Promise.all(
      (["to", "cc", "bcc"] as const).map(
        (k) =>
          new Promise<Office.EmailAddressDetails[]>((resolve, reject) =>
            item[k].getAsync((r) =>
              r.status === Office.AsyncResultStatus.Succeeded
                ? resolve(r.value)
                : reject(Error(r.error.message)),
            ),
          ),
      ),
    )
  )
    .flat()
    .map((x) => x.emailAddress);
  const recipients = uniqueRecipients(members, existing);
  if (Office.context.mailbox.item !== item || !canCompose())
    throw Error(
      "メールが切り替わりました。現在のメールで選択し直してください / Message changed. Select recipients again for the current message.",
    );
  if (!recipients.length) return 0;
  if (recipients.length > 100)
    throw Error(
      "一度に追加できるのは100件までです / Select up to 100 new recipients",
    );
  await new Promise<void>((resolve, reject) =>
    item[kind].addAsync(
      recipients.map((m) => ({ displayName: m.name, emailAddress: m.email })),
      (r) =>
        r.status === Office.AsyncResultStatus.Succeeded
          ? resolve()
          : reject(Error(r.error.message)),
    ),
  );
  return recipients.length;
}
