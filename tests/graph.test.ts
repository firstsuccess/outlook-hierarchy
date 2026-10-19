import { beforeEach, it, expect, vi } from "vitest";
vi.mock("../src/auth", () => ({ token: vi.fn(async () => "fake-token") }));
import {
  graph,
  resolveFile,
  loadBook,
  validateUrl,
  shareId,
} from "../src/graph";
beforeEach(() => vi.unstubAllGlobals());
const response = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
it("accepts business SharePoint URL and rejects unsafe or personal URL", () => {
  expect(validateUrl("https://tenant-my.sharepoint.com/:x:/test")).toContain(
    "sharepoint.com",
  );
  for (const u of [
    "http://x.sharepoint.com/a",
    "https://sharepoint.com.evil.com/a",
    "https://user:pass@x.sharepoint.com/a",
    "https://onedrive.live.com/a",
    "javascript:alert(1)",
  ])
    expect(() => validateUrl(u)).toThrow();
  expect(shareId("https://x.sharepoint.com/組織.xlsx")).toMatch(
    /^u![A-Za-z0-9_-]+$/,
  );
});
it("resolves xlsx reference", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      response({
        id: "item",
        name: "file.xlsx",
        parentReference: { driveId: "drive" },
        file: {},
        webUrl: "https://x.sharepoint.com/a.xlsx",
      }),
    ),
  );
  expect(await resolveFile("https://x.sharepoint.com/a.xlsx")).toEqual({
    driveId: "drive",
    itemId: "item",
    webUrl: "https://x.sharepoint.com/a.xlsx",
  });
});
it("rejects non-xlsx file", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      response({
        id: "item",
        name: "file.pdf",
        parentReference: { driveId: "drive" },
        file: {},
      }),
    ),
  );
  await expect(resolveFile("https://x.sharepoint.com/a.pdf")).rejects.toThrow(
    /xlsx/,
  );
});
it("refreshes token once on 401", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(response({}, 401))
    .mockResolvedValueOnce(response({ ok: true }));
  vi.stubGlobal("fetch", fetcher);
  expect(await graph("/me/drive")).toEqual({ ok: true });
  expect(fetcher).toHaveBeenCalledTimes(2);
});
it("does not send tokens to untrusted pagination URL", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  await expect(graph("https://evil.example/v1.0/me")).rejects.toThrow();
  expect(fetcher).not.toHaveBeenCalled();
});
it("rejects missing workbook tables", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => response({ value: [] })),
  );
  await expect(
    loadBook({
      driveId: "d",
      itemId: "i",
      webUrl: "https://x.sharepoint.com/a",
    }),
  ).rejects.toThrow(/Missing table/);
});
it("reads headers, follows paginated rows, validates book", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string) => {
      const p = new URL(input).pathname;
      if (p.endsWith("/tables"))
        return response({
          value: [
            { id: "o", name: "Organizations" },
            { id: "m", name: "Members" },
          ],
        });
      if (p.endsWith("/o/headerRowRange"))
        return response({
          values: [
            [
              "OrganizationID",
              "OrganizationName",
              "ParentOrganizationID",
              "DisplayOrder",
              "IsActive",
            ],
          ],
        });
      if (p.endsWith("/m/headerRowRange"))
        return response({
          values: [
            [
              "MemberID",
              "DisplayName",
              "Email",
              "Contact",
              "OrganizationID",
              "Position",
              "DisplayOrder",
              "IsActive",
            ],
          ],
        });
      if (p.endsWith("/o/rows"))
        return response({
          value: [{ values: [["root", "会社", "", 1, true]] }],
        });
      if (p.endsWith("/m/rows"))
        return response({
          value: [
            {
              values: [
                ["m1", "青空", "a@example.com", "", "root", "部長", 1, true],
              ],
            },
          ],
          "@odata.nextLink": "https://graph.microsoft.com/v1.0/page2",
        });
      if (p.endsWith("/page2"))
        return response({
          value: [
            {
              values: [
                ["m2", "山田", "b@example.com", "", "root", "担当", 2, true],
              ],
            },
          ],
        });
      throw Error("Unexpected path");
    }),
  );
  const book = await loadBook({
    driveId: "d",
    itemId: "i",
    webUrl: "https://x.sharepoint.com/a",
  });
  expect(book.orgs).toHaveLength(1);
  expect(book.members).toHaveLength(2);
});
