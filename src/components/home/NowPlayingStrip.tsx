import { Track } from "@/lib/lastfm";
import CoverImage from "@/components/shared/CoverImage";
import { IconExternalLink } from "@/components/shared/icons";
import { pickImageUrl, sizedLastfmImage } from "@/lib/lastfm/images";

export default function NowPlayingStrip({ track }: { track: Track }) {
  const art = sizedLastfmImage(pickImageUrl(track.image, "thumb"), "thumb");
  const artist = track.artist?.["#text"] ?? "";
  const album = track.album?.["#text"] ?? "";
  // Remount the pill when the song changes so the enter animation replays.
  const trackKey = `${track.name}\0${artist}\0${album}\0${art}`;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 sm:p-4">
      <a
        key={trackKey}
        href={track.url}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto w-full max-w-sm flex items-center gap-3 sm:gap-4 rounded-2xl border border-white/15 bg-slate-950/90 px-3 py-2.5 sm:px-4 sm:py-3 shadow-2xl shadow-black/50 backdrop-blur-md hover:bg-slate-950/95 hover:border-pink-400/30 transition-colors group animate-now-playing-in"
      >
        <CoverImage
          name={track.name}
          image={art}
          alt={`${track.name} album art`}
          className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 shadow-lg shadow-black/40"
          rounded="rounded-lg"
          priority
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="eq-bars scale-90 shrink-0" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-pink-300/90 truncate">
              currently playing
            </p>
          </div>
          <p
            className="font-semibold text-white truncate group-hover:text-pink-200 transition-colors text-sm sm:text-base"
            title={track.name}
          >
            {track.name}
          </p>
          <p
            className="text-xs sm:text-sm text-dark-300 truncate"
            title={[artist, album].filter(Boolean).join(" · ")}
          >
            {artist}
            {album ? ` · ${album}` : ""}
          </p>
        </div>
        <IconExternalLink className="w-4 h-4 text-dark-400 group-hover:text-pink-300 transition-colors shrink-0 hidden sm:block" />
      </a>
    </div>
  );
}
