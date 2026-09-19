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
  periodSharePath,
  periodTitleSuffix,
} from "@/lib/period";

type MePageProps = {
  stats: ListeningStats;
};

export const getServerSideProps: GetServerSideProps<MePageProps> = async (
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
          accountAgeLabel: null,
          playsPerDay: null,
          timing: null,
          depth: null,
          overlap: null,
          period,
        },
      },
    };
  }
};

function MeBody({ stats }: MePageProps) {
  const {
    profile,
    accountAgeLabel,
    playsPerDay,
    timing,
    depth,
    overlap,
    period,
  } = stats;

  const hasAnything =
    Boolean(profile) ||
    Boolean(depth) ||
    Boolean(overlap) ||
    Boolean(timing);

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
              timing={timing}
            />
          )}

          {hasAnything ? (
            <LifetimeSection
              profile={profile}
              accountAgeLabel={accountAgeLabel}
              playsPerDay={playsPerDay}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function MePage({ stats }: MePageProps) {
  const { period } = stats;

  return (
    <>
      <MetaTags
        title="the numbers"
        description={`listening depth, timing, and lifetime scrobble stats — ${periodTitleSuffix(period)}.`}
        keywords="earworms, listening stats, scrobbles, music stats"
        path={periodSharePath("/me", period)}
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
                how concentrated the listens are, when they happen, and the
                lifetime tally
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
