import { useLayoutEffect, useRef, useState } from "react";

type IconProps = {
  className?: string;
};

const defaults = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true as const,
};

/** Minimal stroke icons — lucide-ish, no package. */
export function IconRefresh({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg className={className} {...defaults}>
      <path d="M21 12a9 9 0 1 1-2.6-6.3" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

export function IconChevronRight({ className = "w-3.5 h-3.5" }: IconProps) {
  return (
    <svg className={className} {...defaults}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function IconChevronLeft({ className = "w-3.5 h-3.5" }: IconProps) {
  return (
    <svg className={className} {...defaults}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function IconExternalLink({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg className={className} {...defaults}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export function IconRanking({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} {...defaults}>
      <path d="M4 20V10" />
      <path d="M12 20V4" />
      <path d="M20 20v-6" />
    </svg>
  );
}

export function IconActivity({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} {...defaults}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

/** Soundwave bars ↔ X — used by the mobile nav toggle. */
export function IconMenuToggle({
  open,
  className = "w-5 h-5",
}: IconProps & { open: boolean }) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [morphOpen, setMorphOpen] = useState(open);
  const [pulsing, setPulsing] = useState(!open);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const inners = Array.from(
      root.querySelectorAll<HTMLElement>(".menu-toggle-bar-inner")
    );

    if (open) {
      // Freeze pulse at the current frame, ease to rest, then rotate into X.
      setPulsing(false);
      inners.forEach((el) => {
        const current = getComputedStyle(el).transform;
        el.style.animation = "none";
        el.style.transform = current === "none" ? "scaleY(1)" : current;
      });
      void root.offsetWidth;
      inners.forEach((el) => {
        el.style.transition = "transform 0.14s ease-out";
        el.style.transform = "scaleY(1)";
      });
      const t = window.setTimeout(() => {
        inners.forEach((el) => {
          el.style.transition = "";
          el.style.transform = "";
          el.style.animation = "";
        });
        setMorphOpen(true);
      }, 150);
      return () => window.clearTimeout(t);
    }

    setMorphOpen(false);
    inners.forEach((el) => {
      el.style.animation = "none";
      el.style.transform = "scaleY(1)";
    });
    const t = window.setTimeout(() => {
      inners.forEach((el) => {
        el.style.transition = "";
        el.style.transform = "";
        el.style.animation = "";
      });
      setPulsing(true);
    }, 460);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <span
      ref={rootRef}
      className={`menu-toggle${morphOpen ? " menu-toggle-open" : ""}${
        pulsing ? " menu-toggle-pulse" : ""
      } ${className}`}
      aria-hidden="true"
    >
      <span className="menu-toggle-bar menu-toggle-bar-1">
        <span className="menu-toggle-bar-inner" />
      </span>
      <span className="menu-toggle-bar menu-toggle-bar-2">
        <span className="menu-toggle-bar-inner" />
      </span>
      <span className="menu-toggle-bar menu-toggle-bar-3">
        <span className="menu-toggle-bar-inner" />
      </span>
    </span>
  );
}
