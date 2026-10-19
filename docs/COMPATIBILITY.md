# 公式仕様・互換性（2026-10-19確認）

## 採用方式

配布方式は提供者が所有するマルチテナントEntraアプリ（AzureADMultipleOrgs）です。認証先はorganizationsで、顧客企業ごとのID入力・ビルドは不要です。利用企業の同意・導入ポリシーは適用されます。詳細は[DISTRIBUTION.md](DISTRIBUTION.md)。

Office Add-inのXML（add-in only）マニフェストを使用します。unified manifestの対応差を避け、Web / New / ClassicのMessageComposeCommandSurfaceにShowTaskpaneを登録します。Mailbox 1.3を要求し、Office.jsのRecipients.getAsync/addAsyncを使用します。作成画面以外とAPI非対応時は追加不可です。XMLのReadWriteItemはメールアイテムの操作許可であり、Graphの委任許可とは別です。

| 対象 | Office.js | NAA | 代替 |
|---|---|---|---|
| Outlook on the web / Exchange Online | Mailbox 1.3以上 | NestedAppAuth 1.1を実行時判定 | Office Dialog + MSAL SPA PKCE |
| New Outlook / Exchange Online | Mailbox 1.3以上 | 公式サンプルで対象。実行時判定 | 同上 |
| Classic Microsoft 365 / Windows | Mailbox 1.3以上 | Version 2409 Build 18025.20000以降が公式対応表の基準 | 同上。更新済みWebView2必須 |

利用可能なAPIはOfficeとExchange両方に依存します。NAAをマニフェストの必須Requirementにはせず、非対応ホストでDialogを使えるようにしています。DialogApi 1.1 / DialogOrigin 1.1相当の現在サポートされるOfficeを利用してください。IE/EdgeHTML用トランスパイルや旧Exchangeトークン/OBOのバックエンドは実装しません。

NAAはcreateNestablePublicClientApplication、acquireTokenSilent、acquireTokenPopupを使用します。broker URIはSPAの `brk-multihub://host[:port]`。fallbackはOffice Dialogを同一オリジンauth.htmlから開き、MSALのacquireTokenRedirectでPKCE、handleRedirectPromiseで復帰します。messageParentは同一オリジン限定、nonceで応答を照合します。GraphトークンをログやURLに出しません。条件付きアクセスやclaims challengeの高度な再認証制御は専用実装していないため、該当ポリシー下は要検証です。

## Excel・共有URL

Graph v1.0 `/shares/u!{base64url}/driveItem` で解決し、driveId/itemId/webUrlを保存。続いて `/drives/{driveId}/items/{itemId}/workbook/tables` とheaderRowRange、rowsを取得します。追加のセッション作成や永続的な共有リンクredeem要求は行いません。

ファイルはSharePoint Online / OneDrive for Businessの.xlsx。個人OneDrive、xls/xlsb、アプリケーション権限は対象外です。共有URLの形式とAPI対応に依存し、Excelの編集ページ・短縮URL・他クラウドは解決できない場合があります。エラー時は「リンクのコピー」を使ってください。組織横断・外部テナント・閲覧のみ共有ではAPIの権限制約を実機確認する必要があります。無制限に広いFiles.ReadWrite.Allを自動要求することはありません。

Workbook APIの最小委任権限はFiles.ReadWriteです。読み取り専用の独自バックエンドを作って権限を代行する方式は採用しません。

## 制約

- Graphで取得する2テーブルは同一トランザクションのスナップショットではありません。更新中の検証エラー時は再取得します。
- addAsyncは1回最大100件。メールボックス設定による上限、ユーザーの同時変更、配布リスト展開後の重複はAPIの範囲外です。
- RoamingSettingsはOutlook独自の同期タイミングがあり、他クライアントへの即時反映を保証しません。
- 社員一覧の仮想スクロールは未実装。数万行のExcelではTask Paneの性能測定が必要です。階層の深さ自体に固定上限はありません。

## Microsoft公式資料

- [NAA導入・SPA broker設定](https://learn.microsoft.com/en-us/office/dev/add-ins/develop/enable-nested-app-authentication-in-your-add-in)
- [NAA対応要件表](https://learn.microsoft.com/en-us/javascript/api/requirement-sets/common/nested-app-auth-requirement-sets?view=word-js-preview)
- [Web / New / Classic対象のNAA公式サンプル](https://learn.microsoft.com/en-us/samples/officedev/office-add-in-samples/outlook-add-in-sso-naa/)
- [Office Dialogによる認証](https://learn.microsoft.com/en-us/office/dev/add-ins/develop/auth-with-office-dialog-api)
- [Mailbox要件セット](https://learn.microsoft.com/en-us/javascript/api/requirement-sets/outlook/outlook-api-requirement-sets)
- [Recipients API](https://learn.microsoft.com/en-us/javascript/api/outlook/office.recipients)
- [XMLマニフェスト](https://learn.microsoft.com/en-us/office/dev/add-ins/develop/xml-manifest-overview)
- [Graph Excelの対応と権限](https://learn.microsoft.com/en-us/graph/api/resources/excel?view=graph-rest-1.0)
- [テーブルの行取得・権限](https://learn.microsoft.com/en-us/graph/api/table-list-rows?view=graph-rest-1.0)
- [共有リンクの解決](https://learn.microsoft.com/en-us/graph/api/shares-get?view=graph-rest-1.0)
- [RoamingSettings](https://learn.microsoft.com/en-us/javascript/api/outlook/office.roamingsettings)
- [Outlookサイドロード](https://learn.microsoft.com/en-us/office/dev/add-ins/outlook/sideload-outlook-add-ins-for-testing)
