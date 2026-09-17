import {
  topArtistsSchema,
  topAlbumsSchema,
  topTracksSchema,
  TopArtist,
  TopAlbum,
  TopTrack,
  ChartArtistView,
  TopAlbumView,
  TopTrackView,
  ChartTops,
} from "../schemas";
import {
  ChartPeriod,
  DEFAULT_CHART_PERIOD,
} from "../period";
import { asArray, lastfmRequest } from "./request";
import { pickImageUrl } from "./images";
import {
  CHART_CACHE_TTL_SECONDS,
  withTtlCache,
} from "../ttlCache";

export async function getTopArtists({
  period = "7day",
  limit = 50,
}: {
  period?: ChartPeriod;
  limit?: number;
} = {}): Promise<TopArtist[]> {
  const data = await lastfmRequest<{
    topartists: { artist: TopArtist | TopArtist[] };
  }>({
    method: "user.gettopartists",
    params: {
      period,
      limit: String(limit),
    },
    schema: topArtistsSchema,
    revalidate: 300,
    label: "top artists",
  });

  return asArray(data.topartists.artist);
}

export async function getTopAlbums({
  period = "7day",
  limit = 100,
}: {
  period?: ChartPeriod;
  limit?: number;
} = {}): Promise<TopAlbum[]> {
  const data = await lastfmRequest<{
    topalbums: { album: TopAlbum | TopAlbum[] };
  }>({
    method: "user.gettopalbums",
    params: {
      period,
      limit: String(limit),
    },
    schema: topAlbumsSchema,
    revalidate: 300,
    label: "top albums",
  });

  return asArray(data.topalbums.album);
}

export async function getTopTracks({
  period = "7day",
  limit = 50,
}: {
  period?: ChartPeriod;
  limit?: number;
} = {}): Promise<TopTrack[]> {
  const data = await lastfmRequest<{
    toptracks: { track: TopTrack | TopTrack[] };
  }>({
    method: "user.gettoptracks",
    params: {
      period,
      limit: String(limit),
    },
    schema: topTracksSchema,
    revalidate: 300,
    label: "top tracks",
  });

  return asArray(data.toptracks.track);
}

/**
 * Map artist → best album cover from this week's top albums.
 * Last.fm artist images are always a placeholder; album art still works.
 */
export function buildArtistImageMapFromAlbums(
  albums: TopAlbum[]
): Map<string, string> {
  const imageByName = new Map<string, string>();
  for (const album of albums) {
    const key = album.artist.name.toLowerCase();
    if (imageByName.has(key)) continue;
    const image = pickImageUrl(album.image);
    if (image) {
      imageByName.set(key, image);
    }
  }
  return imageByName;
}

function toArtistViews(
  artists: TopArtist[],
  imageByName: Map<string, string>
): ChartArtistView[] {
  return artists.map((artist, index) => ({
    name: artist.name,
    playcount: artist.playcount,
    url: artist.url,
    rank: artist["@attr"]?.rank || String(index + 1),
    image:
      imageByName.get(artist.name.toLowerCase()) ||
      pickImageUrl(artist.image) ||
      "",
  }));
}

function toAlbumViews(albums: TopAlbum[]): TopAlbumView[] {
  return albums.map((album, index) => ({
    name: album.name,
    artist: album.artist.name,
    playcount: album.playcount,
    url: album.url,
    rank: album["@attr"]?.rank || String(index + 1),
    image: pickImageUrl(album.image),
  }));
}

function toTrackViews(
  tracks: TopTrack[],
  fallbackImages?: Map<string, string>
): TopTrackView[] {
  return tracks.map((track, index) => {
    const fromTrack = pickImageUrl(track.image);
    const fromAlbum =
      fallbackImages?.get(track.artist.name.toLowerCase()) || "";
    return {
      name: track.name,
      artist: track.artist.name,
      playcount: track.playcount,
      url: track.url,
      rank: track["@attr"]?.rank || String(index + 1),
      image: fromTrack || fromAlbum,
    };
  });
}

/**
 * Period-aware tops: artists + albums + tracks via Last.fm period charts.
 */
export async function getChartTops(
  period: ChartPeriod = DEFAULT_CHART_PERIOD
): Promise<ChartTops> {
  return withTtlCache(`chart-tops:${period}`, CHART_CACHE_TTL_SECONDS, async () => {
    const [topArtists, topAlbums, topTracks] = await Promise.all([
      getTopArtists({ period, limit: 50 }).catch((error) => {
        console.error("Top artists fetch failed", error);
        return [] as TopArtist[];
      }),
      getTopAlbums({ period, limit: 100 }).catch((error) => {
        console.error("Top albums fetch failed", error);
        return [] as TopAlbum[];
      }),
      getTopTracks({ period, limit: 50 }).catch((error) => {
        console.error("Top tracks fetch failed", error);
        return [] as TopTrack[];
      }),
    ]);

    const imageByName = buildArtistImageMapFromAlbums(topAlbums);

    return {
      artists: toArtistViews(topArtists, imageByName),
      albums: toAlbumViews(topAlbums),
      tracks: toTrackViews(topTracks, imageByName),
      period,
    };
  });
}
