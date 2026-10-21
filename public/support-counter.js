import { translations } from "./support-translations.js";
export function counterText(count, language, failed = false) {
  const lang = Object.hasOwn(translations, language) ? language : "ja";
  if (failed) return translations[lang].counterError;
  return count === undefined
    ? translations[lang].counterLoading
    : count.toLocaleString(lang);
}
if (typeof document !== "undefined") {
  const display = document.getElementById("support-counter");
  if (display) {
    let count,
      failed = false;
    const render = () => {
      display.textContent = counterText(
        count,
        document.documentElement.lang,
        failed,
      );
    };
    document.addEventListener("support-language-change", render);
    render();
    // One increment per page load. Language changes only reformat this value.
    fetch("/api/support-counter", {
      method: "POST",
      credentials: "omit",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    })
      .then(async (response) => {
        if (!response.ok) throw Error("Counter unavailable");
        const data = await response.json();
        if (!Number.isSafeInteger(data.count) || data.count < 20)
          throw Error("Invalid counter");
        count = data.count;
        render();
      })
      .catch(() => {
        failed = true;
        render();
      });
  }
}
