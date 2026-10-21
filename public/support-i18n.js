import { translations } from "./support-translations.js?v=admin1";
export const languageKey = "monja.support.language";
export function resolveLanguage(requested, saved) {
  return [requested, saved, "ja"].find((value) =>
    ["ja", "en", "zh-CN"].includes(value),
  );
}
export function translateDocument(doc, language) {
  const lang = resolveLanguage(language),
    strings = translations[lang];
  doc.documentElement.lang = lang;
  for (const node of doc.querySelectorAll("[data-i18n]")) {
    const value = strings[node.dataset.i18n];
    if (typeof value === "string") node.textContent = value;
  }
  for (const [marker, attribute] of [
    ["data-i18n-alt", "alt"],
    ["data-i18n-aria", "aria-label"],
  ]) {
    for (const node of doc.querySelectorAll(`[${marker}]`)) {
      const value = strings[node.getAttribute(marker)];
      if (typeof value === "string") node.setAttribute(attribute, value);
    }
  }
  for (const node of doc.querySelectorAll("[data-language-link]")) {
    const url = new URL(node.getAttribute("href"), doc.baseURI);
    url.searchParams.set("lang", lang);
    node.setAttribute("href", url.pathname + url.search + url.hash);
  }
  const select = doc.getElementById("site-language");
  if (select) select.value = lang;
  return lang;
}
if (typeof document !== "undefined") {
  const select = document.getElementById("site-language");
  let saved;
  try {
    saved = localStorage.getItem(languageKey);
  } catch {}
  const url = new URL(location.href);
  translateDocument(
    document,
    resolveLanguage(url.searchParams.get("lang"), saved),
  );
  select?.addEventListener("change", () => {
    const lang = translateDocument(document, select.value);
    try {
      localStorage.setItem(languageKey, lang);
    } catch {}
    const current = new URL(location.href);
    current.searchParams.set("lang", lang);
    history.replaceState(null, "", current.href);
    document.dispatchEvent(new Event("support-language-change"));
  });
}
