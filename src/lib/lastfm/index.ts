/**
 * Last.fm data access — prefer importing from `@/lib/lastfm`.
 *
 * Layout:
 * - recent / user / charts / weekly / stats — fetch + assemble
 * - request / images — shared HTTP + art helpers
 */
export type {
  Track,
  ChartArtistView,
  TopAlbumView,
  TopTrackView,
} from "../schemas";

export type { ListeningStats } from "../listening";
export type { SpotlightWeekOverWeek } from "./weekly";

export { getRecentTracks } from "./recent";
export { getChartTops } from "./charts";
export { getSpotlightWeekOverWeek } from "./weekly";
export { getListeningStats } from "./stats";
