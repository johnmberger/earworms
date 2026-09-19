import { describe, expect, it } from "vitest";
import {
  DEFAULT_META,
  OG_IMAGE_PATH,
  SITE_URL,
  resolveOgImage,
  toAbsoluteUrl,
} from "@/lib/siteMeta";

describe("toAbsoluteUrl", () => {
  it("defaults to the site root", () => {
    expect(toAbsoluteUrl()).toBe(SITE_URL);
    expect(toAbsoluteUrl("")).toBe(SITE_URL);
  });

  it("keeps absolute URLs", () => {
    expect(toAbsoluteUrl("https://cdn.example/x.png")).toBe(
      "https://cdn.example/x.png"
    );
  });

  it("prefixes relative paths", () => {
    expect(toAbsoluteUrl("/top")).toBe(`${SITE_URL}/top`);
    expect(toAbsoluteUrl("me")).toBe(`${SITE_URL}/me`);
    expect(toAbsoluteUrl("/top?period=1month")).toBe(
      `${SITE_URL}/top?period=1month`
    );
  });
});

describe("resolveOgImage", () => {
  it("uses the default OG asset when unset or blank", () => {
    expect(resolveOgImage()).toBe(DEFAULT_META.image);
    expect(resolveOgImage("")).toBe(DEFAULT_META.image);
    expect(resolveOgImage("   ")).toBe(DEFAULT_META.image);
    expect(DEFAULT_META.image).toBe(`${SITE_URL}${OG_IMAGE_PATH}`);
  });

  it("absolutizes custom image paths", () => {
    expect(resolveOgImage("/custom.png")).toBe(`${SITE_URL}/custom.png`);
  });
});
