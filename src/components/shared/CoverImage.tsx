import { useEffect, useState } from "react";
import { LASTFM_IMAGE_PLACEHOLDER } from "@/lib/lastfm/images";

type CoverImageProps = {
  name: string;
  image: string;
  className?: string;
  rounded?: string;
  alt?: string;
  /** Above-the-fold covers: skip lazy load, hint high fetch priority */
  priority?: boolean;
};

/** Survives page remounts so returning to a grid doesn't re-shimmer. */
const loadedSrcs = new Set<string>();

/** Cover/artist art with shimmer while loading and letter fallback. */
export default function CoverImage({
  name,
  image,
  className = "w-12 h-12",
  rounded = "rounded-xl",
  alt = "",
  priority = false,
}: CoverImageProps) {
  const [failed, setFailed] = useState(false);
  // Always start unloaded on the server so SSR/client markup matches
  const [loaded, setLoaded] = useState(false);
  const isPlaceholder = !image || image.includes(LASTFM_IMAGE_PLACEHOLDER);
  const showFallback = isPlaceholder || failed;
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    if (!image || failed || !loadedSrcs.has(image)) return;
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, [image, failed]);

  if (showFallback) {
    return (
      <div
        className={`${className} ${rounded} bg-linear-to-br from-pink-500/40 via-purple-500/40 to-blue-500/40 flex items-center justify-center text-white font-bold shrink-0`}
        aria-hidden={alt ? undefined : true}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
      >
        {initial}
      </div>
    );
  }

  return (
    <div
      className={`${className} ${rounded} relative overflow-hidden shrink-0 bg-dark-800`}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-cover-shimmer" aria-hidden="true" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={alt}
        className={`w-full h-full object-cover ${
          loaded
            ? "opacity-100"
            : "opacity-0 transition-opacity duration-500"
        }`}
        onLoad={() => {
          loadedSrcs.add(image);
          setLoaded(true);
        }}
        onError={() => setFailed(true)}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding={priority ? "sync" : "async"}
      />
    </div>
  );
}
