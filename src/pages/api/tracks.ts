import { NextApiRequest, NextApiResponse } from "next";
import { getRecentTracks } from "@/lib/lastfm";
import { computeListeningDensity } from "@/lib/listening";
import {
  RECENT_TRACKS_SAMPLE_LIMIT,
  takeRecentTracksForDisplay,
} from "@/lib/home";
import { logApiError } from "@/lib/apiError";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const recent = await getRecentTracks(RECENT_TRACKS_SAMPLE_LIMIT, {
      revalidate: 0,
    });
    res.status(200).json({
      tracks: takeRecentTracksForDisplay(recent),
      density: computeListeningDensity(recent),
    });
  } catch (error) {
    logApiError("/api/tracks", error);
    res.status(500).json({ message: "Failed to fetch tracks" });
  }
}
