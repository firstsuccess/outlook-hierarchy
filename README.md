<a id="japanese"></a>

# もんじゃOutlook階層型アドレス帳

[日本語](#japanese) | [English](#english) | [简体中文](#chinese)

Microsoft 365企業向けに、Web版・PC版Outlookのメール作成画面で利用できる組織アドレス帳です。Excel Onlineで管理する組織ツリーから社員を検索・選択し、To / Cc / Bccへ追加できます。

提供：ファーストサクセス合同会社。サイトの導入説明は[導入・サポート](public/support.html)、データ処理の説明は[データの取り扱い](public/privacy.html)を参照してください。HTMLページは公開サイトまたは開発サーバーで閲覧できます。

## 利用開始：管理者と利用者の作業

### 管理者：アドインの配布とExcelの準備

1. 公開サイトから公開用の `manifest.xml` をダウンロードし、Microsoft 365管理センターの「設定 → 統合アプリ → カスタムアプリをアップロード」から登録します。
2. 対象のユーザー・グループ、または組織全体に配布します。一括配布された利用者による個別のカスタムアドイン登録は不要です。
3. [Excelテンプレート](samples/OrganizationAddressBook.xlsx)の組織・社員情報を編集し、SharePointまたはOneDrive for Businessへアップロードします。テーブル名と列見出しは変更しないでください。
4. 利用者にファイルへのアクセス権を付与し、「共有 → リンクのコピー」で取得したExcel共有URLを案内します。組織のポリシーに従ってMicrosoft Graphの委任アクセス許可に同意します。アドイン配布と認証同意は別の手続きです。

### 各利用者：初回のExcelリンク設定

**一括配布だけではExcelのリンクは設定されません。各利用者が初回起動時に設定します。** 同じアドレス帳を利用する場合は、全員が同じExcel共有URLを指定できます。

1. Outlookで新規メールを作成し、「アプリ」から組織アドレス帳を開き、自社のMicrosoft 365職場アカウントでサインインします。
2. 「設定 → Excelファイルの設定」にExcel共有URLを貼り付け、「検証して保存」を押します。サポートサイトやマニフェストのURLではありません。
3. 表示された組織ツリーから部門を選択し、社員を検索・複数選択してTo / Cc / Bccへ追加します。
4. Excel更新後は「再読み込み」を押します。必要に応じてOutlookのパネル上部のピンを押すと、対応するOutlookで次のメール作成時も表示を維持できます。

リンクを知っているだけでは利用できず、本人にファイルのアクセス権が必要です。設定は利用者ごとに保存され、同じメールボックス・同じアドインIDの対応するOutlook間で共有されます。他の利用者には自動配布されません。アドイン本体のUIは日本語・英語、サポートサイトは日本語・英語・簡体字中国語です。

## 技術概要

Excel Onlineで管理する任意の組織階層から社員を検索・複数選択し、Outlookの作成メールのTo / Cc / Bccへ追加するMITライセンスのOffice Web Add-inです。React + TypeScript + Viteの静的SPAです。本番のNode.js常駐、SQL Server、独自API・DBは不要です。

## 開発と導入

必要条件: Windows 11、Node.js 24 / npm 11、Exchange Onlineの職場アカウント、SharePoint OnlineまたはOneDrive for Business。Outlook.com、Gmail、オンプレミスExchange、IE WebViewは対象外です。

```powershell
cd C:\outlook-hierarchy
npm ci
Copy-Item .env.example .env
# .envに提供者のマルチテナントEntraアプリのClient IDを入力
npm run cert
npm run dev
```

`npm run cert` はlocalhost用の6か月有効な開発証明書を作成し、現在ユーザーのMy / Root証明書ストアへ登録します。秘密鍵とパスフレーズはGit対象外の `.certs/` に保存します。証明書の信頼確認が表示された場合は内容を確認してください。既存IISや他のアプリの設定を変更する必要はありません。localhost:3002を使います。競合時は `npm run dev -- --port 3003` とし、.envのリダイレクトURI、EntraのSPA URI、マニフェストを同じポートに更新してください。strictPortにより勝手に別ポートへ移動しません。

## Entra ID設定（シークレット不要）

1. **提供者が一度だけ**Microsoft Entra管理センター → アプリの登録 → 新規登録。「**任意の組織ディレクトリ内のアカウント（任意のMicrosoft Entra IDテナント — マルチテナント）**」を選びます。signInAudienceは `AzureADMultipleOrgs`。既存登録の場合は「認証 → サポートされているアカウントの種類」で変更してください。
2. 提供者のアプリケーション（クライアント）IDを `.env` の `VITE_CLIENT_ID` に設定します。**顧客企業のテナントID・クライアントIDの入力や顧客ごとのビルドは不要です。** authorityはコードで `https://login.microsoftonline.com/organizations` に固定しています。旧VITE_TENANT_IDは使用しません。クライアントシークレットは作成しません。
3. 認証 → プラットフォームを追加 → **シングルページアプリケーション（SPA）** に次のURIを登録します。
   - NAA: `brk-multihub://localhost:3002`
   - DialogのAuthorization Code + PKCE: `https://localhost:3002/auth.html`
4. APIのアクセス許可 → Microsoft Graph → **委任** `Files.ReadWrite`。組織の同意ポリシーに従って管理者同意を行います。Application権限、Mail.ReadWrite、Directory.Read.All、Sites.ReadWrite.Allは要求しません。
5. 本番では `brk-multihub://公開ホスト名` と `https://公開ホスト名/配置パス/auth.html` を追加します。broker URIはホストとポートのみ（サブパス不可）。`.env` のVITE_REDIRECT_URIも完全一致させ、再ビルドします。

ExcelテーブルのGETでもWorkbook APIの最小委任権限は `Files.ReadWrite` です。アプリ自身はGETしか実行しませんが、同意する権限は書き込みを含みます。ファイルACLをMicrosoft 365側で制限してください。利用者がアクセスできないファイルへ権限を付与する機能はありません。共有範囲やテナントポリシーにより追加同意や編集権限が必要になる場合があります。まず同一テナント内の編集可能なサンプルで検証してください。

本製品は不特定多数のMicrosoft 365企業向けです。利用企業は共通アドインを導入し、自社の職場アカウントでサインインし、自社ExcelのURLを指定します。各企業のポリシーにより管理者同意・アドイン配布承認が必要です。詳細は[複数企業への配布手順](docs/DISTRIBUTION.md)。

## Outlookへの登録

サポートサイトは上部の言語ドロップダウンで日本語・英語・簡体字中国語を切り替えられます。選択言語はブラウザーに保存され、`?lang=en` / `?lang=zh-CN` のURLでも指定できます。これはサポート説明の言語で、アドイン本体のUIは日本語・英語です。

v1.1.0.0から作成画面のピン留めに対応しています。最新版の公開マニフェストを登録し、作成メールからアドインを開いてOutlookのピンアイコンを一度押してください。再起動後の自動表示はOutlook側の復元動作に依存します。[ピン留めの操作・制約](docs/PINNING.md)

```powershell
npm run manifest
npm run validate:manifest
```

Web / New / Classic共通の `manifest.xml` を生成します。開発サーバーを起動して `https://localhost:3002/` にアクセスできることを確認します。

- **Outlook Web**: 職場アカウントで [アドイン管理](https://aka.ms/olksideload) を開き、「個人用アドイン / My add-ins」→「カスタムアドインの追加」→「ファイルから追加」でmanifest.xmlを登録します。
- **New Outlook for Windows**: 同じメールボックスで上記のアドイン管理に登録します。メールを新規作成し、リボンの「アプリ」から組織アドレス帳を選択します。
- **Classic Outlook（Microsoft 365）**: 同じメールボックスで登録後、Outlookを再起動し、新規メールのリボンまたは「すべてのアプリ」から起動します。登録UIは更新チャネル・組織ポリシーにより異なるため、見つからない場合は上記Web管理画面を使います。

組織配布はMicrosoft 365管理センターの「設定 → 統合アプリ」からXMLマニフェストをアップロードし、対象ユーザーに配布します。サイドロードが禁止されている場合は管理者配布が必要です。読み取り画面にはボタンを登録しません。

## Excelの準備と指定

1. `samples/OrganizationAddressBook.xlsx` をSharePointのドキュメントライブラリまたはOneDrive for Businessにアップロードします。架空データ・example.comメールのみです。
2. Excel Onlineで開き、正式なテーブル名が `Organizations` / `Members` であることを確認します。シート名ではなくテーブル名で取得します。
3. 共有 → リンクのコピーから、本人がアクセスできるHTTPSリンクを取得します。個人用onedrive.live.com、短縮リンク、サブドメインがsharepoint.comでないクラウドは対象外です。
4. 初回の設定画面にURLを貼り付け、「検証して保存」。必要に応じてサインイン・同意します。
5. 部門を選び、社員のチェックボックスを選択してTo / Cc / Bccへ追加します。「子部門を含む」は部門表示・部門検索・部門一括選択に共通で適用されます。＋で部門全体を選択できます。「全選択」は現在表示中の検索結果です。
6. 更新後は「再読み込み」。URL変更は設定メニューから。検証または保存失敗では以前の参照情報を維持します。「設定を初期化」はRoamingSettingsの参照を削除して初期画面に戻します。

### テーブル形式

| テーブル | 必須列 |
|---|---|
| Organizations | OrganizationID, OrganizationName, ParentOrganizationID, DisplayOrder, IsActive |
| Members | MemberID, DisplayName, Email, Contact, OrganizationID, Position, DisplayOrder, IsActive |

IDは文字列を推奨し、先頭ゼロがある場合はExcelで文字列にします。ルート組織はParentOrganizationIDを空欄にします。DisplayOrderは有限数値、IsActiveはTRUE/FALSEまたは1/0。OrganizationsのIDは一意、Membersは `(MemberID, OrganizationID)` の組み合わせが一意です。同じMemberIDを別所属の行に繰り返すことで兼務を表します。無効組織は子孫も非表示、無効社員も非表示。無効行も構造検証の対象です。メールの空欄・形式不正は表示しますが選択不可です。全空行は無視します。

階層生成・検証は反復処理で、深さの固定上限は設けません。運用上はExcel APIの応答サイズとTask Paneの描画性能に依存します。ページングで全行を取得します。複数API呼び出しの間にExcelが編集されると不整合を検出する場合があるため、編集終了後に再読み込みしてください。将来所属を独立テーブルに分ける場合はgraph.tsの取得・model.tsの正規化を変更し、UIでは同じMember型を維持できます。

## 静的公開

公開サポートサイトのアクセスカウンターは、利用者承認に基づきSites管理のWorker/D1を使用します。社員情報は保存せず、初回20からの数値のみ保存します。Sitesへの更新は `npm run build:site` を使用してください。一般の静的ビルドは引き続き `npm run build` です。[カウンター構成](docs/SITES_COUNTER.md)

```powershell
npm run typecheck
npm test
npm run build
npm run manifest -- https://addressbook.example.com/
```

`dist/` の内容をHTTPS静的ホストへ配置し、生成したmanifest.xmlを登録します。マニフェストはdistの外で配布しても構いません。ホスト変更時も同じアドインIDを維持すると既存設定の継続利用に役立ちます。開発用3002ポートは本番で不要です。環境変数はビルド時に埋め込まれるので公開先ごとに再ビルドが必要です。

- **IIS 10**: 既存サイトを変更せず、管理者が新規の専用HTTPSサイト・ホスト名を作成しdistを配置します。静的コンテンツ機能と有効なTLS証明書が必要です。Node/iisnode/URL Rewriteは不要です。`index.html` / `auth.html` を直接配信し、認証ページをindexへリライトしないでください。既存会計・固定資産サイト、アプリプール、ポート、バインディングには触れません。
- **Cloudflare Pages**: ビルドコマンド `npm run build`、出力 `dist`、Node 24。公開環境変数を設定します。OAuthコールバックのauth.htmlが直接開くことを確認します。
- **Azure Static Web Apps**: Vite静的ビルドとしてdistを公開します。独自Functions/APIは不要。auth.htmlを認証リダイレクトやSPAフォールバックの対象にしないでください。

サブパス配置では例 `npm run manifest -- https://host.example.com/addressbook/` とし、VITE_REDIRECT_URIも `/addressbook/auth.html` にします。フレーム埋め込みを拒否する `X-Frame-Options: DENY/SAMEORIGIN` はTask Paneで動作しません。CSPを組織で追加する場合はOffice.js配信元、Microsoft Graph、Entraへの接続とOutlookによるframe-ancestorsを許可してください。auth.htmlではOAuthフローに影響するCOOPを付けないでください。

## 対応条件と実装設計

詳細: [公式仕様と制約](docs/COMPATIBILITY.md)、[検証チェックリスト](docs/TESTING.md)。

- マニフェストはOffice Add-in XML、Mailbox 1.3 / ReadWriteItem。宛先追加はgetAsync + addAsyncで、既存宛先を上書きしません。To/Cc/Bcc全体と選択内のメールを大文字小文字を区別せず重複除外します。
- 1回の新規追加を100件以下に制限。Outlook/Exchangeの上限・配布リスト内部・ユーザーの同時編集・未解決宛先に関する重複までは保証できません。Officeのエラーを表示します。
- NAA NestedAppAuth 1.1は実行時判定します。非対応ホストは同一オリジンOffice DialogでMSAL PKCE認証。NAA失敗を無条件に別認証へ流さずエラー表示します。
- トークンはTask Paneのメモリにのみ保持。DialogはOAuthリダイレクトをまたぐためMSAL sessionStorageを使い、成功後にキャッシュを消去します。Dialogの閉じる操作・タイムアウトに対応。RoamingSettingsにはdriveId/itemId/webUrlのみ保存します。
- 設定は同一メールボックス・同一アドインIDのRoamingSettingsで共有します。別クライアントへの反映はOutlook再起動や再オープンを要する場合があります。別メールボックス・別IDへの共有は行いません。
- 検索と社員データはメモリのみ。独自サーバーへの転送・アクセス解析・社員情報の永続キャッシュはありません。

## トラブルシューティング

| 症状 | 対応 |
|---|---|
| 設定画面にOutlook起動の案内 | 通常ブラウザー単独ではなく、作成メールのアドインから起動 |
| 証明書エラー | 開発証明書の信頼、HTTPSホスト名・ポートの一致を確認 |
| AADSTS50011 | EntraのSPAリダイレクトURIとVITE_REDIRECT_URIを完全一致させ再ビルド |
| NAAに失敗 | broker URI、Microsoft 365更新チャネル、サインインしているテナントを確認 |
| Dialogが開かない | ポップアップ許可、Office/ブラウザー更新、同一オリジンのauth.html、組織ポリシーを確認 |
| 403 | Files.ReadWriteの委任同意とファイルACLを確認。閲覧のみ・共有リンク・テナント間共有の制限を確認 |
| 404 / URL解決失敗 | SharePointの「リンクのコピー」で新たに共有リンクを取得。任意のExcel編集画面URLはshares APIで解決できない場合あり |
| テーブル・必須列エラー | Excelの「テーブル名」と列見出しのスペルを確認。単なるセル範囲は不可 |
| 循環・親組織不明 | ExcelでID参照を修正。取得途中の編集なら再読み込み |
| 429 / 503 | Retry-Afterに従い最大30秒待機して再試行。継続時は時間を空けて再読み込み |
| 宛先追加失敗 | 100件以下に分け、Outlook/Exchangeの宛先上限や解決状態を確認 |
| URL変更が反映されない | 同じメールボックス・アドインIDを確認し、Outlookを再起動 |

## ファイル構成

```text
src/model.ts       形式検証・階層・検索・選択・重複除外
src/graph.ts       URL解決・Excelテーブル・ページング・再試行
src/auth.ts        NAA / Office Dialog・メモリキャッシュ
src/dialog.ts      Dialog PKCEリダイレクト
src/settings.ts    RoamingSettings・失敗時の復元
src/outlook.ts     作成モード判定・宛先追加
src/main.tsx       日本語/英語Task Pane
src/style.css      狭幅対応スタイル
scripts/manifest.mjs  公開先別XML生成
public/assets/     アドインアイコン
samples/OrganizationAddressBook.xlsx  正式テーブル付き架空データ
tests/             単体テスト
docs/              互換性・実機確認・開発結果
```

公開前に `.env`・dist・ログ・個人データがコミット対象になっていないことを確認してください。環境変数にシークレットを入れないでください。本リポジトリはGitHub公開可能なファイルを準備しますが、自動でGitHub作成・pushは行いません。

License: [MIT](LICENSE)

---

<a id="english"></a>

# Monja Outlook Hierarchy Address Book

[日本語](#japanese) | [English](#english) | [简体中文](#chinese)

A Microsoft 365 organizational address book for Outlook on the web, New Outlook for Windows, and Classic Outlook for Microsoft 365. Browse an organization tree maintained in Excel Online, search and select employees, and add them to To / Cc / Bcc in a compose message.

Provided by ファーストサクセス合同会社 (First Success). This MIT-licensed Office Web Add-in uses React, TypeScript, and Vite. The add-in runs as a static SPA and does not require a persistent Node.js server or a provider-hosted employee database.

## Getting started

### Administrator: deploy the add-in and prepare Excel

1. Download the public `manifest.xml` from the support site. In Microsoft 365 admin center, open **Settings → Integrated apps → Upload custom apps** and upload the XML file.
2. Assign the add-in to users, groups, or the organization. Assigned users do not need to register a custom add-in individually.
3. Edit the [Excel template](samples/OrganizationAddressBook.xlsx) with your organization and employee data, then upload it to SharePoint or OneDrive for Business. Keep the table names and column headers unchanged.
4. Grant users access to the workbook and distribute its URL obtained through **Share → Copy link**.
5. Arrange consent to Microsoft Graph delegated permissions according to company policy. Add-in deployment and authentication consent are separate procedures.

### Each user: configure the Excel link

**Central deployment does not configure the Excel link. Each user must set it on first use.** Everyone using the same address book can enter the same workbook URL.

1. Create an Outlook message, open the address book from **Apps**, and sign in with your company's Microsoft 365 work account.
2. In **Settings → Excel file settings**, paste the SharePoint / OneDrive for Business workbook sharing URL and select **Validate and save**. Use the Excel URL, not the support site or manifest URL.
3. Select a department in the organization tree, search for employees, select one or more people, and add them to To / Cc / Bcc.
4. Select **Refresh** after the workbook changes. To keep the pane open for subsequent messages on supported clients, select Outlook's pin icon at the top of the pane once.

Knowing the URL does not grant access: the signed-in user needs workbook permissions. Settings are saved per user and shared across supported Outlook clients using the same mailbox and add-in ID; they are not automatically distributed to other users. Pane restoration after restarting Outlook depends on the client.

The add-in UI supports Japanese and English. The support site supports Japanese, English, and Simplified Chinese, including `?lang=en` and `?lang=zh-CN` links.

For individual installation where permitted, upload the manifest through Outlook's custom add-in management. If your organization blocks sideloading, ask the administrator to deploy it.

## Excel format

Use real Excel tables, not just worksheets or cell ranges:

| Table | Required columns |
|---|---|
| Organizations | OrganizationID, OrganizationName, ParentOrganizationID, DisplayOrder, IsActive |
| Members | MemberID, DisplayName, Email, Contact, OrganizationID, Position, DisplayOrder, IsActive |

- Use text IDs to preserve leading zeros. Leave `ParentOrganizationID` empty for root organizations.
- `DisplayOrder` must be a finite number; `IsActive` accepts TRUE/FALSE or 1/0.
- Organization IDs must be unique. Member rows must have a unique `(MemberID, OrganizationID)` pair. Repeat a member ID under different organizations to represent multiple assignments.
- Inactive organizations and their descendants, and inactive members, are hidden. Inactive rows are still validated. Entirely empty rows are ignored.
- Missing or invalid email addresses remain visible but cannot be selected.
- The **Include subdepartments** option applies to department filtering, search, and department selection. **Select all** selects the currently displayed search results.

The sample workbook contains fictional data. SharePoint Online and OneDrive for Business are supported; personal OneDrive and shortened links are not supported.

## Development

Development prerequisites: Windows 11, Node.js 24 / npm 11, an Exchange Online work account, and SharePoint Online or OneDrive for Business. Outlook.com, Gmail, on-premises Exchange, and IE WebView are outside the supported scope. End users do not need Node.js.

```powershell
npm ci
Copy-Item .env.example .env
# Set VITE_CLIENT_ID to the publisher's multitenant Entra application ID.
npm run cert
npm run dev
```

The development server uses `https://localhost:3002/`. `npm run cert` creates a development certificate valid for six months and registers it in the current user's certificate stores. Private keys and the passphrase are stored in the Git-ignored `.certs/` directory. If changing the port, update the environment redirect URI, Entra SPA URIs, and manifest consistently.

## Microsoft Entra ID configuration

The publisher registers one multitenant application (`AzureADMultipleOrgs`). Customers use the same build and manifest; they do not provide their own client or tenant IDs.

1. Set `VITE_CLIENT_ID` in `.env` to the publisher's application ID. The authority is `https://login.microsoftonline.com/organizations`. No client secret is required.
2. Register these SPA redirect URIs for development:
   - `brk-multihub://localhost:3002` for Nested App Authentication (NAA).
   - `https://localhost:3002/auth.html` for the Office Dialog authorization code flow with PKCE.
3. Configure Microsoft Graph **delegated** `Files.ReadWrite` permission and obtain consent according to organizational policy.
4. For production, add `brk-multihub://PUBLIC_HOST` and the full HTTPS `auth.html` URI. The broker URI contains only the host and optional port, without a subpath. Set `VITE_REDIRECT_URI` consistently and rebuild.

Although the add-in only issues GET requests for workbook data, the Workbook API permission includes write access. File ACLs still apply; consent does not grant access to otherwise inaccessible files. No application permissions, `Mail.ReadWrite`, `Directory.Read.All`, or `Sites.ReadWrite.All` are requested.

## Build and deployment

```powershell
npm run typecheck
npm test
npm run build
npm run manifest -- https://addressbook.example.com/
npm run validate:manifest
```

Replace the example URL with your actual HTTPS host. Deploy the contents of `dist/` to static hosting and distribute the generated `manifest.xml`. IIS, Cloudflare Pages, and Azure Static Web Apps can serve the static build. For a subpath deployment, include that path in the manifest base URL and `VITE_REDIRECT_URI`. Serve `auth.html` directly without rewriting it to `index.html`; allow Outlook to embed the add-in in a frame.

For the Sites-managed support-site counter, use `npm run build:site`. Its Worker/D1 stores only a counter key and number, separately from employee data. Ordinary static deployments use `npm run build`.

## Data handling and limits

- Employee data is retrieved directly from Microsoft Graph using the user's delegated access and searched in memory. It is not stored in the provider's employee database.
- Outlook RoamingSettings stores only `driveId`, `itemId`, and `webUrl`. Access tokens are not stored there. Resetting settings removes the saved file reference.
- Task-pane tokens remain in memory. Dialog authentication uses temporary MSAL session storage and clears the cache after success.
- Existing recipients are preserved. Email addresses are deduplicated without case sensitivity across To / Cc / Bcc and the current selection. Each operation adds at most 100 new recipients; Outlook and Exchange limits still apply.
- The hierarchy has no fixed depth limit; practical limits depend on Excel API response sizes and pane rendering performance.
- NAA support is detected at runtime. Hosts without NAA use Office Dialog with PKCE. Actual client behavior should be checked using the testing checklist.

## Troubleshooting

| Symptom | Action |
|---|---|
| Prompt to open Outlook | Launch the add-in from an Outlook compose message. |
| Authentication or consent error | Give your administrator the app name and error message; do not share passwords or tokens. |
| AADSTS50011 | Match the Entra SPA URI and `VITE_REDIRECT_URI` exactly, then rebuild. |
| 403 | Check workbook access and delegated Graph consent. |
| 404 or URL resolution failure | Obtain a fresh workbook link using Share → Copy link. |
| Missing tables or columns | Check Excel table names and column headers, not worksheet names. |
| Cycle or missing parent | Correct organization IDs, then refresh after editing finishes. |
| Recipient insertion fails | Use a compose message and add no more than 100 new recipients per operation. |

## Further documentation

The following technical documents are in Japanese:

- [Distribution to multiple companies](docs/DISTRIBUTION.md)
- [Compatibility and constraints](docs/COMPATIBILITY.md)
- [Testing checklist](docs/TESTING.md)
- [Pinning](docs/PINNING.md)
- [Support-site counter](docs/SITES_COUNTER.md)

Support-page sources: [Setup and support](public/support.html), [Data handling](public/privacy.html). View these HTML pages through the deployed site or development server.

License: [MIT](LICENSE)

---

<a id="chinese"></a>

# Monja Outlook 层级组织通讯录

[日本語](#japanese) | [English](#english) | [简体中文](#chinese)

面向 Microsoft 365 企业用户的 Outlook 组织通讯录插件，适用于网页版 Outlook、Windows 新版 Outlook 和 Microsoft 365 经典版 Outlook。在邮件撰写窗口中浏览由 Excel Online 管理的组织树，搜索并选择员工，将其添加到收件人（To）、抄送（Cc）或密送（Bcc）。

提供方：ファーストサクセス合同会社（First Success）。本项目采用 MIT 许可证，基于 React、TypeScript 和 Vite 开发，是静态单页 Office Web 加载项。插件无需常驻 Node.js 服务器，也无需提供方托管员工数据库。

## 开始使用

### 管理员：统一部署插件并准备 Excel

1. 从支持网站下载公开发布的 `manifest.xml`。在 Microsoft 365 管理中心进入“设置 → 集成应用 → 上传自定义应用”，上传 XML 文件。
2. 将插件分配给用户、组或整个组织。统一部署后，用户无需分别注册自定义加载项。
3. 下载 [Excel 模板](samples/OrganizationAddressBook.xlsx)，填写本公司的组织与员工信息，并上传到 SharePoint 或 OneDrive for Business。请保留原有表名称和列标题。
4. 为用户授予工作簿访问权限，通过“共享 → 复制链接”获取 Excel 共享 URL，并将其告知用户。
5. 按照组织策略完成 Microsoft Graph 委托权限的同意。插件部署与身份验证授权是两个独立步骤。

### 每位用户：首次设置 Excel 链接

**统一部署不会自动设置 Excel 链接。每位用户均需在首次使用时自行设置。** 使用同一通讯录的用户可以填写相同的 Excel 共享 URL。

1. 在 Outlook 中新建邮件，从“应用”打开组织通讯录，使用本公司的 Microsoft 365 工作账户登录。
2. 在“设置 → Excel 文件设置”中粘贴 SharePoint / OneDrive for Business 的工作簿共享 URL，点击“验证并保存”。应填写 Excel 链接，而非支持网站或清单文件的链接。
3. 在组织树中选择部门，搜索并勾选一名或多名员工，添加到 To / Cc / Bcc。
4. Excel 更新后点击“刷新”。如需在后续撰写邮件时保持面板打开，可在支持该功能的 Outlook 中点击面板顶部的固定图标。

仅知道链接并不代表拥有权限，登录用户本人必须具有工作簿访问权限。设置按用户保存，在同一邮箱、同一插件 ID 的受支持 Outlook 客户端间共享，不会自动分发给其他用户。完全退出并重启 Outlook 后是否恢复面板，由 Outlook 客户端决定。

插件界面支持日语和英语；支持网站支持日语、英语和简体中文，也可通过 `?lang=en` 或 `?lang=zh-CN` 指定语言。

未统一部署且组织允许自行安装时，可通过 Outlook 的自定义加载项管理上传清单文件。如果组织禁止旁加载，请由管理员部署。

## Excel 格式

必须使用正式的 Excel 表，不能仅使用工作表名称或普通单元格区域。

| 表名称 | 必需列 |
|---|---|
| Organizations | OrganizationID, OrganizationName, ParentOrganizationID, DisplayOrder, IsActive |
| Members | MemberID, DisplayName, Email, Contact, OrganizationID, Position, DisplayOrder, IsActive |

- 建议将 ID 设置为文本，以保留前导零。根组织的 `ParentOrganizationID` 留空。
- `DisplayOrder` 必须为有限数值；`IsActive` 支持 TRUE/FALSE 或 1/0。
- 组织 ID 必须唯一；员工记录的 `(MemberID, OrganizationID)` 组合必须唯一。同一员工在不同组织重复出现可表示兼任。
- 停用的组织及其下级组织、停用的员工均不显示。停用行仍参与结构验证，完全空白的行会被忽略。
- 邮箱为空或格式不正确的员工仍会显示，但无法选择。
- “包含下级部门”同时影响部门筛选、搜索和部门批量选择。“全选”仅选择当前显示的搜索结果。

模板中的信息均为虚构数据。支持 SharePoint Online 和 OneDrive for Business，不支持个人版 OneDrive 和短链接。

## 本地开发

开发环境要求：Windows 11、Node.js 24 / npm 11、Exchange Online 工作账户，以及 SharePoint Online 或 OneDrive for Business。不支持 Outlook.com、Gmail、本地部署的 Exchange 和 IE WebView。普通用户无需安装 Node.js。

```powershell
npm ci
Copy-Item .env.example .env
# 将 VITE_CLIENT_ID 设置为提供方的多租户 Entra 应用 ID。
npm run cert
npm run dev
```

开发地址为 `https://localhost:3002/`。`npm run cert` 创建有效期为六个月的开发证书，并注册到当前用户的证书存储中。私钥和口令保存在 Git 忽略的 `.certs/` 目录。如需更改端口，请同步修改环境变量中的重定向 URI、Entra SPA URI 和清单文件。

## Microsoft Entra ID 配置

提供方注册一个多租户应用（`AzureADMultipleOrgs`）。各企业使用同一构建和清单文件，无需提供各自的客户端 ID 或租户 ID。

1. 在 `.env` 中将 `VITE_CLIENT_ID` 设置为提供方的应用 ID。身份验证使用 `https://login.microsoftonline.com/organizations`，无需客户端密钥。
2. 为开发环境注册以下 SPA 重定向 URI：
   - NAA（嵌套应用身份验证）：`brk-multihub://localhost:3002`。
   - Office Dialog 授权码与 PKCE 流程：`https://localhost:3002/auth.html`。
3. 配置 Microsoft Graph **委托**权限 `Files.ReadWrite`，并按照组织策略完成同意。
4. 生产环境需添加 `brk-multihub://PUBLIC_HOST` 和完整的 HTTPS `auth.html` URI。代理 URI 仅包含主机及可选端口，不包含子路径。同步设置 `VITE_REDIRECT_URI` 后重新构建。

插件仅使用 GET 请求读取工作簿数据，但 Workbook API 所需权限包含写入权限。文件访问控制仍然生效，授权不会使用户获得原本无权访问的文件。不请求应用程序权限、`Mail.ReadWrite`、`Directory.Read.All` 或 `Sites.ReadWrite.All`。

## 构建与发布

```powershell
npm run typecheck
npm test
npm run build
npm run manifest -- https://addressbook.example.com/
npm run validate:manifest
```

请将示例地址替换为实际 HTTPS 地址。将 `dist/` 的内容部署到静态托管服务，并分发生成的 `manifest.xml`。可使用 IIS、Cloudflare Pages 或 Azure Static Web Apps。部署到子路径时，清单基础 URL 与 `VITE_REDIRECT_URI` 均需包含该路径。必须直接提供 `auth.html`，不能将其重写为 `index.html`；同时允许 Outlook 通过框架嵌入插件。

如需发布带有 Sites 管理访问计数器的支持网站，使用 `npm run build:site`。其 Worker/D1 仅保存计数键与数值，与员工数据分离。普通静态部署使用 `npm run build`。

## 数据处理与限制

- 使用用户的委托权限直接从 Microsoft Graph 获取组织和员工数据，并在内存中搜索，不将其保存到提供方的员工数据库。
- Outlook RoamingSettings 仅保存 `driveId`、`itemId` 和 `webUrl`，不保存访问令牌。初始化设置可删除已保存的文件引用。
- 任务面板令牌仅保留在内存中。Dialog 身份验证使用临时 MSAL 会话存储，并在成功后清除缓存。
- 保留现有收件人，对 To / Cc / Bcc 及当前选择中的邮箱进行不区分大小写的去重。每次最多新增 100 个收件人，仍受 Outlook 和 Exchange 自身限制。
- 组织树未设置固定深度上限，实际规模受 Excel API 响应大小及面板渲染性能影响。
- 运行时检测 NAA 支持情况，不支持的客户端使用 Office Dialog 与 PKCE。实际客户端行为应按照测试清单验证。

## 常见问题

| 问题 | 处理方法 |
|---|---|
| 提示从 Outlook 启动 | 从 Outlook 邮件撰写窗口打开插件。 |
| 身份验证或授权失败 | 将应用名称和错误信息告知管理员，不要分享密码或令牌。 |
| AADSTS50011 | 确保 Entra SPA URI 与 `VITE_REDIRECT_URI` 完全一致，然后重新构建。 |
| 403 | 检查工作簿访问权限与 Graph 委托授权。 |
| 404 或 URL 解析失败 | 使用“共享 → 复制链接”重新获取工作簿链接。 |
| 找不到表或列 | 检查正式的 Excel 表名称和列标题，而非工作表名称。 |
| 组织循环或父组织不存在 | 修正组织 ID 引用，编辑完成后刷新。 |
| 添加收件人失败 | 在邮件撰写窗口使用，每次新增不超过 100 个收件人。 |

## 相关文档

以下技术文档为日语：

- [面向多家企业的分发](docs/DISTRIBUTION.md)
- [兼容性与限制](docs/COMPATIBILITY.md)
- [测试清单](docs/TESTING.md)
- [面板固定功能](docs/PINNING.md)
- [支持网站计数器](docs/SITES_COUNTER.md)

网站页面源文件：[安装与支持](public/support.html)、[数据处理](public/privacy.html)。请通过已部署的网站或开发服务器查看这些 HTML 页面。

许可证：[MIT](LICENSE)
