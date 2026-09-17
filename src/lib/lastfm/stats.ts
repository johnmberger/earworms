import { Track } from "../schemas";
import {
  averagePlaysPerDay,
  computeDepth,
  computeListeningTiming,
  computeOverlap,
  formatAccountAge,
  type ListeningStats,
} from "../listening";
import {
  ChartPeriod,
  DEFAULT_CHART_PERIOD,
} from "../period";
import {
  CHART_CACHE_TTL_SECONDS,
  withTtlCache,
} from "../ttlCache";
import { getChartTops } from "./charts";
import { getRecentTracks } from "./recent";
import { getUserInfo } from "./user";

/** Profile + period flavor stats for the /me page. */
export async function getListeningStats(
  period: ChartPeriod = DEFAULT_CHART_PERIOD
): Promise<ListeningStats> {
  return withTtlCache(
    `listening-stats:${period}`,
    CHART_CACHE_TTL_SECONDS,
    async () => {
      const [profile, tops, recent] = await Promise.all([
        getUserInfo().catch((error) => {
          console.error("User info fetch failed", error);
          return null;
        }),
        getChartTops(period).catch((error) => {
          console.error("Chart tops fetch failed", error);
          return null;
        }),
        getRecentTracks(200).catch((error) => {
          console.error("Recent tracks (stats) fetch failed", error);
          return [] as Track[];
        }),
      ]);

      const age =
        profile && profile.registeredUnix > 0
          ? formatAccountAge(profile.registeredUnix)
          : null;

      const playsPerDay =
        profile && profile.registeredUnix > 0
          ? averagePlaysPerDay(profile.playcount, profile.registeredUnix)
          : null;

      return {
        profile,
        accountAgeLabel: age?.label ?? null,
        playsPerDay,
        timing: computeListeningTiming(recent),
        depth: tops ? computeDepth(tops.artists) : null,
        overlap: tops ? computeOverlap(tops) : null,
        period,
      };
    }
  );
}
