import { describe, it, expect } from "vitest";
import {
  parseBook,
  search,
  orgIds,
  selectMembers,
  uniqueRecipients,
  tableRows,
  orgColumns,
  type Row,
} from "../src/model";
const o = (id: string, parent = "", active = true): Row => ({
  OrganizationID: id,
  OrganizationName: id === "root" ? "架空会社" : "営業部",
  ParentOrganizationID: parent,
  DisplayOrder: 1,
  IsActive: active,
});
const m = (id: string, org = "child", email = "taro@example.com"): Row => ({
  MemberID: id,
  DisplayName: "山田太郎",
  Email: email,
  Contact: "123",
  OrganizationID: org,
  Position: "課長",
  DisplayOrder: 1,
  IsActive: true,
});
const book = () =>
  parseBook(
    [o("root"), o("child", "root")],
    [
      m("1"),
      m("1", "root"),
      m("2", "child", "TARO@example.com"),
      m("3", "child", "bad"),
    ],
  );
describe("organization data", () => {
  it("builds arbitrary-depth hierarchy without recursion", () => {
    const rows = Array.from({ length: 12000 }, (_, i) =>
      o("n" + i, i ? "n" + (i - 1) : ""),
    );
    const b = parseBook(rows, []);
    expect(orgIds(b, "n0", true).size).toBe(12000);
  });
  it("detects cycles", () =>
    expect(() => parseBook([o("a", "b"), o("b", "a")], [])).toThrow(/Cycle/));
  it("detects missing parents", () =>
    expect(() => parseBook([o("a", "missing")], [])).toThrow(/Missing parent/));
  it("rejects duplicate IDs", () =>
    expect(() => parseBook([o("a"), o("a")], [])).toThrow());
  it("hides inactive branches and people", () =>
    expect(
      parseBook([o("root", "", false), o("child", "root")], [m("1")]).members,
    ).toEqual([]));
  it("checks headers and data types", () => {
    expect(() => tableRows([["OrganizationID"]], [], orgColumns)).toThrow(
      /Missing column/,
    );
    expect(() => parseBook([{ ...o("a"), IsActive: "yes" }], [])).toThrow();
  });
  it("name search supports Japanese", () =>
    expect(search(book(), "山田", "name", "", true)).toHaveLength(4));
  it("department search includes descendants optionally", () => {
    expect(search(book(), "架空", "org", "", true)).toHaveLength(4);
    expect(search(book(), "架空", "org", "", false)).toHaveLength(1);
  });
  it("email search ignores case", () =>
    expect(search(book(), "TARO@", "email", "", true)).toHaveLength(3));
  it("all fields includes contact and position", () =>
    expect(search(book(), "課長", "all", "", true)).toHaveLength(4));
  it("selects multiple people, deselects, rejects invalid email", () => {
    const b = book();
    const selected = selectMembers(new Set(), b.members, true);
    expect(selected.size).toBe(3);
    expect(selectMembers(selected, [b.members[0]], false).size).toBe(2);
  });
  it("department bulk selection", () => {
    const b = book(),
      ids = orgIds(b, "root", true);
    expect(
      selectMembers(
        new Set(),
        b.members.filter((m) => ids.has(m.org)),
        true,
      ).size,
    ).toBe(3);
  });
  it("deduplicates email including existing recipients", () => {
    expect(uniqueRecipients(book().members)).toHaveLength(1);
    expect(uniqueRecipients(book().members, ["taro@example.com"])).toHaveLength(
      0,
    );
  });
});
