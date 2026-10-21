import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";

export function generateManifest(input = "https://localhost:3002/") {
  const base = new URL(input);
  if (
    base.protocol !== "https:" ||
    base.search ||
    base.hash ||
    base.username ||
    base.password
  )
    throw Error("HTTPS base URL required");
  if (!base.pathname.endsWith("/")) base.pathname += "/";
  const esc = (s) =>
    s
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;");
  const u = (p) => esc(new URL(p, base).href);
  const resources = `
    <Resources>
      <bt:Images>${[16, 32, 80].map((n) => `<bt:Image id="Icon.${n}" DefaultValue="${u(`assets/icon-${n}.png`)}"/>`).join("")}</bt:Images>
      <bt:Urls><bt:Url id="Taskpane.Url" DefaultValue="${u("index.html")}"/></bt:Urls>
      <bt:ShortStrings>
        <bt:String id="Group.Label" DefaultValue="組織アドレス帳"><bt:Override Locale="en-US" Value="Address Book"/></bt:String>
        <bt:String id="Button.Label" DefaultValue="組織アドレス帳"><bt:Override Locale="en-US" Value="Hierarchy Address Book"/></bt:String>
      </bt:ShortStrings>
      <bt:LongStrings><bt:String id="Button.Description" DefaultValue="組織から社員を検索して宛先へ追加"><bt:Override Locale="en-US" Value="Find people and add them as recipients"/></bt:String></bt:LongStrings>
    </Resources>`;
  function overridesContent(pin) {
    return `
    <Requirements><bt:Sets DefaultMinVersion="${pin ? "1.5" : "1.3"}"><bt:Set Name="Mailbox"/></bt:Sets></Requirements>
    <Hosts><Host xsi:type="MailHost"><DesktopFormFactor>
      <FunctionFile resid="Taskpane.Url"/>
      <ExtensionPoint xsi:type="MessageComposeCommandSurface"><OfficeTab id="TabDefault"><Group id="Hierarchy.Group">
        <Label resid="Group.Label"/>
        <Control xsi:type="Button" id="Hierarchy.Open">
          <Label resid="Button.Label"/>
          <Supertip><Title resid="Button.Label"/><Description resid="Button.Description"/></Supertip>
          <Icon>${[16, 32, 80].map((n) => `<bt:Image size="${n}" resid="Icon.${n}"/>`).join("")}</Icon>
          <Action xsi:type="ShowTaskpane">
            <SourceLocation resid="Taskpane.Url"/>
            ${pin ? "<SupportsPinning>true</SupportsPinning>" : ""}
          </Action>
        </Control>
      </Group></OfficeTab></ExtensionPoint>
    </DesktopFormFactor></Host></Hosts>
    ${resources}`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<OfficeApp xmlns="http://schemas.microsoft.com/office/appforoffice/1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bt="http://schemas.microsoft.com/office/officeappbasictypes/1.0" xsi:type="MailApp">
  <Id>c4fa631b-08aa-4688-9d53-6e02ed879839</Id>
  <Version>1.1.0.0</Version>
  <ProviderName>Hierarchy Address Book Contributors</ProviderName>
  <DefaultLocale>ja-JP</DefaultLocale>
  <DisplayName DefaultValue="Outlook階層型組織アドレス帳"><Override Locale="en-US" Value="Hierarchy Address Book"/></DisplayName>
  <Description DefaultValue="Excel Onlineの組織を検索してメール宛先に追加します。"><Override Locale="en-US" Value="Browse an Excel organization hierarchy and add recipients."/></Description>
  <IconUrl DefaultValue="${u("assets/icon-64.png")}"/>
  <HighResolutionIconUrl DefaultValue="${u("assets/icon-128.png")}"/>
  <SupportUrl DefaultValue="${u("support.html")}"/>
  <AppDomains><AppDomain>${esc(base.origin)}</AppDomain><AppDomain>https://login.microsoftonline.com</AppDomain></AppDomains>
  <Hosts><Host Name="Mailbox"/></Hosts>
  <Requirements><Sets><Set Name="Mailbox" MinVersion="1.3"/></Sets></Requirements>
  <FormSettings><Form xsi:type="ItemEdit"><DesktopSettings><SourceLocation DefaultValue="${u("index.html")}"/></DesktopSettings></Form></FormSettings>
  <Permissions>ReadWriteItem</Permissions>
  <Rule xsi:type="ItemIs" ItemType="Message" FormType="Edit"/>
  <DisableEntityHighlighting>false</DisableEntityHighlighting>
  <VersionOverrides xmlns="http://schemas.microsoft.com/office/mailappversionoverrides" xsi:type="VersionOverridesV1_0">
    ${overridesContent(false)}
    <VersionOverrides xmlns="http://schemas.microsoft.com/office/mailappversionoverrides/1.1" xsi:type="VersionOverridesV1_1">
      ${overridesContent(true)}
    </VersionOverrides>
  </VersionOverrides>
</OfficeApp>`;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const destination = process.argv[3] || "manifest.xml";
  await fs.writeFile(destination, generateManifest(process.argv[2]));
  console.log(`${destination} generated`);
}
