import type { Track, UserInfo, ChartTops } from "./schemas";
import type { ChartPeriod } from "./period";

export type ChartDepthLeader = {
  name: string;
  plays: number;
  sharePercent: number;
};

export type ChartDepth = {
  uniqueArtists: number;
  totalPlays: number;
  /** plays per unique artist — higher = more replay / less browsing */
  playsPerArtist: number;
  /** top artists by plays in the selected period */
  leaders: ChartDepthLeader[];
  /** combined share of the leaders list */
  leadersSharePercent: number;
};

export type ChartOverlapHit = {
  artist: string;
  artistRank: number | null;
  artistPlays: number;
  albums: { name: string; plays: number }[];
  tracks: { name: string; plays: number }[];
  /** 2 = two charts, 3 = artists + albums + tracks */
  surfaces: number;
};

export type ChartOverlap = {
  items: ChartOverlapHit[];
};

export type ListeningDensity = {
  today: number;
  yesterday: number;
  /** average plays/day across days represented in the recent sample */
  recentDailyAvg: number;
  sampleDays: number;
  samplePlays: number;
};

/** Hour-of-day listening shape from a recent scrobble sample (local time). */
export type ListeningTiming = {
  /** plays per hour, length 24 */
  hours: number[];
  peakHour: number;
  peakHourLabel: string;
  peakSharePercent: number;
  samplePlays: number;
};

export type ListeningStats = {
  profile: UserInfo | null;
  accountAgeLabel: string | null;
  /** lifetime scrobbles / days since registered */
  playsPerDay: number | null;
  timing: ListeningTiming | null;
  depth: ChartDepth | null;
  overlap: ChartOverlap | null;
  period: ChartPeriod;
};

function startOfLocalDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function computeDepth(
  artists: { name: string; playcount: string }[],
  leaderCount = 7
): ChartDepth | null {
  if (!artists.length) return null;
  const plays = artists.map((a) => parseInt(a.playcount, 10) || 0);
  const totalPlays = plays.reduce((sum, n) => sum + n, 0);
  const uniqueArtists = artists.length;
  const leaders = artists.slice(0, leaderCount).map((artist, i) => {
    const artistPlays = plays[i] || 0;
    return {
      name: artist.name.trim(),
      plays: artistPlays,
      sharePercent:
        totalPlays > 0 ? Math.round((artistPlays / totalPlays) * 100) : 0,
    };
  });
  const leadersPlays = leaders.reduce((sum, a) => sum + a.plays, 0);

  return {
    uniqueArtists,
    totalPlays,
    playsPerArtist:
      uniqueArtists > 0
        ? Math.round((totalPlays / uniqueArtists) * 10) / 10
        : 0,
    leaders,
    leadersSharePercent:
      totalPlays > 0 ? Math.round((leadersPlays / totalPlays) * 100) : 0,
  };
}

export function computeOverlap(
  tops: ChartTops,
  limit = 5
): ChartOverlap | null {
  type Bucket = {
    artist: string;
    artistRank: number | null;
    artistPlays: number;
    albums: { name: string; plays: number }[];
    tracks: { name: string; plays: number }[];
  };

  const byArtist = new Map<string, Bucket>();

  const ensure = (name: string) => {
    const key = name.trim().toLowerCase();
    if (!key) return null;
    let bucket = byArtist.get(key);
    if (!bucket) {
      bucket = {
        artist: name.trim(),
        artistRank: null,
        artistPlays: 0,
        albums: [],
        tracks: [],
      };
      byArtist.set(key, bucket);
    }
    return bucket;
  };

  for (const artist of tops.artists) {
    const bucket = ensure(artist.name);
    if (!bucket) continue;
    bucket.artistRank = parseInt(artist.rank, 10) || null;
    bucket.artistPlays = parseInt(artist.playcount, 10) || 0;
  }

  for (const album of tops.albums) {
    const bucket = ensure(album.artist);
    if (!bucket) continue;
    bucket.albums.push({
      name: album.name,
      plays: parseInt(album.playcount, 10) || 0,
    });
  }

  for (const track of tops.tracks) {
    const bucket = ensure(track.artist);
    if (!bucket) continue;
    bucket.tracks.push({
      name: track.name,
      plays: parseInt(track.playcount, 10) || 0,
    });
  }

  const items: ChartOverlapHit[] = [];
  for (const bucket of Array.from(byArtist.values())) {
    const onArtists = bucket.artistRank != null;
    const onAlbums = bucket.albums.length > 0;
    const onTracks = bucket.tracks.length > 0;
    const surfaces =
      Number(onArtists) + Number(onAlbums) + Number(onTracks);
    if (surfaces < 2) continue;

    items.push({
      artist: bucket.artist,
      artistRank: bucket.artistRank,
      artistPlays: bucket.artistPlays,
      albums: bucket.albums.slice(0, 2),
      tracks: bucket.tracks.slice(0, 2),
      surfaces,
    });
  }

  items.sort((a, b) => {
    if (b.surfaces !== a.surfaces) return b.surfaces - a.surfaces;
    const aScore =
      a.artistPlays +
      a.albums.reduce((s, x) => s + x.plays, 0) +
      a.tracks.reduce((s, x) => s + x.plays, 0);
    const bScore =
      b.artistPlays +
      b.albums.reduce((s, x) => s + x.plays, 0) +
      b.tracks.reduce((s, x) => s + x.plays, 0);
    return bScore - aScore;
  });

  const sliced = items.slice(0, limit);
  if (!sliced.length) return null;
  return { items: sliced };
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

/** 12-hour clock label, e.g. 0 → "12am", 13 → "1pm" */
export function formatHourLabel(hour: number): string {
  const h = ((Math.floor(hour) % 24) + 24) % 24;
  const suffix = h < 12 ? "am" : "pm";
  const h12 = h % 12 || 12;
  return `${h12}${suffix}`;
}

/**
 * Local-hour listening distribution from recent scrobbles.
 * Useful for “when do I listen?” without a full history dump.
 */
export function computeListeningTiming(
  tracks: Track[]
): ListeningTiming | null {
  const hours = Array.from({ length: 24 }, () => 0);
  let samplePlays = 0;

  for (const track of tracks) {
    const uts = track.date?.uts;
    if (!uts) continue;
    const ms = parseInt(uts, 10) * 1000;
    if (!Number.isFinite(ms)) continue;
    hours[new Date(ms).getHours()] += 1;
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

/** Lifetime average scrobbles per day since registration. */
export function averagePlaysPerDay(
  playcount: number,
  registeredUnix: number,
  now = new Date()
): number | null {
  if (playcount < 1 || registeredUnix < 1) return null;
  const days = Math.max(
    1,
    (now.getTime() - registeredUnix * 1000) / (24 * 60 * 60 * 1000)
  );
  return Math.round((playcount / days) * 10) / 10;
}

export function formatAccountAge(registeredUnix: number, now = new Date()): {
  years: number;
  label: string;
} {
  const registered = new Date(registeredUnix * 1000);
  const ms = Math.max(0, now.getTime() - registered.getTime());
  const years = ms / (365.25 * 24 * 60 * 60 * 1000);
  const wholeYears = Math.floor(years);
  const months = Math.floor((years - wholeYears) * 12);

  let label: string;
  if (wholeYears <= 0) {
    label = months <= 1 ? "about a month" : `${months} months`;
  } else if (months === 0) {
    label = wholeYears === 1 ? "1 year" : `${wholeYears} years`;
  } else {
    label = `${wholeYears}y ${months}m`;
  }

  return { years: Math.round(years * 10) / 10, label };
}
