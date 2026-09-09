import { NextApiRequest, NextApiResponse } from "next";
import { getRecentTracks } from "@/lib/lastfm";
import { computeListeningDensity } from "@/lib/listeningStats";
import { takeRecentTracksForDisplay } from "@/lib/recentTracks";
import { logApiError } from "@/lib/apiError";

const SAMPLE_LIMIT = 200;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const recent = await getRecentTracks(SAMPLE_LIMIT);
    res.status(200).json({
      tracks: takeRecentTracksForDisplay(recent),
      density: computeListeningDensity(recent),
    });
  } catch (error) {
    logApiError("/api/tracks", error);
    res.status(500).json({ message: "Failed to fetch tracks" });
  }
}
