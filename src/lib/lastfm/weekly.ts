import {
  weeklyChartListSchema,
  weeklyArtistChartSchema,
  weeklyAlbumChartSchema,
  weeklyTrackChartSchema,
  ChartTops,
  type ChartRange,
} from "../schemas";
import { asArray, lastfmRequest } from "./request";
import {
  CHART_CACHE_TTL_SECONDS,
  withTtlCache,
} from "../ttlCache";
import {
  artistChartKey,
  lookupPlays,
  playsFromWeeklyEntries,
  releaseChartKey,
  weekOverWeekPlaysNudge,
  type WeekOverWeekNudge,
} from "../weekOverWeek";

export type SpotlightWeekOverWeek = {
  artist: WeekOverWeekNudge | null;
  album: WeekOverWeekNudge | null;
  track: WeekOverWeekNudge | null;
};

type WeeklyPlaySnapshots = {
  artistCurrent: Map<string, number>;
  artistPrevious: Map<string, number>;
  albumCurrent: Map<string, number>;
  albumPrevious: Map<string, number>;
  trackCurrent: Map<string, number>;
  trackPrevious: Map<string, number>;
};

async function getWeeklyChartRanges(): Promise<ChartRange[]> {
  const data = await lastfmRequest<{
    weeklychartlist: { chart: ChartRange | ChartRange[] };
  }>({
    method: "user.getweeklychartlist",
    schema: weeklyChartListSchema,
    revalidate: 3600,
    label: "weekly chart list",
  });

  return asArray(data.weeklychartlist.chart).sort(
    (a, b) => Number(a.from) - Number(b.from)
  );
}

async function getWeeklyArtistPlays(
  range: ChartRange
): Promise<Map<string, number>> {
  const data = await lastfmRequest<{
    weeklyartistchart: {
      artist?:
        | { name: string; playcount?: string }
        | { name: string; playcount?: string }[];
    };
  }>({
    method: "user.getweeklyartistchart",
    params: { from: range.from, to: range.to },
    schema: weeklyArtistChartSchema,
    revalidate: 300,
    label: "weekly artist chart",
  });

  return playsFromWeeklyEntries(
    asArray(data.weeklyartistchart.artist ?? []).map((a) => ({
      key: artistChartKey(a.name),
      plays: parseInt(a.playcount ?? "0", 10) || 0,
    }))
  );
}

async function getWeeklyAlbumPlays(
  range: ChartRange
): Promise<Map<string, number>> {
  const data = await lastfmRequest<{
    weeklyalbumchart: {
      album?:
        | { name: string; artist: string; playcount?: string }
        | { name: string; artist: string; playcount?: string }[];
    };
  }>({
    method: "user.getweeklyalbumchart",
    params: { from: range.from, to: range.to },
    schema: weeklyAlbumChartSchema,
    revalidate: 300,
    label: "weekly album chart",
  });

  return playsFromWeeklyEntries(
    asArray(data.weeklyalbumchart.album ?? []).map((a) => ({
      key: releaseChartKey(a.artist, a.name),
      plays: parseInt(a.playcount ?? "0", 10) || 0,
    }))
  );
}

async function getWeeklyTrackPlays(
  range: ChartRange
): Promise<Map<string, number>> {
  const data = await lastfmRequest<{
    weeklytrackchart: {
      track?:
        | { name: string; artist: string; playcount?: string }
        | { name: string; artist: string; playcount?: string }[];
    };
  }>({
    method: "user.getweeklytrackchart",
    params: { from: range.from, to: range.to },
    schema: weeklyTrackChartSchema,
    revalidate: 300,
    label: "weekly track chart",
  });

  return playsFromWeeklyEntries(
    asArray(data.weeklytrackchart.track ?? []).map((t) => ({
      key: releaseChartKey(t.artist, t.name),
      plays: parseInt(t.playcount ?? "0", 10) || 0,
    }))
  );
}

async function getWeeklyPlaySnapshots(): Promise<WeeklyPlaySnapshots | null> {
  return withTtlCache(
    "weekly-play-snapshots",
    CHART_CACHE_TTL_SECONDS,
    async () => {
      const ranges = await getWeeklyChartRanges().catch((error) => {
        console.error("Weekly chart list fetch failed", error);
        return [] as ChartRange[];
      });
      if (ranges.length < 2) return null;

      const current = ranges[ranges.length - 1]!;
      const previous = ranges[ranges.length - 2]!;

      const [
        artistCurrent,
        artistPrevious,
        albumCurrent,
        albumPrevious,
        trackCurrent,
        trackPrevious,
      ] = await Promise.all([
        getWeeklyArtistPlays(current).catch(() => new Map<string, number>()),
        getWeeklyArtistPlays(previous).catch(() => new Map<string, number>()),
        getWeeklyAlbumPlays(current).catch(() => new Map<string, number>()),
        getWeeklyAlbumPlays(previous).catch(() => new Map<string, number>()),
        getWeeklyTrackPlays(current).catch(() => new Map<string, number>()),
        getWeeklyTrackPlays(previous).catch(() => new Map<string, number>()),
      ]);

      return {
        artistCurrent,
        artistPrevious,
        albumCurrent,
        albumPrevious,
        trackCurrent,
        trackPrevious,
      };
    }
  );
}

/**
 * Play-count deltas for chart #1s vs the prior calendar week.
 * Only meaningful alongside the 7-day charts.
 */
export async function getSpotlightWeekOverWeek(
  tops: Pick<ChartTops, "artists" | "albums" | "tracks">
): Promise<SpotlightWeekOverWeek> {
  const empty: SpotlightWeekOverWeek = {
    artist: null,
    album: null,
    track: null,
  };

  const snaps = await getWeeklyPlaySnapshots().catch((error) => {
    console.error("Weekly play snapshots failed", error);
    return null;
  });
  if (!snaps) return empty;

  const topArtist = tops.artists[0];
  const topAlbum = tops.albums[0];
  const topTrack = tops.tracks[0];

  return {
    artist: topArtist
      ? weekOverWeekPlaysNudge(
          lookupPlays(snaps.artistPrevious, artistChartKey(topArtist.name)),
          lookupPlays(snaps.artistCurrent, artistChartKey(topArtist.name))
        )
      : null,
    album: topAlbum
      ? weekOverWeekPlaysNudge(
          lookupPlays(
            snaps.albumPrevious,
            releaseChartKey(topAlbum.artist, topAlbum.name)
          ),
          lookupPlays(
            snaps.albumCurrent,
            releaseChartKey(topAlbum.artist, topAlbum.name)
          )
        )
      : null,
    track: topTrack
      ? weekOverWeekPlaysNudge(
          lookupPlays(
            snaps.trackPrevious,
            releaseChartKey(topTrack.artist, topTrack.name)
          ),
          lookupPlays(
            snaps.trackCurrent,
            releaseChartKey(topTrack.artist, topTrack.name)
          )
        )
      : null,
  };
}
