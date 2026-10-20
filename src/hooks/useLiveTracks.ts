import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentDate } from "@/lib/format";
import type { Track } from "@/lib/lastfm";
import type { ListeningDensity } from "@/lib/listening";

type TracksPayload = {
  tracks: Track[];
  density: ListeningDensity | null;
};

function tracksSignature(tracks: Track[]): string {
  return tracks
    .map(
      (t) =>
        `${t.name}\0${t.artist?.["#text"] ?? ""}\0${t.date?.uts ?? "np"}\0${
          t["@attr"]?.nowplaying ?? ""
        }`
    )
    .join("\n");
}

function densitySignature(density: ListeningDensity | null): string {
  if (!density) return "";
  return `${density.today}|${density.yesterday}|${density.recentDailyAvg}|${density.sampleDays}|${density.samplePlays}`;
}

/**
 * Keeps the home track list fresh.
 * Syncs when ISR hands over new props, polls while the tab is visible,
 * and exposes a manual refresh for the live button.
 */
export function useLiveTracks(
  initialTracks: Track[],
  initialDensity: ListeningDensity | null
) {
  const propsSig = tracksSignature(initialTracks);
  const [tracks, setTracks] = useState(initialTracks);
  const [density, setDensity] = useState(initialDensity);
  const [tracksSig, setTracksSig] = useState(propsSig);
  const [densitySig, setDensitySig] = useState(() =>
    densitySignature(initialDensity)
  );
  const [seenPropsSig, setSeenPropsSig] = useState(propsSig);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const refreshingRef = useRef(false);

  // Sync when ISR / navigation provides a new props snapshot
  if (seenPropsSig !== propsSig) {
    setSeenPropsSig(propsSig);
    setTracks(initialTracks);
    setDensity(initialDensity);
    setTracksSig(propsSig);
    setDensitySig(densitySignature(initialDensity));
  }

  const applyPayload = useCallback(
    (payload: TracksPayload) => {
      const nextTracksSig = tracksSignature(payload.tracks);
      const nextDensitySig = densitySignature(payload.density);
      let changed = false;

      if (nextTracksSig !== tracksSig) {
        setTracksSig(nextTracksSig);
        setTracks(payload.tracks);
        changed = true;
      }
      if (nextDensitySig !== densitySig) {
        setDensitySig(nextDensitySig);
        setDensity(payload.density);
        changed = true;
      }
      if (changed) setLastUpdated(getCurrentDate());
    },
    [tracksSig, densitySig]
  );

  const refresh = useCallback(
    async (opts: { silent: boolean }) => {
      if (refreshingRef.current) return;
      refreshingRef.current = true;
      if (!opts.silent) setIsRefreshing(true);
      try {
        const response = await fetch("/api/tracks");
        if (response.ok) {
          applyPayload((await response.json()) as TracksPayload);
        }
      } catch (error) {
        console.error("Failed to refresh tracks:", error);
      } finally {
        refreshingRef.current = false;
        if (!opts.silent) setIsRefreshing(false);
      }
    },
    [applyPayload]
  );

  const refreshNow = useCallback(() => {
    void refresh({ silent: false });
  }, [refresh]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "hidden") return;
      void refresh({ silent: true });
    };
    // ISR HTML can be stale — pull fresh tracks on load and when returning to the tab
    tick();
    const interval = setInterval(tick, 30000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh]);

  return { tracks, density, isRefreshing, lastUpdated, refreshNow };
}
