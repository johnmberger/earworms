import type { Track } from "../schemas";

/** Hour-of-day listening shape from a recent scrobble sample (local time). */
export type ListeningTiming = {
  /** plays per hour, length 24 */
  hours: number[];
  peakHour: number;
  peakHourLabel: string;
  peakSharePercent: number;
  samplePlays: number;
};

/** 12-hour clock label, e.g. 0 → "12am", 13 → "1pm" */
export function formatHourLabel(hour: number): string {
  const h = ((Math.floor(hour) % 24) + 24) % 24;
  const suffix = h < 12 ? "am" : "pm";
  const h12 = h % 12 || 12;
  return `${h12}${suffix}`;
}

/** Hard-coded home zone for “when I listen” — ET covers almost all scrobbles. */
export const LISTENING_TIME_ZONE = "America/New_York";

const easternHourFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: LISTENING_TIME_ZONE,
  hour: "numeric",
  hourCycle: "h23",
});

/** Hour of day (0–23) in Eastern Time for a unix-ms instant. */
export function getEasternHour(ms: number): number {
  const hour = easternHourFormatter
    .formatToParts(new Date(ms))
    .find((part) => part.type === "hour")?.value;
  return parseInt(hour ?? "0", 10) || 0;
}

/**
 * Eastern-Time hour distribution from recent stamped scrobbles.
 * Safe to compute on the server — zone is fixed, not the host local TZ.
 */
export function computeListeningTiming(
  tracks: Track[]
): ListeningTiming | null {
  const hours = Array.from({ length: 24 }, () => 0);
  let samplePlays = 0;

  for (const track of tracks) {
    const raw = track.date?.uts;
    if (!raw) continue;
    const ms = parseInt(raw, 10) * 1000;
    if (!Number.isFinite(ms)) continue;
    hours[getEasternHour(ms)]! += 1;
    samplePlays += 1;
  }

  if (samplePlays === 0) return null;

  let peakHour = 0;
  for (let h = 1; h < 24; h += 1) {
    if (hours[h]! > hours[peakHour]!) peakHour = h;
  }

  return {
    hours,
    peakHour,
    peakHourLabel: formatHourLabel(peakHour),
    peakSharePercent: Math.round((hours[peakHour]! / samplePlays) * 100),
    samplePlays,
  };
}
