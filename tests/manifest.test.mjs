import { readFileSync } from "node:fs";
import { it, expect } from "vitest";
import { generateManifest } from "../scripts/manifest.mjs";
const published =
  "https://outlook-hierarchy-address-book.mnoda1979.chatgpt.site/";
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
  expect(readFileSync("public/manifest.xml", "utf8")).toBe(
    generateManifest(published),
  );
  expect(readFileSync("manifest.xml", "utf8")).toBe(generateManifest());
});
