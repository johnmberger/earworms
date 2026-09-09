import { describe, expect, it } from "vitest";
import type { Track } from "@/lib/schemas";
import {
  RECENT_TRACKS_DISPLAY_LIMIT,
  isNowPlayingTrack,
  takeRecentTracksForDisplay,
} from "@/lib/recentTracks";

function track(name: string, nowPlaying = false): Track {
  return {
    name,
    artist: { "#text": "Artist" },
    album: { "#text": "Album" },
    image: [],
    url: "https://example.com",
    ...(nowPlaying
      ? { "@attr": { nowplaying: "true" } }
      : { date: { uts: "1" } }),
  };
}

describe("takeRecentTracksForDisplay", () => {
  it("keeps now-playing plus a full grid of history", () => {
    const input = [
      track("live", true),
      ...Array.from({ length: 60 }, (_, i) => track(`t${i}`)),
    ];
    const out = takeRecentTracksForDisplay(input);
    expect(isNowPlayingTrack(out[0]!)).toBe(true);
    expect(out).toHaveLength(RECENT_TRACKS_DISPLAY_LIMIT + 1);
    expect(out.slice(1).every((t) => !isNowPlayingTrack(t))).toBe(true);
  });

  it("returns only history when nothing is playing", () => {
    const input = Array.from({ length: 10 }, (_, i) => track(`t${i}`));
    expect(takeRecentTracksForDisplay(input)).toHaveLength(10);
  });
});
