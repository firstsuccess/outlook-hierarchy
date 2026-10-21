import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  search,
  selectMembers,
  validEmail,
  orgIds,
  type Book,
  type SearchField,
} from "./model";
import { createSettingsStore, type FileRef } from "./settings";
import { loadBook, resolveFile } from "./graph";
import { addRecipients, canCompose, type RecipientKind } from "./outlook";
import { watchComposeContext } from "./pinning";
import "./style.css";
function App() {
  const [ready, setReady] = useState(false),
    [host, setHost] = useState(false),
    [en, setEn] = useState(false),
    [ref, setRef] = useState<FileRef>(),
    [book, setBook] = useState<Book>(),
    [settings, setSettings] = useState(false),
    [url, setUrl] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [time, setTime] = useState<Date>(),
    [query, setQuery] = useState(""),
    [field, setField] = useState<SearchField>("all"),
    [org, setOrg] = useState(""),
    [desc, setDesc] = useState(true),
    [selected, setSelected] = useState(new Set<string>()),
    [closed, setClosed] = useState(new Set<string>()),
    [kind, setKind] = useState<RecipientKind>("to"),
    [compose, setCompose] = useState(false);
  const t = (ja: string, eng: string) => (en ? eng : ja);
  useEffect(() => {
    let live = true;
    let stopWatching = () => {};
    Office.onReady((info) => {
      if (!live) return;
      const valid = info.host === Office.HostType.Outlook;
      setHost(valid);
      setReady(true);
      if (valid) {
        const saved = createSettingsStore(Office.context.roamingSettings).get();
        setRef(saved);
        setUrl(saved?.webUrl ?? "");
        setSettings(!saved);
        setCompose(canCompose());
        stopWatching = watchComposeContext((isCompose) => {
          setCompose(isCompose);
          setSelected(new Set());
          setNotice("");
          setError("");
        }, setError);
        if (saved) void reload(saved);
      }
    });
    return () => {
      live = false;
      stopWatching();
    };
  }, []);
  async function work(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }
  async function reload(file: FileRef) {
    await work(async () => {
      const next = await loadBook(file);
      setBook(next);
      setSelected(new Set());
      setOrg("");
      setTime(new Date());
      setCompose(canCompose());
    });
  }
  const results = useMemo(
    () => (book ? search(book, query, field, org, desc) : []),
    [book, query, field, org, desc],
  );
  const tree = useMemo(() => {
    if (!book) return [];
    const children = new Map<string, Book["orgs"]>();
    for (const o of book.orgs) {
      const list = children.get(o.parent) ?? [];
      list.push(o);
      children.set(o.parent, list);
    }
    const output: {
      o: Book["orgs"][number];
      depth: number;
      hasChildren: boolean;
    }[] = [];
    const stack = (children.get("") ?? [])
      .slice()
      .reverse()
      .map((o) => ({ o, depth: 0 }));
    while (stack.length) {
      const row = stack.pop()!;
      const kids = children.get(row.o.id) ?? [];
      output.push({ ...row, hasChildren: kids.length > 0 });
      if (!closed.has(row.o.id))
        for (const o of kids.slice().reverse())
          stack.push({ o, depth: row.depth + 1 });
    }
    return output;
  }, [book, closed]);
  async function save() {
    await work(async () => {
      const file = await resolveFile(url);
      const next = await loadBook(file);
      await createSettingsStore(Office.context.roamingSettings).save(file);
      setBook(next);
      setSelected(new Set());
      setOrg("");
      setTime(new Date());
      setSettings(false);
      setRef(file);
      setNotice(t("設定を保存しました", "Settings saved"));
    });
  }
  return (
    <main aria-busy={busy}>
      <header>
        <div>
          <span className="eyebrow">OUTLOOK ADD-IN</span>
          <h1>{t("組織アドレス帳", "Hierarchy Address Book")}</h1>
        </div>
        <button onClick={() => setEn(!en)} aria-label="Language">
          {en ? "日本語" : "EN"}
        </button>
      </header>
      <nav>
        <button
          disabled={!host || busy}
          onClick={() => {
            setUrl(ref?.webUrl ?? "");
            setSettings(!settings);
          }}
        >
          {t("設定", "Settings")}
        </button>
        <button disabled={!ref || busy} onClick={() => ref && void reload(ref)}>
          {t("再読み込み", "Refresh")}
        </button>
      </nav>
      {host && (
        <details className="pin-help">
          <summary>
            {t("表示を維持する（ピン留め）", "Keep this pane open (pin)")}
          </summary>
          <p>
            {t(
              "メール作成画面でアドインを開き、Outlook側のパネル上部にあるピンを一度押してください。対応するOutlookでは、次のメール作成時も表示を維持できます。",
              "Open the add-in in a compose message and select the pin at the top of Outlook's pane once. Supported Outlook clients can then keep it open for subsequent messages.",
            )}
          </p>
          <p>
            {t(
              "Outlookの完全終了・再起動後の表示復元はOutlook側に依存します。表示されない場合は作成画面から開き直してください。Excelの参照設定は保存されます。",
              "Restoring the pane after restarting Outlook depends on the host. If it is hidden, reopen it from a compose message. Your Excel reference settings are saved.",
            )}
          </p>
        </details>
      )}
      {!ready && <p>{t("Outlookを確認中…", "Waiting for Outlook…")}</p>}
      {ready && !host && (
        <p className="banner">
          {t(
            "Outlookのメール作成画面からアドインを起動してください。",
            "Open this add-in from an Outlook compose message.",
          )}
        </p>
      )}
      {busy && (
        <p role="status">
          {t(
            "処理中… 認証画面が出た場合はサインインしてください。",
            "Working… Sign in if prompted.",
          )}
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="success" role="status">
          {notice}
        </p>
      )}
      {settings && (
        <section>
          <h2>{t("Excelファイルの設定", "Excel file settings")}</h2>
          <label htmlFor="url">
            {t(
              "SharePoint / OneDrive for BusinessのExcel URL",
              "Excel URL on SharePoint / OneDrive for Business",
            )}
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://contoso.sharepoint.com/…"
          />
          <p className="muted">
            {t(
              "Organizations・Membersテーブルを検証してから保存します。",
              "Organizations and Members tables are validated before saving.",
            )}
          </p>
          <button
            className="primary"
            disabled={busy || !host || !url.trim()}
            onClick={() => void save()}
          >
            {t("検証して保存", "Validate and save")}
          </button>
          {ref && (
            <>
              <button disabled={busy} onClick={() => setSettings(false)}>
                {t("キャンセル", "Cancel")}
              </button>
              <button
                disabled={busy}
                onClick={() =>
                  void work(async () => {
                    await createSettingsStore(
                      Office.context.roamingSettings,
                    ).save(undefined);
                    setRef(undefined);
                    setBook(undefined);
                    setSelected(new Set());
                    setUrl("");
                    setTime(undefined);
                    setSettings(true);
                  })
                }
              >
                {t("設定を初期化", "Reset settings")}
              </button>
            </>
          )}
        </section>
      )}
      {book && (
        <>
          <section>
            <label htmlFor="search">{t("社員を検索", "Search people")}</label>
            <div className="row">
              <input
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(
                  "氏名・部門・メールアドレス",
                  "Name, department, email",
                )}
              />
              <button
                onClick={() => {
                  setQuery("");
                  setOrg("");
                }}
              >
                {t("クリア", "Clear")}
              </button>
            </div>
            <select
              aria-label={t("検索対象", "Search field")}
              value={field}
              onChange={(e) => setField(e.target.value as SearchField)}
            >
              <option value="all">{t("全項目", "All fields")}</option>
              <option value="name">{t("氏名", "Name")}</option>
              <option value="org">{t("部門", "Department")}</option>
              <option value="email">{t("メールアドレス", "Email")}</option>
            </select>
            <label className="check">
              <input
                type="checkbox"
                checked={desc}
                onChange={(e) => setDesc(e.target.checked)}
              />
              {t("子部門を含む", "Include subdepartments")}
            </label>
          </section>
          <section>
            <h2>{t("組織", "Organization")}</h2>
            <button aria-pressed={!org} onClick={() => setOrg("")}>
              {t("すべての組織", "All organizations")}
            </button>
            <div
              className="tree"
              aria-label={t("組織階層", "Organization hierarchy")}
            >
              {tree.map(({ o, depth, hasChildren }) => (
                <div
                  className="treeRow"
                  key={o.id}
                  style={{ paddingInlineStart: `${depth * 16}px` }}
                >
                  {hasChildren ? (
                    <button
                      aria-expanded={!closed.has(o.id)}
                      aria-label={`${o.name} ${t("展開・折りたたみ", "expand/collapse")}`}
                      onClick={() => {
                        const next = new Set(closed);
                        next.has(o.id) ? next.delete(o.id) : next.add(o.id);
                        setClosed(next);
                      }}
                    >
                      {closed.has(o.id) ? "▸" : "▾"}
                    </button>
                  ) : (
                    <span className="spacer" />
                  )}
                  <button
                    className="org"
                    aria-pressed={org === o.id}
                    onClick={() => setOrg(o.id)}
                  >
                    {o.name}
                  </button>
                  <button
                    title={t("部門を一括選択", "Select department")}
                    onClick={() => {
                      const ids = orgIds(book, o.id, desc);
                      setSelected((s) =>
                        selectMembers(
                          s,
                          book.members.filter((m) => ids.has(m.org)),
                          true,
                        ),
                      );
                    }}
                  >
                    ＋
                  </button>
                </div>
              ))}
            </div>
          </section>
          <section>
            <div className="row">
              <h2>
                {t("社員", "People")} · {results.length}
              </h2>
              <button
                onClick={() =>
                  setSelected((s) => selectMembers(s, results, true))
                }
              >
                {t("全選択", "Select all")}
              </button>
              <button onClick={() => setSelected(new Set())}>
                {t("選択解除", "Clear selection")}
              </button>
            </div>
            {!results.length && (
              <p>{t("該当する社員がいません", "No matching people")}</p>
            )}
            <div className="people">
              {results.map((m) => (
                <label className="person" key={m.key}>
                  <input
                    type="checkbox"
                    disabled={!validEmail(m.email)}
                    checked={selected.has(m.key)}
                    onChange={(e) =>
                      setSelected((s) =>
                        selectMembers(s, [m], e.target.checked),
                      )
                    }
                  />
                  <span>
                    <strong>{m.name}</strong>
                    <small>
                      {book.orgs.find((o) => o.id === m.org)?.name} ·{" "}
                      {m.position}
                    </small>
                    <small>{m.email || t("メール未登録", "No email")}</small>
                    {m.contact && <small>{m.contact}</small>}
                    {!validEmail(m.email) && (
                      <small className="error">
                        {t("宛先追加不可", "Invalid email")}
                      </small>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </section>
          <footer>
            <strong>
              {t("選択", "Selected")}:{" "}
              {
                new Set(
                  book.members
                    .filter((m) => selected.has(m.key))
                    .map((m) => m.id),
                ).size
              }{" "}
              {t("人", "people")}
            </strong>
            <div className="row">
              <select
                aria-label={t("宛先種別", "Recipient field")}
                value={kind}
                disabled={busy}
                onChange={(e) => setKind(e.target.value as RecipientKind)}
              >
                <option value="to">To</option>
                <option value="cc">Cc</option>
                <option value="bcc">Bcc</option>
              </select>
              <button
                className="primary"
                disabled={busy || !selected.size || !compose}
                onClick={() =>
                  void work(async () => {
                    const n = await addRecipients(
                      kind,
                      book.members.filter((m) => selected.has(m.key)),
                    );
                    setNotice(
                      t(
                        `${n}件を追加しました（重複は除外）`,
                        `${n} recipients added (duplicates excluded)`,
                      ),
                    );
                  })
                }
              >
                {t("宛先に追加", "Add recipients")}
              </button>
            </div>
            {!compose && (
              <small>
                {t("メール作成モードが必要です", "Compose mode required")}
              </small>
            )}
            {time && (
              <small>
                {t("最終読み込み", "Last loaded")}:{" "}
                {time.toLocaleString(en ? "en-US" : "ja-JP")}
              </small>
            )}
          </footer>
        </>
      )}
      <p className="provider-credit">
        <span>By First Success G.K.</span>{" "}
        <a href="https://first-success.com" target="_blank" rel="noopener noreferrer">
          https://first-success.com
        </a>
      </p>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
