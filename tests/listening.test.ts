import { describe, expect, it } from "vitest";
import {
  averagePlaysPerDay,
  computeDepth,
  computeListeningDensity,
  computeListeningTiming,
  getEasternHour,
  computeOverlap,
  formatAccountAge,
  formatHourLabel,
} from "@/lib/listening";
import type { ChartTops } from "@/lib/schemas";
import type { Track } from "@/lib/schemas";

function trackAtUnix(uts: number, name = "song"): Track {
  return {
    name,
    artist: { "#text": "Artist", mbid: "" },
    album: { "#text": "Album", mbid: "" },
    image: [],
    url: "https://example.com",
    date: { uts: String(uts), "#text": "" },
  } as Track;
}

function trackAt(iso: string, name = "song"): Track {
  const uts = String(Math.floor(new Date(iso).getTime() / 1000));
  return {
    name,
    artist: { "#text": "Artist", mbid: "" },
    album: { "#text": "Album", mbid: "" },
    image: [],
    url: "https://example.com",
    date: { uts, "#text": iso },
  } as Track;
}

describe("computeDepth", () => {
  it("returns null for an empty chart", () => {
    expect(computeDepth([])).toBeNull();
  });

  it("sums plays and computes leader shares", () => {
    const depth = computeDepth(
      [
        { name: "A", playcount: "40" },
        { name: "B", playcount: "30" },
        { name: "C", playcount: "20" },
        { name: "D", playcount: "10" },
      ],
      3
    );

    expect(depth).toMatchObject({
      uniqueArtists: 4,
      totalPlays: 100,
      playsPerArtist: 25,
      leadersSharePercent: 90,
    });
    expect(depth!.leaders).toHaveLength(3);
    expect(depth!.leaders[0]).toEqual({
      name: "A",
      plays: 40,
      sharePercent: 40,
    });
  });
});

describe("computeListeningDensity", () => {
  const now = new Date("2026-08-15T15:00:00");

  it("ignores now-playing rows without timestamps", () => {
    const np = {
      name: "live",
      artist: { "#text": "A", mbid: "" },
      album: { "#text": "", mbid: "" },
      image: [],
      url: "https://example.com",
      "@attr": { nowplaying: "true" },
    } as Track;
    expect(computeListeningDensity([np], now)).toBeNull();
  });

  it("splits today / yesterday and averages across sample days", () => {
    const density = computeListeningDensity(
      [
        trackAt("2026-08-15T10:00:00"),
        trackAt("2026-08-15T11:00:00"),
        trackAt("2026-08-14T12:00:00"),
        trackAt("2026-08-13T12:00:00"),
      ],
      now
    );

    expect(density).toEqual({
      today: 2,
      yesterday: 1,
      samplePlays: 4,
      sampleDays: 3,
      recentDailyAvg: 1.3,
    });
  });
});

describe("getEasternHour", () => {
  it("maps UTC instants into America/New_York wall time", () => {
    // 2026-08-15 is EDT (UTC−4)
    expect(getEasternHour(Date.UTC(2026, 7, 15, 14, 0))).toBe(10);
    expect(getEasternHour(Date.UTC(2026, 7, 15, 4, 0))).toBe(0);
  });
});

describe("computeListeningTiming", () => {
  it("returns null with no stamped plays", () => {
    expect(computeListeningTiming([])).toBeNull();
  });

  it("buckets scrobbles into Eastern Time hours", () => {
    // 14:10/14:40/14:55 and 09:00 UTC → 10am and 5am ET in August
    const timing = computeListeningTiming([
      trackAtUnix(Date.UTC(2026, 7, 15, 14, 10) / 1000),
      trackAtUnix(Date.UTC(2026, 7, 15, 14, 40) / 1000),
      trackAtUnix(Date.UTC(2026, 7, 15, 14, 55) / 1000),
      trackAtUnix(Date.UTC(2026, 7, 15, 9, 0) / 1000),
    ]);

    expect(timing?.peakHour).toBe(10);
    expect(timing?.peakHourLabel).toBe("10am");
    expect(timing?.peakSharePercent).toBe(75);
    expect(timing?.samplePlays).toBe(4);
    expect(timing?.hours[10]).toBe(3);
    expect(timing?.hours[5]).toBe(1);
  });
});

describe("formatHourLabel", () => {
  it("formats 12-hour labels", () => {
    expect(formatHourLabel(0)).toBe("12am");
    expect(formatHourLabel(13)).toBe("1pm");
    expect(formatHourLabel(12)).toBe("12pm");
  });
});

describe("averagePlaysPerDay", () => {
  it("returns null for empty playcounts", () => {
    expect(averagePlaysPerDay(0, 1_000_000)).toBeNull();
  });

  it("divides lifetime plays by days since registration", () => {
    const now = new Date("2026-08-15T00:00:00Z");
    const registered = Math.floor(
      new Date("2026-08-05T00:00:00Z").getTime() / 1000
    );
    expect(averagePlaysPerDay(100, registered, now)).toBe(10);
  });
});

describe("computeOverlap", () => {
  it("keeps artists that appear on at least two surfaces", () => {
    const tops = {
      period: "7day",
      artists: [
        {
          name: "Overlap Act",
          playcount: "10",
          url: "https://example.com/a",
          rank: "1",
          image: "",
        },
      ],
      albums: [
        {
          name: "Album",
          artist: "Overlap Act",
          playcount: "5",
          url: "https://example.com/al",
          rank: "1",
          image: "",
        },
      ],
      tracks: [
        {
          name: "Solo Only",
          artist: "Other",
          playcount: "3",
          url: "https://example.com/t",
          rank: "1",
          image: "",
        },
      ],
    } as ChartTops;

    const overlap = computeOverlap(tops);
    expect(overlap?.items).toHaveLength(1);
    expect(overlap?.items[0].artist).toBe("Overlap Act");
    expect(overlap?.items[0].surfaces).toBe(2);
  });
});

describe("formatAccountAge", () => {
  it("formats multi-year ages", () => {
    const now = new Date("2026-08-15T00:00:00Z");
    const registered = Math.floor(
      new Date("2020-02-15T00:00:00Z").getTime() / 1000
    );
    expect(formatAccountAge(registered, now).label).toMatch(/6y/);
  });
});
