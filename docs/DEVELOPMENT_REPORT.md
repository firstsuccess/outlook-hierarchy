# 開発結果 / 2026-10-19

## 実装結果

`C:\outlook-hierarchy` 内に独立した静的Office Web Add-inを作成しました。既存会計・固定資産システム、IISバインディング、データベース設定は変更していません。本番はdist内の静的ファイルとMicrosoft 365だけで動作する設計です。

実装済み:

- 任意階層の組織ツリー、展開・折りたたみ、表示順、無効組織の子孫と無効社員の非表示
- 組織ID・親ID・循環・所属・必須列・型の検証。12,000階層の単体テスト
- 氏名、部門、メール、全項目の部分一致・リアルタイム・大文字小文字無視・日本語検索
- 子部門の包含切替、検索件数、条件クリア
- 単独・複数・全選択、部門＋、子部門一括選択、解除、選択人数
- メール形式不正・未登録の除外、兼務、メール重複排除
- Office.jsのTo/Cc/Bcc取得と追加、既存宛先の保持、100件上限、読取モード判定、非同期エラー表示
- NAA優先認証、未対応環境のOffice Dialog MSAL PKCE、Graph委任アクセス
- SharePoint/OneDrive for Business共有URLのGraph解決、Excel正式テーブル取得、ページング、401再取得、429/503の待機
- 初回設定、URL変更前検証、RoamingSettings保存・失敗時の復元・初期化
- 起動時取得、再読み込み、読込中・最終読込日時・失敗表示
- 日本語初期表示と英語切替、320px幅のレイアウト
- 共通XMLマニフェスト、HTTPS開発設定、公開先別マニフェスト生成、MIT、CI

## 検証結果

| 項目 | 結果 |
|---|---|
| Node / npm | v24.21.0 / 11.19.0を確認 |
| TypeScript | `npm run typecheck` 成功。本番build内でも再確認 |
| 単体テスト | 5ファイル / **34件成功**（マルチテナント認証先・Outlookアカウント選択を含む） |
| 本番ビルド | `npm run build` 成功、dist生成 |
| マニフェスト | `npm run validate:manifest` Microsoft公式検証サービスで **valid** |
| 依存監査 | `npm audit` と `npm audit --omit=dev` とも脆弱性0件（確認時点） |
| Excelサンプル | 正式テーブルOrganizations=A1:E9 / Members=A1:H11をxlsx XMLで確認。両シートを描画して表示確認 |
| ブラウザー操作 | HTTPS Vite + Edgeの模擬Office/Graphで、日本語/英語・検索・選択・宛先追加・320px幅の横はみ出しなしを確認 |
| Microsoft 365実接続 | **未検証**。実アカウントの認証情報なし |
| Outlook Web / New / Classic実機 | **未検証**。上記の模擬操作は実機検証の代替ではない |

依存更新後に型チェック・単体テスト・ビルドを再実行しています。マニフェスト検証はスキーマと宣言の検証であり、認証・Graph・実機操作の成功を保証しません。検証用の一時HTTPSサーバーは停止しています。

## 未実施・制約

- Entraアプリ登録・同意、実ファイル読取、Outlook実宛先追加、RoamingSettingsのクライアント間同期、本番ホスト配置は利用者環境で実施する必要があります。
- GitHubリポジトリ作成・push・公開は未実施です。
- IE/EdgeHTML、オンプレミスExchange、個人用OneDrive、他のMicrosoftクラウド、外部テナント共有、複雑な条件付きアクセスのclaims challengeは対応保証外です。
- 表示データは取得時点です。大規模一覧の仮想化、Excel編集中の一貫スナップショット、配布リストの展開による重複検出は未実装です。
- 公開先・共通クライアントIDは提供者が設定します。認証先はorganizationsに固定し、顧客企業のテナントID入力は不要です。現状のdistは提供者の実Client IDを含まず、登録・認証設定後に再ビルドが必要です。
- 開発証明書の生成・ユーザー信頼ストア登録は未実行です。利用者がREADMEの `npm run cert` を実行してください。ブラウザー検証には一時証明書を使い、信頼ストアは変更していません。

## 起動・導入・公開

1. READMEのEntra ID設定に沿ってSPAアプリを登録し、Files.ReadWriteの委任許可とNAA/PKCEの2種類のURIを設定します。
2. 提供者がAzureADMultipleOrgsのアプリを登録し、`.env.example` を `.env` にコピーして共通VITE_CLIENT_ID / VITE_REDIRECT_URIを設定します。顧客側のID設定は不要です。
3. `npm ci` → `npm run cert` → `npm run dev`。基本URLは `https://localhost:3002/`。
4. Webのアドイン管理でmanifest.xmlをファイル登録。同じメールボックスのNew / Classicでも新規メールから起動します。
5. サンプルをSharePoint/OneDrive for Businessへアップロードし、「リンクのコピー」で取得したExcel共有URLを設定画面で検証・保存します。
6. 本番は公開先に合わせてURIを変更し、`npm run build`、`npm run manifest -- https://公開先/`。distの内容を専用HTTPS静的ホストへ配置し、マニフェストを更新します。Node常駐・3002待受は不要です。

詳しい手順はREADME、環境別制約はCOMPATIBILITY.md、実機手順はTESTING.mdに記載しています。

## 作成ファイル一覧（公開用）

```text
.env.example
.gitignore
.prettierignore
.github/workflows/ci.yml
README.md
LICENSE
package.json
package-lock.json
tsconfig.json
vite.config.ts
index.html
auth.html
manifest.xml
src/auth.ts
src/dialog.ts
src/graph.ts
src/main.tsx
src/model.ts
src/outlook.ts
src/settings.ts
src/style.css
scripts/dev-cert.ps1
scripts/icons.ps1
scripts/manifest.mjs
public/assets/icon-16.png
public/assets/icon-32.png
public/assets/icon-64.png
public/assets/icon-80.png
public/assets/icon-128.png
samples/OrganizationAddressBook.xlsx
tests/auth.test.ts
tests/graph.test.ts
tests/model.test.ts
tests/outlook.test.ts
tests/settings.test.ts
docs/COMPATIBILITY.md
docs/TESTING.md
docs/DEVELOPMENT_REPORT.md
docs/DISTRIBUTION.md
```

ビルド成果物は `dist/index.html`、`dist/auth.html`、`dist/assets/`。node_modules、dist、環境変数実値、検証の中間ファイルは.gitignore対象です。
