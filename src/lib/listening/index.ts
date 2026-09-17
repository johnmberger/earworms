import type { UserInfo } from "../schemas";
import type { ChartPeriod } from "../period";
import type { ChartDepth, ChartOverlap } from "./depth";
import type { ListeningTiming } from "./timing";

export type {
  ChartDepth,
  ChartDepthLeader,
  ChartOverlap,
  ChartOverlapHit,
} from "./depth";
export { computeDepth, computeOverlap } from "./depth";

export type { ListeningDensity } from "./density";
export { computeListeningDensity } from "./density";

export type { ListeningTiming } from "./timing";
export {
  LISTENING_TIME_ZONE,
  computeListeningTiming,
  formatHourLabel,
  getEasternHour,
} from "./timing";

export { averagePlaysPerDay, formatAccountAge } from "./account";

export type ListeningStats = {
  profile: UserInfo | null;
  accountAgeLabel: string | null;
  /** lifetime scrobbles / days since registered */
  playsPerDay: number | null;
  /** Hour-of-day shape in Eastern Time (where most listening happens). */
  timing: ListeningTiming | null;
  depth: ChartDepth | null;
  overlap: ChartOverlap | null;
  period: ChartPeriod;
};
