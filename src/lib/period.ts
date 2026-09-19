export const CHART_PERIODS = [
  "7day",
  "1month",
  "3month",
  "6month",
  "12month",
  "overall",
] as const;

export type ChartPeriod = (typeof CHART_PERIODS)[number];

export const DEFAULT_CHART_PERIOD: ChartPeriod = "7day";

const PERIOD_SET = new Set<string>(CHART_PERIODS);

export function isChartPeriod(value: unknown): value is ChartPeriod {
  return typeof value === "string" && PERIOD_SET.has(value);
}

export function parsePeriod(value: unknown): ChartPeriod {
  if (Array.isArray(value)) return parsePeriod(value[0]);
  return isChartPeriod(value) ? value : DEFAULT_CHART_PERIOD;
}

/** Short control label (segmented duration control) */
export function durationControlShortLabel(period: ChartPeriod): string {
  switch (period) {
    case "7day":
      return "7d";
    case "1month":
      return "1m";
    case "3month":
      return "3m";
    case "6month":
      return "6m";
    case "12month":
      return "1y";
    case "overall":
      return "all";
  }
}

/** Readable label for copy / hints */
export function durationControlLabel(period: ChartPeriod): string {
  switch (period) {
    case "7day":
      return "7 days";
    case "1month":
      return "1 month";
    case "3month":
      return "3 months";
    case "6month":
      return "6 months";
    case "12month":
      return "1 year";
    case "overall":
      return "overall";
  }
}

/** Page / section title fragment, e.g. "this week" */
export function periodTitleSuffix(period: ChartPeriod): string {
  switch (period) {
    case "7day":
      return "this week";
    case "1month":
      return "this month";
    case "3month":
      return "the last 3 months";
    case "6month":
      return "the last 6 months";
    case "12month":
      return "this year";
    case "overall":
      return "all time";
  }
}

export const PERIOD_OPTIONS: {
  value: ChartPeriod;
  label: string;
  shortLabel: string;
}[] = CHART_PERIODS.map((value) => ({
  value,
  label: durationControlLabel(value),
  shortLabel: durationControlShortLabel(value),
}));

/**
 * Canonical / OG path for a period page.
 * Default period omits the query so `/top` and `/top?period=7day` share one URL.
 */
export function periodSharePath(
  pathname: string,
  period: ChartPeriod
): string {
  const base = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (period === DEFAULT_CHART_PERIOD) return base;
  return `${base}?period=${period}`;
}
