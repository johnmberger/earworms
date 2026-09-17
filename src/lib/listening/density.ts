import type { Track } from "../schemas";

export type ListeningDensity = {
  today: number;
  yesterday: number;
  /** average plays/day across days represented in the recent sample */
  recentDailyAvg: number;
  sampleDays: number;
  samplePlays: number;
};

function startOfLocalDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function computeListeningDensity(
  tracks: Track[],
  now = new Date()
): ListeningDensity | null {
  const todayStart = startOfLocalDay(now);
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const dayCounts = new Map<number, number>();

  let today = 0;
  let yesterday = 0;
  let samplePlays = 0;

  for (const track of tracks) {
    const uts = track.date?.uts;
    if (!uts) continue; // skip now-playing without a stamp
    const ms = parseInt(uts, 10) * 1000;
    if (!Number.isFinite(ms)) continue;
    samplePlays += 1;
    const day = startOfLocalDay(new Date(ms));
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    if (ms >= todayStart) today += 1;
    else if (ms >= yesterdayStart && ms < todayStart) yesterday += 1;
  }

  if (samplePlays === 0) return null;

  const sampleDays = Math.max(1, dayCounts.size);
  const recentDailyAvg =
    Math.round((samplePlays / sampleDays) * 10) / 10;

  return {
    today,
    yesterday,
    recentDailyAvg,
    sampleDays,
    samplePlays,
  };
}
