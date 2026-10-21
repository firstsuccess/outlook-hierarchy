export const translations = {
  ja: {
    supportTitle: "もんじゃOutlook階層型アドレス帳 — 導入・サポート",
    product: "もんじゃOutlook階層型アドレス帳",
    release: "ファーストサクセス合同会社　2026年10月（初版リリース）",
    intro:
      "Microsoft 365企業向けの組織アドレス帳アドインです。Web版、PC版両方のOutlookにアプリを追加できるプラグインとして機能します。",
    templateHeading: "Excelテンプレート",
    templateDownload: "Excelテンプレートをダウンロード（.xlsx）",
    templateHelp:
      "Organizations・Membersの正式なExcelテーブルと架空のサンプルデータを含みます。自社の組織・社員情報に編集して、SharePointまたはOneDrive for Businessへアップロードしてください。テーブル名と列見出しは変更せず、アップロード後に「共有 → リンクのコピー」で取得したURLをアドインに設定します。",
    installHeading: "導入",
    manifestDownload: "公開用マニフェストをダウンロード",
    installMethod:
      "ダウンロードしたXMLファイルを、OutlookのカスタムアドインまたはMicrosoft 365管理センターの統合アプリから登録します。",
    installOpen:
      "新規メールの「アプリ」から組織アドレス帳を開き、自社の職場アカウントでサインインします。会社のポリシーにより管理者承認が必要です。",
    installExcel:
      "SharePoint / OneDrive for Business上のExcel共有URLを入力します。ExcelにはOrganizations / Membersという正式テーブルが必要です。",
    webHeading: "Web版Outlookでのアドイン登録",
    webOpen:
      "下の登録画面を開き、利用するMicrosoft 365の職場アカウントでサインインします。",
    webLink: "Web版Outlookのアドイン登録画面を開く",
    webMyAddins:
      "「個人用アドイン（My add-ins）」を選択し、下部の「カスタムアドインの追加 → ファイルから追加」を選びます。",
    webFile:
      "ダウンロードした公開用マニフェスト（manifest.xml）を選び、登録します。URLを直接登録するのではなく、XMLファイルをダウンロードして指定してください。",
    webFinish:
      "登録後、新規メールの「アプリ」から起動します。同じメールボックスのNew / Classic Outlookにも反映されます。",
    webFallback:
      "登録画面が開かない場合は、Microsoft公式のアドイン管理リンクをお試しください。登録メニューがない場合はMicrosoft 365管理者に配布を依頼してください。",
    webFallbackLink: "Microsoft公式のアドイン管理リンク",
    pinHeading: "表示を維持する（ピン留め）",
    pinUpdate:
      "上の「公開用マニフェスト」を再ダウンロードし、Outlookのアドイン登録を最新版（1.1.0.0）へ更新します。手動登録で反映されない場合は削除・再登録してください。Excelの共有URLを控えてから行ってください。",
    pinAction:
      "メール作成画面からアドインを一度開き、Outlook側のパネル上部にあるピンアイコンを押します。",
    pinNext:
      "対応するOutlookでは、次のメール作成時もパネル表示を維持できます。最初のピン留めは利用者の操作が必要です。",
    pinLimits:
      "Outlookの完全終了・再起動後の表示復元はOutlook側に依存します。表示されない場合は作成画面から開き直してください。Excelの参照設定は保存されます。閲覧画面と作成画面のピン留めは別です。",
    screenshotsHeading: "操作画面",
    screenshotsHelp:
      "画像をクリックすると、別タブで原寸の画像を確認できます。画像は日本語UIの表示例です。",
    settingsHeading: "1. Excelファイルの指定",
    settingsHelp:
      "設定画面でSharePoint / OneDrive for BusinessのExcel共有URLを入力し、「検証して保存」を押します。",
    settingsOpen: "Excelファイルの指定画面を原寸で開く",
    settingsAlt:
      "Outlookのメール作成画面右側に、Excel共有URLを入力する組織アドレス帳の設定画面が表示されている状態",
    settingsCaption:
      "Excelファイルの指定画面。共有URLを検証してから設定を保存します。",
    loadedHeading: "2. サンプルExcelの読み込み後",
    loadedHelp:
      "読み込みが完了すると、組織ツリーと社員一覧が表示されます。社員を検索・選択し、To／Cc／Bccへ追加できます。",
    loadedOpen: "サンプルExcel読み込み後の画面を原寸で開く",
    loadedAlt:
      "架空企業の組織ツリー、社員一覧、選択人数と宛先追加ボタンが表示された組織アドレス帳",
    loadedCaption:
      "サンプルExcelを読み込んだ表示例です。画面内の企業・社員情報は架空のデータです。",
    errorsHeading: "エラー時",
    errorAuth:
      "認証・承認エラー：自社Microsoft 365管理者へ、アプリ名と表示されたエラー文を伝えてください。パスワードやトークンは共有しないでください。",
    error403:
      "403：ファイルへのアクセス権とMicrosoft Graphの委任同意を確認してください。",
    errorTables:
      "テーブルが見つからない：シート名ではなくテーブル名と列名を確認してください。",
    errorRecipients:
      "宛先追加：メール作成画面で使用し、新規追加件数を100件以下にしてください。",
    sourceHeading: "ソースコードダウンロード",
    sourceHelp:
      "ソースコードはGitHubで公開しています。リポジトリの「Code → Download ZIP」からダウンロードできます。",
    dataSummary:
      "本アドインは社員情報を提供者のデータベースへ保存せず、利用者の権限でMicrosoft Graphから直接取得します。",
    privacyLink: "データの取り扱い",
    counterLabel: "アクセス数",
    counterHelp:
      "再表示や確認アクセスも含まれます。Sites内で数値のみを保存しています。",
    counterLoading: "読み込み中…",
    counterError: "取得できませんでした",
    privacyTitle: "データの取り扱い",
    privacyIntro: "本ページは本アドインの技術上のデータ処理を説明します。",
    privacyRead:
      "組織・社員情報は、利用者が指定したMicrosoft 365のExcelからMicrosoft Graphを通じて直接取得し、アドインのメモリ上で検索します。",
    privacyStorage:
      "アドイン内に提供者側の社員情報データベース、独自API、アクセス解析機能はありません。",
    privacySettings:
      "ファイルのdriveId、itemId、webUrlを利用者のOutlook RoamingSettingsへ保存します。アクセストークンはここに保存しません。",
    privacyAuth:
      "認証はMicrosoft Entra IDとMSALで処理します。認証用の一時保存領域を使用する場合があります。",
    privacyHosting:
      "静的ファイルの取得とMicrosoft 365の利用では、それぞれの配信・認証サービスが通常の通信情報を処理します。本アドイン独自のアクセス解析とは別です。",
    privacyReset:
      "設定の初期化で保存したファイル参照を削除できます。アプリへの同意・利用許可の管理は自社Microsoft 365管理者へ依頼してください。",
    privacyCounter:
      "サポートサイトのアクセス数はSites管理の保存領域で集計し、固定キーと数値だけを保存します。IPアドレス、ユーザー識別子、社員情報、ExcelのURL、Microsoft 365の認証トークンはカウンターに保存しません。外部カウンターサービスへの通信はありません。再表示や確認アクセスを含みます。",
    back: "導入・サポートへ戻る",
  },
  en: {
    supportTitle: "Monja Outlook Hierarchical Address Book — Setup & Support",
    product: "Monja Outlook Hierarchical Address Book",
    release: "First Success G.K. — October 2026 (Initial release)",
    intro:
      "An organizational address book add-in for businesses using Microsoft 365. It works as a plug-in that adds an app to both Outlook on the web and Outlook for desktop.",
    templateHeading: "Excel template",
    templateDownload: "Download the Excel template (.xlsx)",
    templateHelp:
      "Includes named Excel tables Organizations and Members with fictional sample data. Replace the data with your company's organizations and employees, then upload the file to SharePoint or OneDrive for Business. Keep the table names and column headings unchanged. After uploading, use Share → Copy link and enter the shared URL in the add-in.",
    installHeading: "Installation",
    manifestDownload: "Download the production manifest",
    installMethod:
      "Register the downloaded XML file as a custom Outlook add-in, or deploy it through Integrated apps in the Microsoft 365 admin center.",
    installOpen:
      "In a new message, open the address book from Apps and sign in with your work account. Your company may require administrator approval.",
    installExcel:
      "Enter the shared Excel URL from SharePoint or OneDrive for Business. The workbook must contain named tables Organizations and Members.",
    webHeading: "Register the add-in in Outlook on the web",
    webOpen:
      "Open the registration page below and sign in with the Microsoft 365 work account you want to use.",
    webLink: "Open Outlook on the web add-in registration",
    webMyAddins:
      "Select My add-ins. At the bottom, choose Add a custom add-in → Add from File.",
    webFile:
      "Select the downloaded production manifest (manifest.xml) and install it. Download and select the XML file rather than entering its URL directly.",
    webFinish:
      "After registration, start the add-in from Apps in a new message. It also becomes available in new and classic Outlook for the same mailbox.",
    webFallback:
      "If the page does not open, try Microsoft's official add-in management link. If custom registration is unavailable, ask your Microsoft 365 administrator to deploy the add-in.",
    webFallbackLink: "Microsoft's official add-in management link",
    pinHeading: "Keep the pane open (pinning)",
    pinUpdate:
      "Download the production manifest again and update the add-in registration to version 1.1.0.0. If a manually installed add-in does not update, remove and register it again. Keep a copy of your Excel shared URL first.",
    pinAction:
      "Open the add-in from a compose message, then select the pin icon at the top of Outlook's pane.",
    pinNext:
      "Supported Outlook clients can keep the pane open for subsequent compose messages. The user must pin it once initially.",
    pinLimits:
      "Restoring the pane after fully closing and restarting Outlook depends on Outlook. If it is hidden, reopen it from a compose message. Your Excel reference settings are saved. Read and compose modes have separate pinning states.",
    screenshotsHeading: "Screenshots",
    screenshotsHelp:
      "Select an image to open the original in a new tab. These examples show the Japanese user interface.",
    settingsHeading: "1. Select the Excel file",
    settingsHelp:
      "Enter your SharePoint or OneDrive for Business Excel shared URL in Settings, then select Validate and save.",
    settingsOpen: "Open the Excel file settings screenshot at original size",
    settingsAlt:
      "Outlook compose window with the address book settings pane for entering an Excel shared URL on the right",
    settingsCaption:
      "Excel file settings. The shared URL is validated before the settings are saved.",
    loadedHeading: "2. After loading the sample Excel workbook",
    loadedHelp:
      "The organization tree and employee list appear after loading. Search and select employees, then add them to To, Cc, or Bcc.",
    loadedOpen: "Open the loaded sample workbook screenshot at original size",
    loadedAlt:
      "Address book displaying a fictional organization tree, employee list, selection count, and add recipients button",
    loadedCaption:
      "Example after loading the sample workbook. All company and employee information shown is fictional.",
    errorsHeading: "Troubleshooting",
    errorAuth:
      "Authentication or consent error: tell your Microsoft 365 administrator the app name and exact error message. Do not share passwords or tokens.",
    error403:
      "403: check your access to the file and delegated consent for Microsoft Graph.",
    errorTables:
      "Table not found: check the table names and column headings, not just the worksheet names.",
    errorRecipients:
      "Adding recipients: use a compose message and select no more than 100 new recipients per operation.",
    sourceHeading: "Download source code",
    sourceHelp:
      "The source code is published on GitHub. In the repository, select Code → Download ZIP.",
    dataSummary:
      "The add-in retrieves employee information directly from Microsoft Graph using the user's permissions. It does not store it in the provider's database.",
    privacyLink: "Data handling",
    counterLabel: "Page views",
    counterHelp:
      "Includes reloads and verification visits. Only a numeric counter is stored within Sites.",
    counterLoading: "Loading…",
    counterError: "Unable to retrieve count",
    privacyTitle: "Data handling",
    privacyIntro:
      "This page describes how the add-in processes data technically.",
    privacyRead:
      "Organization and employee information is retrieved directly from the user's chosen Microsoft 365 Excel workbook through Microsoft Graph and searched in the add-in's memory.",
    privacyStorage:
      "The add-in has no provider-side employee database, custom API, or analytics feature.",
    privacySettings:
      "The file's driveId, itemId, and webUrl are saved in the user's Outlook RoamingSettings. Access tokens are not saved there.",
    privacyAuth:
      "Authentication is handled by Microsoft Entra ID and MSAL. Temporary authentication storage may be used.",
    privacyHosting:
      "When static files are retrieved and Microsoft 365 is used, the respective hosting and authentication services process ordinary connection information. This is separate from add-in analytics.",
    privacyReset:
      "Resetting settings removes the saved file reference. Ask your Microsoft 365 administrator to manage application consent and access permissions.",
    privacyCounter:
      "Support page views are counted in Sites-managed storage using only a fixed key and a number. The counter does not store IP addresses, user identifiers, employee information, Excel URLs, or Microsoft 365 authentication tokens. No external counter service is contacted. Counts include reloads and verification visits.",
    back: "Back to setup and support",
  },
  "zh-CN": {
    supportTitle: "Monja Outlook 分层通讯录 — 安装与支持",
    product: "Monja Outlook 分层通讯录",
    release: "First Success 合同会社　2026年10月（首次发布）",
    intro:
      "这是一款面向 Microsoft 365 企业用户的组织通讯录加载项，可作为插件在 Outlook 网页版和电脑版中添加应用。",
    templateHeading: "Excel 模板",
    templateDownload: "下载 Excel 模板（.xlsx）",
    templateHelp:
      "模板包含名为 Organizations 和 Members 的正式 Excel 表格及虚构示例数据。请替换为您公司的组织和员工信息，然后上传至 SharePoint 或 OneDrive for Business。请勿更改表格名称和列标题。上传后，通过“共享 → 复制链接”获取共享 URL，并将其填入加载项。",
    installHeading: "安装",
    manifestDownload: "下载正式版清单文件",
    installMethod:
      "将下载的 XML 文件注册为 Outlook 自定义加载项，或通过 Microsoft 365 管理中心的“集成应用”进行部署。",
    installOpen:
      "在新邮件的“应用”中打开组织通讯录，并使用工作帐户登录。您的公司可能要求管理员批准。",
    installExcel:
      "输入 SharePoint 或 OneDrive for Business 上的 Excel 共享 URL。工作簿必须包含名为 Organizations 和 Members 的正式表格。",
    webHeading: "在 Outlook 网页版中注册加载项",
    webOpen: "打开下方注册页面，并使用要使用的 Microsoft 365 工作帐户登录。",
    webLink: "打开 Outlook 网页版加载项注册页面",
    webMyAddins:
      "选择“我的加载项（My add-ins）”，然后在页面底部选择“添加自定义加载项 → 从文件添加”。",
    webFile:
      "选择已下载的正式版清单文件（manifest.xml）并安装。请下载并选择 XML 文件，不要直接输入清单文件的 URL。",
    webFinish:
      "注册后，可从新邮件的“应用”中启动。相同邮箱的新版和经典版 Outlook 也会显示此加载项。",
    webFallback:
      "如果页面无法打开，请尝试 Microsoft 官方加载项管理链接。如果没有自定义注册选项，请联系 Microsoft 365 管理员部署。",
    webFallbackLink: "Microsoft 官方加载项管理链接",
    pinHeading: "保持面板显示（固定）",
    pinUpdate:
      "重新下载上方正式版清单文件，并将加载项注册更新至 1.1.0.0 版。如果手动安装的加载项未更新，请删除后重新注册。操作前请保存 Excel 共享 URL。",
    pinAction:
      "在邮件撰写界面中打开加载项，然后点击 Outlook 面板顶部的固定图标。",
    pinNext:
      "受支持的 Outlook 客户端可在下一次撰写邮件时保持面板显示。首次固定操作需要由用户手动完成。",
    pinLimits:
      "完全关闭并重启 Outlook 后是否恢复面板，由 Outlook 决定。如果未显示，请在邮件撰写界面中重新打开。Excel 引用设置会被保存。阅读模式与撰写模式的固定状态分别管理。",
    screenshotsHeading: "操作截图",
    screenshotsHelp:
      "点击图片可在新标签页中查看原图。截图展示的是日语用户界面。",
    settingsHeading: "1. 指定 Excel 文件",
    settingsHelp:
      "在设置界面输入 SharePoint 或 OneDrive for Business 的 Excel 共享 URL，然后点击“验证并保存”。",
    settingsOpen: "查看 Excel 文件设置界面的原图",
    settingsAlt:
      "Outlook 邮件撰写窗口右侧显示组织通讯录设置面板，用于输入 Excel 共享 URL",
    settingsCaption: "Excel 文件设置界面。保存设置前会验证共享 URL。",
    loadedHeading: "2. 加载示例 Excel 后",
    loadedHelp:
      "加载完成后会显示组织树和员工列表。可搜索并选择员工，然后添加至收件人、抄送或密送。",
    loadedOpen: "查看示例 Excel 加载后界面的原图",
    loadedAlt:
      "组织通讯录显示虚构公司的组织树、员工列表、已选人数和添加收件人按钮",
    loadedCaption:
      "示例工作簿加载后的显示效果。图中的公司和员工信息均为虚构数据。",
    errorsHeading: "故障排除",
    errorAuth:
      "身份验证或授权错误：请向 Microsoft 365 管理员提供应用名称和完整错误信息。请勿共享密码或令牌。",
    error403: "403：请检查文件访问权限以及 Microsoft Graph 的委托授权。",
    errorTables: "找不到表格：请检查表格名称和列标题，而不只是工作表名称。",
    errorRecipients:
      "添加收件人：请在邮件撰写界面中使用，每次新增收件人不超过 100 个。",
    sourceHeading: "下载源代码",
    sourceHelp:
      "源代码已在 GitHub 上公开。请在仓库中选择“Code → Download ZIP”下载。",
    dataSummary:
      "加载项使用用户自身权限直接从 Microsoft Graph 获取员工信息，不会将其保存到提供者的数据库中。",
    privacyLink: "数据处理说明",
    counterLabel: "访问次数",
    counterHelp: "包含刷新和验证访问。Sites 内仅保存计数值。",
    counterLoading: "正在加载…",
    counterError: "无法获取访问次数",
    privacyTitle: "数据处理说明",
    privacyIntro: "本页说明加载项在技术上如何处理数据。",
    privacyRead:
      "组织和员工信息通过 Microsoft Graph 直接从用户指定的 Microsoft 365 Excel 工作簿获取，并在加载项内存中进行搜索。",
    privacyStorage: "加载项不包含提供者端的员工数据库、自定义 API 或分析功能。",
    privacySettings:
      "文件的 driveId、itemId 和 webUrl 保存到用户的 Outlook RoamingSettings 中。访问令牌不会保存在此处。",
    privacyAuth:
      "身份验证由 Microsoft Entra ID 和 MSAL 处理，可能会使用临时身份验证存储。",
    privacyHosting:
      "获取静态文件及使用 Microsoft 365 时，相应的托管和身份验证服务会处理通常的连接信息。这与加载项自身的分析功能不同。",
    privacyReset:
      "重置设置可删除已保存的文件引用。如需管理应用授权和访问权限，请联系 Microsoft 365 管理员。",
    privacyCounter:
      "支持页面的访问次数由 Sites 管理的存储进行统计，仅保存固定标识和数值。计数器不会保存 IP 地址、用户标识、员工信息、Excel URL 或 Microsoft 365 身份验证令牌，也不会连接外部计数服务。统计包含刷新和验证访问。",
    back: "返回安装与支持页面",
  },
};
