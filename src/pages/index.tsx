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
} from "@/lib/listening";
import {
  RECENT_TRACKS_SAMPLE_LIMIT,
  takeRecentTracksForDisplay,
} from "@/lib/home";
import { useLiveTracks } from "@/hooks";
import { GetStaticProps } from "next";
import Link from "next/link";
import MetaTags from "@/components/layout/MetaTags";
import { formatTime } from "@/lib/format";

type HomeProps = {
  tracks: Track[];
  density: ListeningDensity | null;
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  try {
    const recent = await getRecentTracks(RECENT_TRACKS_SAMPLE_LIMIT);
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
  const { tracks, density, isRefreshing, lastUpdated, refreshNow } =
    useLiveTracks(initialTracks, initialDensity);

  return (
    <>
      <MetaTags
        description="the songs that get stuck in my head"
        ogDescription="the songs that get stuck in my head"
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
                  onClick={refreshNow}
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
        <section>
          {tracks.length === 0 ? (
            <EmptyState
              title="no recent tracks"
              message="couldn't fetch my recent tracks. might be a temporary last.fm issue. try refreshing."
              actionLabel="try refresh"
              onAction={refreshNow}
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
