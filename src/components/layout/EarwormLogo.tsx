import { useId } from "react";

interface EarwormLogoProps {
  className?: string;
  /** When true, plays the sound-wave undulation */
  crawling?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-12 sm:w-14 aspect-140/72",
  md: "w-16 sm:w-24 lg:w-28 aspect-140/72",
  lg: "w-24 sm:w-32 lg:w-36 aspect-140/72",
};

const SEGMENTS = 12;
const START_X = 12;
const SPACING = 8;
const BASE_Y = 36;
const AMP = 11;
const WAVE_DUR_S = 1.6;

/** Tail smaller → mid plump → neck into head */
function segmentRadius(i: number) {
  const t = i / (SEGMENTS - 1);
  const mid = 1 - Math.abs(t - 0.55) * 1.1;
  return 6.2 + mid * 3.4;
}

function waveOffset(segmentIndex: number) {
  return AMP * Math.sin((segmentIndex / (SEGMENTS - 1)) * Math.PI * 2);
}

/** Negative delay = already mid-wave on first paint (no SMIL/hydration lag) */
function phaseDelay(segmentIndex: number) {
  return `${(-(segmentIndex / (SEGMENTS - 1)) * WAVE_DUR_S).toFixed(3)}s`;
}

function waveStyle(segmentIndex: number, isWaving: boolean) {
  if (isWaving) {
    return { animationDelay: phaseDelay(segmentIndex) } as const;
  }
  return {
    transform: `translateY(${waveOffset(segmentIndex).toFixed(1)}px)`,
  } as const;
}

/**
 * Continuous worm body via overlapping tapered segments.
 * Wave uses CSS (not SMIL) so it runs from first paint.
 */
export default function EarwormLogo({
  className = "",
  crawling = true,
  size = "md",
}: EarwormLogoProps) {
  const uid = useId().replace(/:/g, "");
  const headGrad = `headFill-${uid}`;
  const headIndex = SEGMENTS - 1;
  const headX = START_X + headIndex * SPACING + 5;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${sizeMap[size]} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 140 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id={headGrad} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>

        {Array.from({ length: SEGMENTS }, (_, i) => {
          const cx = START_X + i * SPACING;
          return (
            <g
              key={`under-${i}`}
              className={crawling ? "worm-wave-seg" : undefined}
              style={waveStyle(i, crawling)}
            >
              <circle
                cx={cx}
                cy={BASE_Y}
                r={segmentRadius(i) + 2.5}
                fill={`url(#${headGrad})`}
              />
            </g>
          );
        })}

        {Array.from({ length: SEGMENTS }, (_, i) => {
          const cx = START_X + i * SPACING;
          return (
            <g
              key={i}
              className={crawling ? "worm-wave-seg" : undefined}
              style={waveStyle(i, crawling)}
            >
              <circle
                cx={cx}
                cy={BASE_Y}
                r={segmentRadius(i)}
                fill={`url(#${headGrad})`}
              />
            </g>
          );
        })}

        <g
          className={crawling ? "worm-wave-seg" : undefined}
          style={waveStyle(headIndex, crawling)}
        >
          <circle cx={headX} cy={BASE_Y} r="11" fill={`url(#${headGrad})`} />

          <circle cx={headX + 4} cy={BASE_Y - 3} r="2.8" fill="#0f172a" />
          <circle cx={headX - 3} cy={BASE_Y - 4} r="2.8" fill="#0f172a" />
          <circle cx={headX + 4.8} cy={BASE_Y - 4} r="1" fill="white" />
          <circle cx={headX - 2.2} cy={BASE_Y - 5} r="1" fill="white" />

          <path
            d={`M${headX - 4} ${BASE_Y + 4}c2.2 2 6.5 2 8.8 0`}
            stroke="#0f172a"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />

          <path
            d={`M${headX - 11} ${BASE_Y - 6}c0-7 5.5-11.5 11-11.5S${headX + 11} ${BASE_Y - 13} ${headX + 11} ${BASE_Y - 6}`}
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <rect
            x={headX - 13.5}
            y={BASE_Y - 8}
            width="4.5"
            height="7"
            rx="1.8"
            fill="#ffffff"
          />
          <rect
            x={headX + 9}
            y={BASE_Y - 8}
            width="4.5"
            height="7"
            rx="1.8"
            fill="#ffffff"
          />
        </g>
      </svg>
    </div>
  );
}
