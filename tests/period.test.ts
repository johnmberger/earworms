import { describe, expect, it } from "vitest";
import {
  DEFAULT_CHART_PERIOD,
  isChartPeriod,
  parsePeriod,
  periodSharePath,
  periodTitleSuffix,
} from "@/lib/period";

describe("parsePeriod", () => {
  it("returns valid periods as-is", () => {
    expect(parsePeriod("7day")).toBe("7day");
    expect(parsePeriod("overall")).toBe("overall");
  });

  it("falls back to default for junk", () => {
    expect(parsePeriod(undefined)).toBe(DEFAULT_CHART_PERIOD);
    expect(parsePeriod("nope")).toBe(DEFAULT_CHART_PERIOD);
    expect(parsePeriod(12)).toBe(DEFAULT_CHART_PERIOD);
  });

  it("uses the first value from query arrays", () => {
    expect(parsePeriod(["1month", "7day"])).toBe("1month");
    expect(parsePeriod(["bogus", "7day"])).toBe(DEFAULT_CHART_PERIOD);
  });
});

describe("isChartPeriod", () => {
  it("narrows known period strings", () => {
    expect(isChartPeriod("3month")).toBe(true);
    expect(isChartPeriod("week")).toBe(false);
  });
});

describe("periodTitleSuffix", () => {
  it("returns casual copy for each period", () => {
    expect(periodTitleSuffix("7day")).toBe("this week");
    expect(periodTitleSuffix("overall")).toBe("all time");
  });
});

describe("periodSharePath", () => {
  it("omits the query for the default period", () => {
    expect(periodSharePath("/top", "7day")).toBe("/top");
    expect(periodSharePath("/me", DEFAULT_CHART_PERIOD)).toBe("/me");
  });

  it("includes ?period= for other ranges", () => {
    expect(periodSharePath("/top", "1month")).toBe("/top?period=1month");
    expect(periodSharePath("me", "overall")).toBe("/me?period=overall");
  });
});
