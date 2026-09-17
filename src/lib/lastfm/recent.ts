import { recentTracksSchema, Track, type RecentTracksResponse } from "../schemas";
import { lastfmRequest } from "./request";

export async function getRecentTracks(limit = 48): Promise<Track[]> {
  const data = await lastfmRequest<RecentTracksResponse>({
    method: "user.getrecenttracks",
    params: {
      limit: String(Math.min(Math.max(limit, 1), 200)),
    },
    schema: recentTracksSchema,
    revalidate: 10,
    label: "recent tracks",
  });

  const rawTracks = data.recenttracks.track;
  return Array.isArray(rawTracks) ? rawTracks : Object.values(rawTracks);
}
