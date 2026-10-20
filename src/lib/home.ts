import type { Track } from "@/lib/schemas";

/**
 * Home-page track list shaping. The Last.fm fetch lives in `@/lib/lastfm`.
 *
 * The grid is 1 / 2 / 3 / 4 cols by breakpoint — keep the limit a multiple of 12
 * so every viewport fills complete rows.
 */
/** Scrobbles pulled from Last.fm before the list is trimmed for the grid. */
export const RECENT_TRACKS_SAMPLE_LIMIT = 200;

export const RECENT_TRACKS_DISPLAY_LIMIT = 48;

export function isNowPlayingTrack(track: Track): boolean {
  return track["@attr"]?.nowplaying === "true";
}

/**
 * Keep now-playing (if any) plus a full grid of history tracks.
 * Now-playing lives in the strip, not the grid — so the limit applies to history only.
 */
export function takeRecentTracksForDisplay(tracks: Track[]): Track[] {
  const nowPlaying = tracks.find(isNowPlayingTrack);
  const history = tracks
    .filter((track) => !isNowPlayingTrack(track))
    .slice(0, RECENT_TRACKS_DISPLAY_LIMIT);
  return nowPlaying ? [nowPlaying, ...history] : history;
}
