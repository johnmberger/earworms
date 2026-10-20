import { afterEach, describe, expect, it, vi } from "vitest";
import { clearTtlCache, withTtlCache } from "@/lib/lastfm/cache";

afterEach(() => {
  clearTtlCache();
  vi.useRealTimers();
});

describe("withTtlCache", () => {
  it("loads once within the TTL window", async () => {
    const load = vi.fn(async () => "payload");

    await expect(withTtlCache("k", 60, load)).resolves.toBe("payload");
    await expect(withTtlCache("k", 60, load)).resolves.toBe("payload");
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("reloads after expiry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-15T12:00:00Z"));
    const load = vi.fn(async () => Math.random());

    const first = await withTtlCache("expire", 10, load);
    vi.setSystemTime(new Date("2026-08-15T12:00:15Z"));
    const second = await withTtlCache("expire", 10, load);

    expect(load).toHaveBeenCalledTimes(2);
    expect(second).not.toBe(first);
  });

  it("keeps separate keys independent", async () => {
    const loadA = vi.fn(async () => "a");
    const loadB = vi.fn(async () => "b");

    await expect(withTtlCache("a", 60, loadA)).resolves.toBe("a");
    await expect(withTtlCache("b", 60, loadB)).resolves.toBe("b");
    expect(loadA).toHaveBeenCalledTimes(1);
    expect(loadB).toHaveBeenCalledTimes(1);
  });
});
