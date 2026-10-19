# Outlook Hierarchy Address Book / Outlook階層型組織アドレス帳

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
