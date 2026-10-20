import CoverImage from "@/components/shared/CoverImage";
import {
  LASTFM_IMAGE_PLACEHOLDER,
  sizedLastfmImage,
} from "@/lib/lastfm/images";
import { formatNumber } from "@/lib/format";
import { IconExternalLink } from "@/components/shared/icons";
import { ClippedText } from "@/components/shared/ClippedText";

function ShareBar({
  value,
  max,
  className = "",
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const width = Math.max(3, Math.round((value / Math.max(max, 1)) * 100));
  return (
    <div className={`h-1.5 rounded-full bg-white/5 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-linear-to-r from-pink-400 via-purple-400 to-blue-400"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function SpotlightCard({
  label,
  title,
  subtitle,
  plays,
  image,
  href,
  nudge,
  priority = false,
}: {
  label: string;
  title: string;
  subtitle?: string;
  plays: number;
  image: string;
  href: string;
  /** Relative play change, e.g. "38% more than last week" */
  nudge?: string | null;
  priority?: boolean;
}) {
  const hasArt = Boolean(image) && !image.includes(LASTFM_IMAGE_PLACEHOLDER);
  const blurUrl = hasArt ? sizedLastfmImage(image, "thumb") : "";
  const coverUrl = hasArt ? sizedLastfmImage(image, "tile") : "";
  const thumbUrl = hasArt ? sizedLastfmImage(image, "thumb") : "";
  const playsLabel = `${formatNumber(plays)} ${plays === 1 ? "play" : "plays"}`;

  return (
    <>
      {/* Dense list row — mobile only. The row is display; only the icon links out. */}
      <div className="sm:hidden list-row">
        <CoverImage
          name={title}
          image={thumbUrl}
          className="w-14 h-14 shrink-0 text-lg shadow-md shadow-black/30"
          rounded="rounded-lg"
          priority={priority}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.16em] text-pink-300/80 truncate">
            {label}
          </p>
          <ClippedText
            className="font-semibold text-white text-sm leading-snug truncate mt-0.5"
            text={title}
          />
          <ClippedText
            className="text-xs text-dark-300 truncate mt-0.5"
            text={`${subtitle ? `${subtitle} · ${playsLabel}` : playsLabel}${
              nudge ? ` · ${nudge}` : ""
            }`}
          />
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${title} on Last.fm`}
          className="flex size-11 shrink-0 items-center justify-center -mr-1.5 rounded-lg text-dark-500 transition-colors hover:text-pink-300 active:bg-white/7"
        >
          <IconExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Spotlight card — sm and up */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group panel relative overflow-hidden hover:bg-white/7 transition-all duration-300 px-3 py-4 sm:px-4 sm:py-5 h-full hidden sm:flex flex-col items-center text-center"
      >
        <div
          className="absolute inset-0 opacity-40 pointer-events-none scale-110 blur-2xl"
          aria-hidden="true"
          style={
            blurUrl
              ? {
                  backgroundImage: `url(${blurUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {!blurUrl ? (
            <div className="w-full h-full bg-linear-to-br from-pink-500/30 via-purple-500/20 to-blue-500/30" />
          ) : null}
        </div>
        <div className="relative flex flex-col items-center w-full min-w-0 flex-1">
          <CoverImage
            name={title}
            image={coverUrl}
            className="w-40 h-40 sm:w-44 sm:h-44 text-4xl shadow-lg shadow-black/40"
            rounded="rounded-xl"
            priority={priority}
          />
          <p className="text-[10px] uppercase tracking-[0.2em] text-pink-300/80 mt-3 mb-1">
            {label}
          </p>
          <ClippedText
            as="h3"
            className="text-base sm:text-lg font-bold text-white group-hover:text-pink-200 transition-colors leading-snug line-clamp-2 min-h-11 sm:min-h-13 w-full"
            text={title}
          />
          <ClippedText
            className="text-xs text-dark-300 mt-1 line-clamp-1 min-h-4 w-full"
            text={subtitle || "\u00A0"}
          />
          <div className="mt-auto pt-3 w-full">
            <p className="text-xs text-dark-400 tabular-nums">{playsLabel}</p>
            <p className="text-[11px] text-pink-300/70 mt-1.5 tabular-nums min-h-4.5">
              {nudge || "\u00A0"}
            </p>
          </div>
        </div>
      </a>
    </>
  );
}

export function RankRow({
  rank,
  title,
  subtitle,
  plays,
  maxPlays,
  image,
  href,
}: {
  rank: string | number;
  title: string;
  subtitle?: string;
  plays: number;
  maxPlays: number;
  image: string;
  href: string;
}) {
  const thumb = image ? sizedLastfmImage(image, "thumb") : "";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 py-2.5 px-1.5 -mx-1.5 rounded-xl hover:bg-white/5 transition-colors group"
    >
      <span className="w-6 text-center text-xs font-semibold text-dark-500 tabular-nums shrink-0">
        {rank}
      </span>
      <CoverImage name={title} image={thumb} className="w-10 h-10" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <div className="min-w-0">
            <ClippedText
              className="font-medium text-white truncate group-hover:text-pink-300 transition-colors text-sm sm:text-base"
              text={title}
            />
            <ClippedText
              className="text-xs text-dark-400 truncate"
              text={subtitle || "\u00A0"}
            />
          </div>
          <span className="text-xs sm:text-sm text-dark-400 tabular-nums shrink-0">
            {formatNumber(plays)} {plays === 1 ? "play" : "plays"}
          </span>
        </div>
        <ShareBar value={plays} max={maxPlays} />
      </div>
    </a>
  );
}
