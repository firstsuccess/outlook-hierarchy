import fs from "node:fs/promises";
import { translations } from "../public/support-translations.js";
const ja = translations.ja;
const esc = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const text = (tag, key, extra = "") =>
  `<${tag} data-i18n="${key}"${extra}>${esc(ja[key])}</${tag}>`;
const link = (href, key, extra = "") =>
  text("a", key, ` href="${esc(href)}"${extra}`);
const external = ' target="_blank" rel="noopener noreferrer"';
const languages = `<div class="language-bar"><label for="site-language">Language / 言語 / 语言</label><select id="site-language"><option value="ja" lang="ja">日本語</option><option value="en" lang="en">English</option><option value="zh-CN" lang="zh-CN">简体中文</option></select></div>`;
function page(title, content, counter = false) {
  return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${text("title", title)}<link rel="stylesheet" href="/support.css?v=admin1"><script type="module" src="/support-i18n.js?v=admin1"></script>${counter ? '<script type="module" src="/support-counter.js?v=i18n1"></script>' : ""}</head><body>${languages}<main>${content}</main></body></html>`;
}
const screenshot = (file, keys, width, height) =>
  `<figure><a href="images/${file}"${external} data-i18n-aria="${keys}Open" aria-label="${esc(ja[keys + "Open"])}"><img src="images/${file}" data-i18n-alt="${keys}Alt" alt="${esc(ja[keys + "Alt"])}" width="${width}" height="${height}" loading="lazy"></a>${text("figcaption", keys + "Caption")}</figure>`;
const support = page(
  "supportTitle",
  `
${text("h1", "product")}${text("p", "release")}${text("p", "intro")}
<section class="setup-guide" aria-labelledby="setup-guide-heading">${text("h2", "setupHeading", ' id="setup-guide-heading"')}
<div class="setup-step">${text("h3", "adminHeading")}${text("p", "adminSummary")}
<ol><li>${link("https://admin.microsoft.com/", "adminLink", external)}${text("p", "adminPath")}</li><li>${link("manifest.xml", "manifestDownload", " download")}${text("p", "adminUpload")}</li>${text("li", "adminAssign")}${text("li", "adminWorkbook")}</ol>
${text("p", "adminConsent")}<p>${link("https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-deployment-of-add-ins", "adminDocs", external)}</p></div>
<div class="setup-step user-step">${text("h3", "userHeading")}<p class="key-message">${text("strong", "userRequired")}</p>
<ol>${text("li", "userGetLink")}${text("li", "userOpen")}${text("li", "userSave")}</ol>${text("p", "userPermissions")}${text("p", "userStored")}
<p>${link("#screenshots-heading", "userScreenshotLink")}</p></div></section>
${text("h2", "templateHeading")}<p>${link("templates/OrganizationAddressBook.xlsx", "templateDownload", ' download="OrganizationAddressBook.xlsx"')}</p>${text("p", "templateHelp")}
${text("h2", "installHeading")}<ol><li>${link("manifest.xml", "manifestDownload", " download")} ${text("span", "installMethod")}</li>${text("li", "installOpen")}${text("li", "installExcel")}</ol>
<section aria-labelledby="web-registration-heading">${text("h2", "webHeading", ' id="web-registration-heading"')}
<ol><li>${text("span", "webOpen")}<p>${link("https://outlook.office.com/owa/?path=/options/manageapps", "webLink", external)}</p></li>${text("li", "webMyAddins")}${text("li", "webFile")}${text("li", "webFinish")}</ol>
${text("p", "webFallback")}<p>${link("https://aka.ms/olksideload", "webFallbackLink", external)}</p></section>
${text("h2", "pinHeading")}<ol>${text("li", "pinUpdate")}${text("li", "pinAction")}${text("li", "pinNext")}</ol>${text("p", "pinLimits")}
<section aria-labelledby="screenshots-heading">${text("h2", "screenshotsHeading", ' id="screenshots-heading"')}${text("p", "screenshotsHelp")}
${text("h3", "settingsHeading")}${text("p", "settingsHelp")}${screenshot("excel-settings.png", "settings", 1115, 494)}
${text("h3", "loadedHeading")}${text("p", "loadedHelp")}${screenshot("sample-excel-view.png", "loaded", 278, 994)}</section>
${text("h2", "errorsHeading")}<ul>${["errorAuth", "error403", "errorTables", "errorRecipients"].map((k) => text("li", k)).join("")}</ul>
${text("h2", "sourceHeading")}${text("p", "sourceHelp")}<p><a href="https://github.com/firstsuccess/outlook-hierarchy"${external}>https://github.com/firstsuccess/outlook-hierarchy</a></p>
${text("p", "dataSummary")}<p>${link("privacy.html", "privacyLink", " data-language-link")}</p>
<footer><p>${text("span", "counterLabel")} <output id="support-counter" aria-live="polite">${esc(ja.counterLoading)}</output></p>${text("p", "counterHelp", ' class="small"')}</footer>
`,
  true,
);
const privacy = page(
  "privacyTitle",
  `${text("h1", "privacyTitle")}${text("p", "privacyIntro")}<ul>${["privacyRead", "privacyStorage", "privacySettings", "privacyAuth", "privacyHosting", "privacyReset", "privacyCounter"].map((k) => text("li", k)).join("")}</ul><p>${link("support.html", "back", " data-language-link")}</p>`,
);
await fs.writeFile("public/support.html", support);
await fs.writeFile("public/privacy.html", privacy);
console.log("Support and data handling pages generated (ja / en / zh-CN)");


