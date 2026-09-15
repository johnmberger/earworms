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

export function IconUsers({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} {...defaults}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconDisc({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} {...defaults}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconMusic({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} {...defaults}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export function IconMenu({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} {...defaults}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function IconClose({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} {...defaults}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}
