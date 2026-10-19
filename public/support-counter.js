(() => {
  const display = document.getElementById("support-counter");
  if (!display) return;
  fetch("/api/support-counter", {
    method: "POST",
    credentials: "omit",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("Counter unavailable");
      const data = await response.json();
      if (!Number.isSafeInteger(data.count) || data.count < 20)
        throw new Error("Invalid counter");
      display.textContent = data.count.toLocaleString("ja-JP");
    })
    .catch(() => {
      display.textContent = "取得できませんでした";
    });
})();
