import { readFileSync } from "node:fs";
import { it, expect } from "vitest";
import { generateManifest } from "../scripts/manifest.mjs";
const published =
  "https://outlook-hierarchy-address-book.mnoda1979.chatgpt.site/";
// Git on Windows can check XML files out as CRLF. Ignore only that transport
// difference; keep comparing every other character so stale manifests fail.
const normalizeEol = (text) => text.replace(/\r\n/g, "\n");
it("enables compose pinning only in the v1.1 / Mailbox 1.5 override", () => {
  const xml = generateManifest(published);
  const boundary = xml.indexOf(
    '<VersionOverrides xmlns="http://schemas.microsoft.com/office/mailappversionoverrides/1.1"',
  );
  expect(boundary).toBeGreaterThan(0);
  const fallback = xml.slice(0, boundary),
    pinned = xml.slice(boundary);
  expect(fallback).toContain('DefaultMinVersion="1.3"');
  expect(fallback).not.toContain("SupportsPinning");
  expect(pinned).toContain('DefaultMinVersion="1.5"');
  expect(pinned).toContain('xsi:type="MessageComposeCommandSurface"');
  expect(pinned).toMatch(
    /<Action xsi:type="ShowTaskpane">\s*<SourceLocation[^>]+\/>\s*<SupportsPinning>true<\/SupportsPinning>/,
  );
  expect(pinned).toContain("<Resources>");
  expect(xml).toContain("<Id>c4fa631b-08aa-4688-9d53-6e02ed879839</Id>");
  expect(xml).toContain("<Version>1.1.0.0</Version>");
  expect(xml).not.toContain("localhost");
});
it("ships generated public and development manifests without stale copies", () => {
  expect(normalizeEol(readFileSync("public/manifest.xml", "utf8"))).toBe(
    normalizeEol(generateManifest(published)),
  );
  expect(normalizeEol(readFileSync("manifest.xml", "utf8"))).toBe(
    normalizeEol(generateManifest()),
  );
});
it("accepts CRLF checkouts while still rejecting a change to pinning support", () => {
  const expected = generateManifest(published);
  const windowsCheckout = expected.replace(/\n/g, "\r\n");
  expect(windowsCheckout).not.toBe(expected);
  expect(normalizeEol(windowsCheckout)).toBe(normalizeEol(expected));
  const stale = windowsCheckout.replace(
    "<SupportsPinning>true</SupportsPinning>",
    "<SupportsPinning>false</SupportsPinning>",
  );
  expect(normalizeEol(stale)).not.toBe(normalizeEol(expected));
});
