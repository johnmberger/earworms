import { GetServerSideProps } from "next";
import { getListeningStats, ListeningStats } from "@/lib/lastfm";
import { CHART_PAGE_CACHE_CONTROL } from "@/lib/ttlCache";
import DurationControl from "@/components/duration/DurationControl";
import {
  DurationPendingProvider,
  useIsDurationPending,
} from "@/components/duration/DurationPending";
import MetaTags from "@/components/layout/MetaTags";
import EmptyState from "@/components/layout/EmptyState";
import PageShell, { PageFooterLinks } from "@/components/layout/PageShell";
import { MePeriodSkeleton } from "@/components/me/MePeriodSkeleton";
import {
  DurationStatsSection,
  LifetimeSection,
} from "@/components/me/StatsSections";
import {
  parsePeriod,
  durationControlLabel,
  periodTitleSuffix,
} from "@/lib/period";

type StatsPageProps = {
  stats: ListeningStats;
};

export const getServerSideProps: GetServerSideProps<StatsPageProps> = async (
  context
) => {
  context.res.setHeader("Cache-Control", CHART_PAGE_CACHE_CONTROL);
  const period = parsePeriod(context.query.period);
  try {
    const stats = await getListeningStats(period);
    return { props: { stats } };
  } catch (error) {
    console.error("SSR Error (me):", error);
    return {
      props: {
        stats: {
          profile: null,
          accountAgeYears: null,
          accountAgeLabel: null,
          depth: null,
          overlap: null,
          period,
          periodLabel: durationControlLabel(period),
        },
      },
    };
  }
};

function MeBody({ stats }: StatsPageProps) {
  const { profile, accountAgeLabel, depth, overlap, period } = stats;

  const hasAnything =
    Boolean(profile) || Boolean(depth) || Boolean(overlap);

  const rangeLabel = periodTitleSuffix(period);
  const durationPending = useIsDurationPending();

  return (
    <div aria-busy={durationPending}>
      {!durationPending && !hasAnything ? (
        <EmptyState
          title="no stats yet"
          message="couldn't pull listening stats from last.fm right now."
        />
      ) : (
        <div className="space-y-10 sm:space-y-12 animate-slide-up">
          {durationPending ? (
            <MePeriodSkeleton />
          ) : (
            <DurationStatsSection
              rangeLabel={rangeLabel}
              depth={depth}
              overlap={overlap}
            />
          )}

          {hasAnything ? (
            <LifetimeSection
              profile={profile}
              accountAgeLabel={accountAgeLabel}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function StatsPage({ stats }: StatsPageProps) {
  const { period } = stats;

  return (
    <>
      <MetaTags
        title="the numbers"
        description="in-depth statistics on my listening habits"
        keywords="earworms, listening stats, scrobbles, music stats"
        path="/me"
      />
      <DurationPendingProvider period={period} pathname="/me">
        <PageShell
          nav={[
            { href: "/", label: "latest tracks", back: true },
            { href: "/top", label: "top" },
          ]}
          header={
            <>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                the numbers
              </h2>
              <p className="text-dark-400 text-sm sm:text-base mb-4">
                the top artists stuck in my ears lately
              </p>
              <DurationControl />
            </>
          }
          footer={
            <PageFooterLinks
              links={[
                { href: "/", label: "latest tracks", back: true },
                { href: "/top", label: "top" },
              ]}
            />
          }
        >
          <MeBody stats={stats} />
        </PageShell>
      </DurationPendingProvider>
    </>
  );
}
