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
  ChartTops,
  UserInfo,
} from "../schemas";

export type { WeekOverWeekNudge } from "../weekOverWeek";
export type { ListeningStats } from "../listening";
export type { ChartPeriod } from "../period";
export type { SpotlightWeekOverWeek } from "./weekly";

export { LASTFM_IMAGE_PLACEHOLDER } from "./images";

export { getRecentTracks } from "./recent";
export { getUserInfo } from "./user";
export {
  getTopArtists,
  getTopAlbums,
  getTopTracks,
  buildArtistImageMapFromAlbums,
  getChartTops,
} from "./charts";
export { getSpotlightWeekOverWeek } from "./weekly";
export { getListeningStats } from "./stats";
