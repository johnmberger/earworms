import { describe, expect, it } from "vitest";
import {
  artistChartKey,
  playsFromWeeklyEntries,
  releaseChartKey,
  weekOverWeekPlaysNudge,
} from "@/lib/weekOverWeek";

describe("weekOverWeekPlaysNudge", () => {
  it("uses more/less percent than last week", () => {
    expect(weekOverWeekPlaysNudge(40, 55)).toEqual({
      delta: 15,
      label: "38% more than last week",
    });
    expect(weekOverWeekPlaysNudge(30, 26)).toEqual({
      delta: -4,
      label: "13% less than last week",
    });
  });

  it("uses percent for big swings too", () => {
    expect(weekOverWeekPlaysNudge(10, 25)).toEqual({
      delta: 15,
      label: "150% more than last week",
    });
    expect(weekOverWeekPlaysNudge(22, 10)).toEqual({
      delta: -12,
      label: "55% less than last week",
    });
  });

  it("marks new and flat", () => {
    expect(weekOverWeekPlaysNudge(null, 5)).toEqual({
      delta: null,
      label: "new this week",
    });
    expect(weekOverWeekPlaysNudge(12, 12)).toEqual({
      delta: 0,
      label: "same as last week",
    });
  });

  it("returns null without current plays", () => {
    expect(weekOverWeekPlaysNudge(4, null)).toBeNull();
  });
});

describe("playsFromWeeklyEntries", () => {
  it("keeps first playcount per key", () => {
    const plays = playsFromWeeklyEntries([
      { key: artistChartKey("A"), plays: 10 },
      { key: artistChartKey("B"), plays: 4 },
      { key: artistChartKey("A"), plays: 99 },
    ]);
    expect(plays.get(artistChartKey("A"))).toBe(10);
    expect(plays.get(artistChartKey("B"))).toBe(4);
  });
});

describe("releaseChartKey", () => {
  it("normalizes artist + title", () => {
    expect(releaseChartKey("  Radiohead ", "Karma Police")).toBe(
      releaseChartKey("radiohead", "karma police")
    );
  });
});
