import { createElement, useLayoutEffect, useRef, useState } from "react";

const CLIP_SLOP = 1;

type Tag = "p" | "h3" | "span";

/**
 * Renders a single line or clamped block, and sets a native tooltip
 * only when the text is actually cut off.
 */
export function ClippedText({
  as = "p",
  text,
  className,
}: {
  as?: Tag;
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [clipped, setClipped] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    const apply = () => {
      if (cancelled) return;
      const laidOut = el.clientWidth > 0 || el.clientHeight > 0;
      const next =
        laidOut &&
        text.trim().length > 0 &&
        (el.scrollWidth > el.clientWidth + CLIP_SLOP ||
          el.scrollHeight > el.clientHeight + CLIP_SLOP);
      setClipped(next);
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    void document.fonts?.ready.then(apply);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [text]);

  return createElement(
    as,
    { ref, className, title: clipped ? text : undefined },
    text
  );
}
