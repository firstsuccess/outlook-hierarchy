import { readFileSync } from "node:fs";
import { afterEach, it, expect, vi } from "vitest";
import { translations } from "../public/support-translations.js";
import { resolveLanguage, translateDocument } from "../public/support-i18n.js";
import { counterText } from "../public/support-counter.js";
afterEach(() => vi.unstubAllGlobals());
it("provides complete non-empty translations for Japanese, English, and Simplified Chinese", () => {
  const keys = Object.keys(translations.ja).sort();
  for (const language of ["ja", "en", "zh-CN"]) {
    expect(Object.keys(translations[language]).sort()).toEqual(keys);
    for (const text of Object.values(translations[language]))
      expect(text.trim().length).toBeGreaterThan(0);
  }
  for (const file of ["public/support.html", "public/privacy.html"]) {
    const html = readFileSync(file, "utf8");
    for (const match of html.matchAll(/data-i18n(?:-alt|-aria)?="([^"]+)"/g))
      expect(keys).toContain(match[1]);
  }
});
it("defaults to Japanese and lets an explicit share-link language override saved settings", () => {
  expect(resolveLanguage()).toBe("ja");
  expect(resolveLanguage("en", "zh-CN")).toBe("en");
  expect(resolveLanguage("invalid", "zh-CN")).toBe("zh-CN");
  expect(resolveLanguage("constructor")).toBe("ja");
});
it("updates page text, language, image descriptions, and the data-handling link", () => {
  const title = { dataset: { i18n: "product" }, textContent: "" };
  const attributes = { "data-i18n-alt": "settingsAlt" };
  const image = {
    getAttribute: (key) => attributes[key],
    setAttribute: (key, value) => {
      attributes[key] = value;
    },
  };
  let href = "privacy.html";
  const link = {
    getAttribute: () => href,
    setAttribute: (_key, value) => {
      href = value;
    },
  };
  const selector = { value: "ja" };
  const doc = {
    documentElement: { lang: "ja" },
    baseURI: "https://example.test/support",
    getElementById: () => selector,
    querySelectorAll: (query) =>
      ({
        "[data-i18n]": [title],
        "[data-i18n-alt]": [image],
        "[data-i18n-aria]": [],
        "[data-language-link]": [link],
      })[query],
  };
  translateDocument(doc, "en");
  expect(title.textContent).toBe(translations.en.product);
  expect(doc.documentElement.lang).toBe("en");
  expect(href).toBe("/privacy.html?lang=en");
  translateDocument(doc, "zh-CN");
  expect(title.textContent).toBe(translations["zh-CN"].product);
  expect(attributes.alt).toBe(translations["zh-CN"].settingsAlt);
  expect(selector.value).toBe("zh-CN");
});
it("keeps the requested Web registration URL, downloads, screenshots, and source repository", () => {
  const html = readFileSync("public/support.html", "utf8");
  for (const href of [
    "https://outlook.office.com/owa/?path=/options/manageapps",
    "https://aka.ms/olksideload",
    "templates/OrganizationAddressBook.xlsx",
    "manifest.xml",
    "images/excel-settings.png",
    "images/sample-excel-view.png",
    "https://github.com/firstsuccess/outlook-hierarchy",
  ])
    expect(html).toContain(href);
  expect(html).toContain('id="site-language"');
  expect(html).toContain('value="zh-CN"');
});
it("translates counter status without incrementing when the language changes", async () => {
  vi.resetModules();
  const output = { textContent: "" };
  const events = new Map();
  const doc = {
    documentElement: { lang: "ja" },
    getElementById: () => output,
    addEventListener: (name, handler) => events.set(name, handler),
  };
  const fetcher = vi.fn(async () => ({
    ok: true,
    json: async () => ({ count: 1234 }),
  }));
  vi.stubGlobal("document", doc);
  vi.stubGlobal("fetch", fetcher);
  await import("../public/support-counter.js");
  await vi.waitFor(() => expect(output.textContent).toBe("1,234"));
  doc.documentElement.lang = "en";
  events.get("support-language-change")();
  doc.documentElement.lang = "zh-CN";
  events.get("support-language-change")();
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(counterText(undefined, "en")).toBe("Loading…");
  expect(counterText(undefined, "zh-CN", true)).toBe("无法获取访问次数");
});
