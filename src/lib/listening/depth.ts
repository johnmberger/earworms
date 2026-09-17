import type { ChartTops } from "../schemas";

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
