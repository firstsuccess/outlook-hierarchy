import { token } from "./auth";
import { tableRows, parseBook, orgColumns, memberColumns } from "./model";
import type { FileRef } from "./settings";
const base = "https://graph.microsoft.com/v1.0";
export function validateUrl(input: string) {
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    throw Error("有効なHTTPS URLを入力 / Enter a valid HTTPS URL");
  }
  if (
    u.protocol !== "https:" ||
    u.username ||
    u.password ||
    !/(^|\.)sharepoint\.com$/i.test(u.hostname)
  )
    throw Error(
      "SharePoint / OneDrive for Business の sharepoint.com HTTPS URLを使用 / Use a sharepoint.com HTTPS URL",
    );
  u.hash = "";
  return u.href;
}
export function shareId(url: string) {
  return (
    "u!" +
    btoa(String.fromCharCode(...new TextEncoder().encode(url)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
  );
}
export async function graph(path: string): Promise<any> {
  const url = path.startsWith("https:") ? path : base + path;
  const parsed = new URL(url);
  if (
    parsed.origin !== "https://graph.microsoft.com" ||
    !parsed.pathname.startsWith("/v1.0/")
  )
    throw Error("Invalid Graph pagination URL");
  for (let attempt = 0; attempt < 4; attempt++) {
    const access = await token(attempt === 1);
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${access}` },
      signal: AbortSignal.timeout(45000),
    });
    if (r.ok) return r.json();
    if (r.status === 401 && attempt === 0) continue;
    if ((r.status === 429 || r.status === 503) && attempt < 3) {
      const seconds = Number(r.headers.get("Retry-After") || 2 ** attempt);
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          Math.min(30, Number.isFinite(seconds) ? seconds : 2) * 1000,
        ),
      );
      continue;
    }
    throw Error(
      `Microsoft Graph ${r.status}: ${r.status === 403 ? "Excelの権限・同意を確認 / Check file access and consent" : r.status === 404 ? "ファイルまたはテーブルがありません / File or table not found" : "取得失敗 / Request failed"}`,
    );
  }
  throw Error("Graph retry limit");
}
async function collection(path: string) {
  const values: any[] = [];
  let next: string | undefined = path;
  const seen = new Set<string>();
  while (next) {
    if (seen.has(next)) throw Error("Invalid pagination loop");
    seen.add(next);
    const page = await graph(next);
    if (!Array.isArray(page.value)) throw Error("Invalid Graph collection");
    values.push(...page.value);
    next = page["@odata.nextLink"];
  }
  return values;
}
export async function resolveFile(input: string): Promise<FileRef> {
  const url = validateUrl(input);
  const item = await graph(`/shares/${shareId(url)}/driveItem`);
  if (
    !item.file ||
    !item.name?.toLowerCase().endsWith(".xlsx") ||
    !item.parentReference?.driveId ||
    !item.id
  )
    throw Error(
      "アクセス可能な .xlsx ファイルが必要 / An accessible .xlsx file is required",
    );
  return {
    driveId: item.parentReference.driveId,
    itemId: item.id,
    webUrl: item.webUrl,
  };
}
export async function loadBook(ref: FileRef) {
  const root = `/drives/${encodeURIComponent(ref.driveId)}/items/${encodeURIComponent(ref.itemId)}/workbook`;
  const tables = await collection(root + "/tables");
  async function read(name: string, required: string[]) {
    const table = tables.find((t) => t.name === name);
    if (!table) throw Error(`テーブルがありません / Missing table: ${name}`);
    const path = root + `/tables/${encodeURIComponent(table.id)}`;
    const header = await graph(path + "/headerRowRange");
    const rows = await collection(path + "/rows?$top=500");
    return tableRows(
      header.values,
      rows.flatMap((r) => r.values),
      required,
    );
  }
  const [orgs, members] = await Promise.all([
    read("Organizations", orgColumns),
    read("Members", memberColumns),
  ]);
  return parseBook(orgs, members);
}
