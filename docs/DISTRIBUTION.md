# 不特定多数の企業への配布

## 利用者の流れ

1. 共通のOutlookアドインを導入します。
2. 自社のMicrosoft 365職場アカウントでサインインします。
3. 必要な同意を行います。企業のポリシーで管理者承認が必要な場合は管理者へ依頼します。
4. 自社SharePoint / OneDrive for BusinessのExcel共有URLを入力します。
5. 組織を検索し、メールのTo/Cc/Bccへ追加します。

顧客はNode.jsをインストール・起動しません。Entraアプリを自社で登録したり、IDを入力したりする必要もありません。自社内のファイルを自社ユーザーが読むことと、他社のファイルを共有することは別です。本製品に参加するために社員情報を他社・提供者へ共有する必要はありません。

## 提供者が一度だけ行うこと

- 提供者のEntraテナントでアプリ登録。対象は任意の組織ディレクトリの職場・学校アカウント（AzureADMultipleOrgs）。個人Microsoftアカウントは対象外です。
- 共通Client IDをVITE_CLIENT_IDへ設定。SPAに公開HTTPSのauth.htmlとbrk-multihubのURIを登録。Files.ReadWriteの委任許可を設定します。
- 共通の静的ファイルをHTTPSで公開し、公開URLを含むマニフェストを生成します。全顧客に同じビルド・マニフェストを配布できます。
- 提供者の表示名、検証済みドメイン、サポート窓口、プライバシーポリシー、利用条件を公開用の内容として用意します。
- Publisher Verification（発行元確認）を進めます。未確認アプリは顧客の同意ポリシーにより利用を制限される場合があります。発行元確認とMicrosoft Marketplaceの審査は別の手続きです。

認証先はorganizations共通エンドポイントです。コード変更だけではEntra側のシングルテナント登録はマルチテナントになりません。提供者のアプリ登録も変更する必要があります。提供者のテナントIDは登録の管理で使用しますが、配布アプリに固定しません。Client IDは公開識別子で、シークレットではありません。

## 企業側の管理者が行う可能性のあること

- 委任Files.ReadWriteへの管理者同意。利用者の同意が許可されている場合は利用者自身で同意できることがありますが、全企業で承認不要とは限りません。
- Microsoft 365管理センターの統合アプリによる導入・利用者への割当。
- SharePointファイルのアクセス権、外部アプリ・条件付きアクセスのポリシー確認。
- 利用終了時は自社エンタープライズアプリの同意や割当を取り消せます。

同意によって顧客側に作成されるサービスプリンシパルは、提供者が持つアプリ登録とは別です。ある会社の同意で別会社まで同意したことにはなりません。

## 配布経路

- 試験提供: 公開HTTPSと共通manifest.xmlを提供し、顧客管理者が登録します。
- 一般公開: Partner Centerを通じたMicrosoft MarketplaceへのOutlookアドイン公開を検討します。掲載審査、サポート・プライバシー等の要件を満たす必要があります。Marketplaceに掲載しても企業の同意・導入ポリシーは適用されます。

現時点ではローカル実装・テストまでです。提供者のアプリ登録、発行元確認、公開ホスト配置、Marketplace申請は未実施です。マニフェストのSupportUrlは現在Task Paneを指す仮設定のため、一般公開前に実際のサポートページへ変更してください。架空の公開ドメインや実在しないポリシーページを登録しないでください。

## 公開前の確認

提供者テナントAと、独立した顧客テナントBで、同じ公開Client ID・ビルドを使用して検証します。各テナントで自社Excelだけを指定し、認証・同意・検索・宛先追加・設定の独立性を確認します。企業Bの承認拒否・同意取消・ファイルアクセス拒否も確認します。NAAとDialogそれぞれをWeb / New / Classicで実機確認してください。

一般のMicrosoft 365商用クラウドが対象です。政府系等の別クラウドを横断するマルチテナント接続は対象外です。バックエンドに顧客データを集約せず、利用者の委任トークンでGraphから直接取得します。

## 公式資料

- [マルチテナントの対象とクラウドの制約](https://learn.microsoft.com/en-us/entra/identity-platform/single-and-multi-tenant-apps)
- [ユーザー・管理者の同意](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/user-admin-consent-overview)
- [アプリケーションとサービスプリンシパル](https://learn.microsoft.com/en-us/entra/identity-platform/application-model)
- [発行元ドメイン](https://learn.microsoft.com/en-us/entra/identity-platform/howto-configure-publisher-domain)
- [NAA設定](https://learn.microsoft.com/en-us/office/dev/add-ins/develop/enable-nested-app-authentication-in-your-add-in)
