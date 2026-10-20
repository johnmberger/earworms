import { Track } from "@/lib/lastfm";
import CoverImage from "@/components/shared/CoverImage";
import { IconExternalLink } from "@/components/shared/icons";
import { pickImageUrl, sizedLastfmImage } from "@/lib/lastfm/images";
import { formatTrackDate } from "@/lib/format";
import { ClippedText } from "@/components/shared/ClippedText";

interface TrackCardProps {
  track: Track;
  /** First visible cards should load eagerly for LCP */
  priority?: boolean;
}

export default function TrackCard({
  track,
  priority = false,
}: TrackCardProps) {
  const artist = track.artist["#text"];
  const album = track.album["#text"];
  const fullArt = sizedLastfmImage(pickImageUrl(track.image, "full"), "full");
  const thumbArt = sizedLastfmImage(pickImageUrl(track.image, "thumb"), "thumb");

  return (
    <>
      {/* Dense list row — mobile only. The row is display; only the icon links out. */}
      <div className="sm:hidden list-row">
        <CoverImage
          name={track.name}
          image={thumbArt}
          alt={`${track.name} album art`}
          className="w-14 h-14 shrink-0 text-lg shadow-md shadow-black/30"
          rounded="rounded-lg"
          priority={priority}
        />
        <div className="min-w-0 flex-1">
          <ClippedText
            className="font-semibold text-white text-sm leading-snug truncate"
            text={track.name}
          />
          <ClippedText
            className="text-blue-200/90 text-xs truncate mt-0.5"
            text={artist}
          />
          {track.date?.uts ? (
            <p className="text-[11px] text-cyan-300/80 truncate mt-0.5">
              {formatTrackDate(track.date.uts)}
            </p>
          ) : null}
        </div>
        <a
          href={track.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${track.name} on Last.fm`}
          className="flex size-11 shrink-0 items-center justify-center -mr-1.5 rounded-lg text-dark-500 transition-colors hover:text-pink-300 active:bg-white/7"
        >
          <IconExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Card grid — sm and up */}
      <div className="group track-card h-full hidden sm:flex flex-col">
        <div className="relative aspect-square overflow-hidden rounded-t-3xl">
          <div className="absolute inset-0 bg-linear-to-br from-white/5 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out z-10" />
          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/8 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-out z-10" />

          <CoverImage
            name={track.name}
            image={fullArt}
            alt={`${track.name} album art`}
            className="w-full h-full text-5xl transition-transform duration-700 ease-out group-hover:scale-102"
            rounded="rounded-none"
            priority={priority}
          />

          <div className="absolute top-4 right-4 z-20 opacity-0 translate-y-2 scale-90 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-500 ease-out">
            <a
              href={track.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 bg-linear-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border border-purple-400/30 hover:from-purple-500/30 hover:to-pink-500/30 hover:scale-110 transition-all duration-300 ease-out md:backdrop-blur-xl"
            >
              <IconExternalLink className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>

        <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <ClippedText
              as="h3"
              className="font-semibold text-white text-xl leading-tight line-clamp-2 group-hover:text-pink-300 transition-all duration-500 ease-out"
              text={track.name}
            />
            <ClippedText
              className="text-blue-200 text-sm font-medium line-clamp-1 group-hover:text-blue-100 transition-all duration-500 ease-out"
              text={artist}
            />
            {album ? (
              <ClippedText
                className="text-purple-200 text-xs line-clamp-1 group-hover:text-purple-100 transition-all duration-500 ease-out"
                text={album}
              />
            ) : null}
          </div>

          {track.date?.uts ? (
            <div className="flex items-center gap-2 text-xs text-cyan-300 group-hover:text-cyan-200 transition-all duration-500 ease-out">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:bg-cyan-300 transition-all duration-500 ease-out" />
              <span>{formatTrackDate(track.date.uts)}</span>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
