/**
 * Site URL + OG helpers used by MetaTags (and tests).
 */

export const SITE_URL = "https://earworms.johnberger.dev";
export const SITE_NAME = "earworms";

export const OG_IMAGE_PATH = "/og.png";
export const OG_IMAGE_WIDTH = "1200";
export const OG_IMAGE_HEIGHT = "630";
export const OG_IMAGE_ALT = "earworms — songs that get stuck in your head";

export const DEFAULT_META = {
  title: SITE_NAME,
  description:
    "the songs that get stuck in my head. see what's currently spinning, what i've been obsessing over, and discover my musical guilty pleasures in real-time.",
  keywords:
    "earworms, music, listening history, music discovery, recently played, music obsession, guilty pleasures, music taste",
  image: `${SITE_URL}${OG_IMAGE_PATH}`,
  imageWidth: OG_IMAGE_WIDTH,
  imageHeight: OG_IMAGE_HEIGHT,
  imageAlt: OG_IMAGE_ALT,
} as const;

/** Turn a path or absolute URL into an absolute https URL on the site. */
export function toAbsoluteUrl(pathOrUrl?: string): string {
  if (!pathOrUrl) return SITE_URL;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

/** Resolve the share-card image; unset/blank falls back to the default OG asset. */
export function resolveOgImage(ogImage?: string): string {
  const trimmed = ogImage?.trim();
  if (!trimmed) return DEFAULT_META.image;
  return toAbsoluteUrl(trimmed);
}
