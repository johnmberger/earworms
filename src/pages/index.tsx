import RecentTracksList from "@/components/home/RecentTracksList";
import EmptyState from "@/components/layout/EmptyState";
import BuiltBy from "@/components/layout/BuiltBy";
import PageShell from "@/components/layout/PageShell";
import PaceSection from "@/components/home/PaceSection";
import {
  IconActivity,
  IconChevronRight,
  IconRanking,
  IconRefresh,
} from "@/components/shared/icons";
import { getRecentTracks, Track } from "@/lib/lastfm";
import {
  computeListeningDensity,
  type ListeningDensity,
} from "@/lib/listeningStats";
import { takeRecentTracksForDisplay, isNowPlayingTrack } from "@/lib/recentTracks";
import { GetStaticProps } from "next";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import MetaTags from "@/components/layout/MetaTags";
import { formatTime, getCurrentDate } from "@/lib/dateUtils";

const SAMPLE_LIMIT = 200;

type HomeProps = {
  tracks: Track[];
  density: ListeningDensity | null;
};

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

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  try {
    const recent = await getRecentTracks(SAMPLE_LIMIT);
    return {
      props: {
        tracks: takeRecentTracksForDisplay(recent),
        density: computeListeningDensity(recent),
      },
      revalidate: 30,
    };
  } catch (error) {
    console.error("SSG Error (index):", error);
    return {
      props: {
        tracks: [],
        density: null,
      },
      revalidate: 30,
    };
  }
};

export default function Home({
  tracks: initialTracks,
  density: initialDensity,
}: HomeProps) {
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

  const handleManualRefresh = useCallback(() => {
    void refresh({ silent: false });
  }, [refresh]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "hidden") return;
      void refresh({ silent: true });
    };
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <>
      <MetaTags
        description="the songs that get stuck in my head. see what's currently spinning, what i've been obsessing over, and catch my musical guilty pleasures. live updates every 30 seconds."
        keywords="earworms, recently played, live music, current song, music obsession, guilty pleasures, music taste"
        path="/"
      />
      <PageShell
        brandLinksHome={false}
        width="wide"
        showCenterOrb
        nav={[
          { href: "/top", label: "top" },
          { href: "/me", label: "the numbers" },
        ]}
        header={
          <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                latest tracks
              </h2>
              <div className="flex items-center gap-2 text-sm text-dark-400 shrink-0">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isRefreshing
                      ? "bg-pink-500 animate-pulse"
                      : "bg-green-500"
                  }`}
                ></div>
                <span>live</span>
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 disabled:opacity-50"
                  title="refresh tracks"
                >
                  <IconRefresh
                    className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
            <p className="text-dark-400">
              what i&apos;ve been listening to lately
            </p>
            <div className="text-xs text-dark-500 mt-1" suppressHydrationWarning>
              last updated: {formatTime(lastUpdated)}
            </div>
          </>
        }
        footer={
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-10 sm:gap-12">
            <div className="flex flex-col gap-8 sm:gap-10 max-w-lg">
              <div>
                <div className="flex items-center gap-2 text-pink-300/80 mb-2">
                  <IconRanking className="w-4 h-4" />
                  <p className="text-[11px] uppercase tracking-[0.18em] text-dark-400">
                    charts
                  </p>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  top
                </h2>
                <p className="text-dark-300 text-sm sm:text-base mb-4">
                  artists, albums, and tracks that i have stuck on repeat
                </p>
                <Link
                  href="/top"
                  className="inline-flex items-center gap-2 text-pink-300 hover:text-pink-200 transition-colors font-semibold group"
                >
                  full rankings
                  <IconChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
              <div>
                <div className="flex items-center gap-2 text-pink-300/80 mb-2">
                  <IconActivity className="w-4 h-4" />
                  <p className="text-[11px] uppercase tracking-[0.18em] text-dark-400">
                    stats
                  </p>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  the numbers
                </h2>
                <p className="text-dark-300 text-sm sm:text-base mb-4">
                  how this week, month, and year has stacked up
                </p>
                <Link
                  href="/me"
                  className="inline-flex items-center gap-2 text-pink-300 hover:text-pink-200 transition-colors font-semibold group"
                >
                  my statistics
                  <IconChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            <BuiltBy className="sm:justify-end" />
          </div>
        }
      >
        <section className={tracks.some(isNowPlayingTrack) ? "pb-28 sm:pb-32" : undefined}>
          {tracks.length === 0 ? (
            <EmptyState
              title="no recent tracks"
              message="couldn't fetch my recent tracks. might be a temporary last.fm issue. try refreshing."
              actionLabel="try refresh"
              onAction={handleManualRefresh}
            />
          ) : (
            <>
              <RecentTracksList tracks={tracks} />
              <PaceSection density={density} />
            </>
          )}
        </section>
      </PageShell>
    </>
  );
}
