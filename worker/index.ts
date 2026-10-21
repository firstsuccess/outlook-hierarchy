interface Statement {
  bind(...values: unknown[]): Statement;
  first<T>(): Promise<T | null>;
}
export interface CounterEnvironment {
  DB: { prepare(sql: string): Statement };
}
type Asset = { body: string; type: string };
const assets: Record<string, Asset> = /*__SITE_ASSETS__*/ {};
function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export async function counter(request: Request, env: CounterEnvironment) {
  if (!["GET", "POST"].includes(request.method))
    return new Response(null, { status: 405, headers: { Allow: "GET, POST" } });
  if (request.method === "POST") {
    if (request.headers.get("Origin") !== new URL(request.url).origin)
      return json({ error: "Forbidden" }, 403);
    if (request.headers.get("Sec-Fetch-Site") === "cross-site")
      return json({ error: "Forbidden" }, 403);
  }
  try {
    // First visit creates the counter at 20. Following visits increment atomically.
    const row =
      request.method === "POST"
        ? await env.DB.prepare(
            "INSERT INTO page_counters (id) VALUES (?) ON CONFLICT(id) DO UPDATE SET value = value + 1 RETURNING value",
          )
            .bind("support")
            .first<{ value: number }>()
        : await env.DB.prepare("SELECT value FROM page_counters WHERE id = ?")
            .bind("support")
            .first<{ value: number }>();
    return json({ count: row?.value ?? 20 });
  } catch {
    return json({ error: "Counter temporarily unavailable" }, 503);
  }
}
export default {
  async fetch(request: Request, env: CounterEnvironment): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/support-counter") return counter(request, env);
    if (!["GET", "HEAD"].includes(request.method))
      return new Response(null, {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    let path = url.pathname;
    if (path === "/") path = "/index.html";
    if (["/support", "/privacy", "/auth"].includes(path)) path += ".html";
    const asset = assets[path];
    if (!asset) return new Response("Not found", { status: 404 });
    const bytes = Uint8Array.from(atob(asset.body), (c) => c.charCodeAt(0));
    return new Response(request.method === "HEAD" ? null : bytes, {
      headers: {
        "Content-Type": asset.type,
        "Cache-Control":
          asset.type.startsWith("text/html") ||
          path === "/support.css" ||
          (path.startsWith("/support-") && path.endsWith(".js"))
            ? "no-cache"
            : "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
};
