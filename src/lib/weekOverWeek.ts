export type WeekOverWeekNudge = {
  /** Positive = more plays than previous week. Null when new / unknown. */
  delta: number | null;
  label: string;
};

/**
 * Compare calendar-week play counts with a glanceable percent label.
 */
export function weekOverWeekPlaysNudge(
  previousPlays: number | null | undefined,
  currentPlays: number | null | undefined
): WeekOverWeekNudge | null {
  if (currentPlays == null || currentPlays < 1) return null;

  if (previousPlays == null || previousPlays < 1) {
    return { delta: null, label: "new this week" };
  }

  const delta = currentPlays - previousPlays;
  const pct = Math.round((delta / previousPlays) * 100);

  if (pct === 0) {
    return { delta, label: "same as last week" };
  }
  if (pct > 0) {
    return { delta, label: `${pct}% more than last week` };
  }
  return { delta, label: `${Math.abs(pct)}% less than last week` };
}

export function artistChartKey(name: string): string {
  return name.trim().toLowerCase();
}

export function releaseChartKey(artist: string, name: string): string {
  return `${artist.trim().toLowerCase()}\0${name.trim().toLowerCase()}`;
}

/** Build playcount lookup from weekly chart rows (first occurrence wins). */
export function playsFromWeeklyEntries(
  entries: { key: string; plays: number }[]
): Map<string, number> {
  const plays = new Map<string, number>();
  for (const entry of entries) {
    if (!entry.key || plays.has(entry.key)) continue;
    if (entry.plays < 1) continue;
    plays.set(entry.key, entry.plays);
  }
  return plays;
}

export function lookupPlays(
  plays: Map<string, number>,
  key: string
): number | null {
  return plays.get(key) ?? null;
}
