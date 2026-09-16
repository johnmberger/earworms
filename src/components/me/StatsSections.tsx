import { useState } from "react";
import { formatNumber } from "@/lib/dateUtils";
import {
  formatHourLabel,
  type ChartDepth,
  type ChartOverlap,
  type ListeningTiming,
} from "@/lib/listeningStats";
import type { UserInfo } from "@/lib/schemas";
import { StatCard } from "@/components/shared/StatCard";

export function registeredLabel(unix: number): string {
  return new Date(unix * 1000)
    .toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
    .toLowerCase();
}

const DEPTH_COLORS = [
  "#f472b6", // pink-400
  "#c084fc", // purple-400
  "#60a5fa", // blue-400
  "#22d3ee", // cyan-400
  "#a78bfa", // violet-400
  "#fb7185", // rose-400
  "#34d399", // emerald-400
] as const;

const REST_COLOR = "rgba(255,255,255,0.12)";

type DepthSlice = {
  key: string;
  label: string;
  plays: number;
  sharePercent: number;
  color: string;
};

function depthSlices(depth: ChartDepth): DepthSlice[] {
  const slices: DepthSlice[] = depth.leaders.map((leader, i) => ({
    key: leader.name,
    label: leader.name,
    plays: leader.plays,
    sharePercent: leader.sharePercent,
    color: DEPTH_COLORS[i % DEPTH_COLORS.length]!,
  }));

  const restPercent = Math.max(0, 100 - depth.leadersSharePercent);
  if (restPercent > 0) {
    const restPlays = Math.max(
      0,
      depth.totalPlays - depth.leaders.reduce((sum, l) => sum + l.plays, 0)
    );
    slices.push({
      key: "__rest",
      label: "everyone else",
      plays: restPlays,
      sharePercent: restPercent,
      color: REST_COLOR,
    });
  }

  return slices;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/** Open arc for a donut segment (angles in degrees, 0 = top, clockwise). */
function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
  // Full circles need a tiny gap — SVG arcs collapse when start === end.
  const sweep = Math.min(359.999, Math.max(0.001, endDeg - startDeg));
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, startDeg + sweep);
  const large = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

function EarwormsPanel({ overlap }: { overlap: ChartOverlap | null }) {
  if (overlap && overlap.items.length > 0) {
    return (
      <div className="panel px-4 py-5 sm:px-5 sm:py-6 h-full">
        <p className="text-[10px] uppercase tracking-[0.2em] text-pink-300/80 mb-4">
          earworms
        </p>
        <ul className="space-y-3">
          {overlap.items.map((hit) => {
            const pieces = [
              ...hit.albums.map((a) => a.name),
              ...hit.tracks.map((t) => t.name),
            ];
            return (
              <li key={hit.artist} className="min-w-0">
                <p className="font-semibold text-white truncate">
                  {hit.artist}
                </p>
                {pieces.length > 0 ? (
                  <p className="text-xs text-dark-300 truncate mt-0.5">
                    {pieces.join(" · ")}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="panel px-4 py-5 sm:px-5 sm:py-6 h-full">
      <p className="text-[10px] uppercase tracking-[0.2em] text-pink-300/80 mb-3">
        earworms
      </p>
      <p className="text-sm text-dark-300">
        nothing stuck across charts for this window.
      </p>
    </div>
  );
}

/** Soft donut of top-artist share — SVG arcs with hover detail. */
function DepthDonut({
  depth,
  activeKey,
  onActiveKey,
}: {
  depth: ChartDepth;
  activeKey: string | null;
  onActiveKey: (key: string | null) => void;
}) {
  const slices = depthSlices(depth);
  const size = 200;
  const stroke = 26;
  const radius = (size - stroke) / 2;
  const center = size / 2;

  const arcs = slices.reduce<
    Array<DepthSlice & { startDeg: number; endDeg: number }>
  >((acc, slice) => {
    const startDeg = acc.length
      ? acc[acc.length - 1]!.endDeg
      : 0;
    const sweep = (slice.sharePercent / 100) * 360;
    acc.push({ ...slice, startDeg, endDeg: startDeg + sweep });
    return acc;
  }, []);

  const top = depth.leaders[0];
  const active = arcs.find((a) => a.key === activeKey) ?? null;
  const shown = active
    ? active
    : top
      ? {
          key: top.name,
          label: top.name,
          plays: top.plays,
          sharePercent: top.sharePercent,
        }
      : null;

  return (
    <div className="relative mx-auto sm:mx-0 w-[200px] h-[200px] shrink-0">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`top artists share of ${formatNumber(depth.totalPlays)} plays`}
        className="overflow-visible"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        {arcs.map((arc) => {
          const dimmed = activeKey != null && activeKey !== arc.key;
          const focused = activeKey === arc.key;
          return (
            <path
              key={arc.key}
              d={arcPath(center, center, radius, arc.startDeg, arc.endDeg)}
              fill="none"
              stroke={arc.color}
              strokeWidth={stroke}
              strokeLinecap="butt"
              className="cursor-pointer transition-[opacity,filter] duration-300 ease-out"
              style={{
                opacity: dimmed ? 0.32 : 1,
                filter: focused
                  ? "brightness(1.15) drop-shadow(0 0 6px rgba(255,255,255,0.25))"
                  : "brightness(1) drop-shadow(0 0 0 transparent)",
              }}
              onMouseEnter={() => onActiveKey(arc.key)}
              onMouseLeave={() => onActiveKey(null)}
              onFocus={() => onActiveKey(arc.key)}
              onBlur={() => onActiveKey(null)}
              tabIndex={0}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 pointer-events-none">
        <p
          key={`pct-${shown?.key ?? "empty"}`}
          className="text-2xl sm:text-3xl font-bold text-white tabular-nums leading-none animate-fade-soft"
        >
          {shown ? `${shown.sharePercent}%` : "—"}
        </p>
        <p
          key={`label-${shown?.key ?? "empty"}`}
          className="text-[10px] uppercase tracking-[0.14em] text-dark-400 mt-1.5 truncate max-w-full animate-fade-soft"
        >
          {shown ? shown.label : "depth"}
        </p>
        <p
          key={`plays-${shown?.key ?? "empty"}`}
          className="text-xs text-dark-300 mt-1 tabular-nums min-h-[1rem] animate-fade-soft"
        >
          {shown
            ? `${formatNumber(shown.plays)} ${
                shown.plays === 1 ? "play" : "plays"
              }`
            : ""}
        </p>
      </div>
    </div>
  );
}

function DepthPanel({ depth }: { depth: ChartDepth }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const slices = depthSlices(depth);

  return (
    <div className="panel px-4 py-5 sm:px-5 sm:py-6">
      <p className="text-[10px] uppercase tracking-[0.2em] text-pink-300/80 mb-5">
        depth
      </p>
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 lg:gap-14">
        <DepthDonut
          depth={depth}
          activeKey={activeKey}
          onActiveKey={setActiveKey}
        />
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 max-w-lg text-center sm:text-left mx-auto sm:mx-0">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white tabular-nums leading-none">
                {formatNumber(depth.totalPlays)}
              </p>
              <p className="text-xs text-dark-400 mt-1.5">plays</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white tabular-nums leading-none">
                {formatNumber(depth.uniqueArtists)}
              </p>
              <p className="text-xs text-dark-400 mt-1.5">artists</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white tabular-nums leading-none">
                {depth.playsPerArtist}
              </p>
              <p className="text-xs text-dark-400 mt-1.5">
                <span className="sm:hidden">per artist</span>
                <span className="hidden sm:inline">plays / artist</span>
              </p>
            </div>
          </div>
          {slices.length > 0 ? (
            <ul className="sm:columns-2 sm:gap-x-8">
              {slices.map((slice) => {
                const active = activeKey === slice.key;
                const dimmed = activeKey != null && !active;
                return (
                  <li key={slice.key} className="break-inside-avoid mb-1.5">
                    <button
                      type="button"
                      className={`w-full flex items-baseline justify-between gap-3 text-sm text-left rounded-md px-1.5 -mx-1.5 py-1 transition-[opacity,background-color] duration-300 ease-out ${
                        active ? "bg-white/5" : "bg-transparent"
                      }`}
                      style={{ opacity: dimmed ? 0.38 : 1 }}
                      onMouseEnter={() => setActiveKey(slice.key)}
                      onMouseLeave={() => setActiveKey(null)}
                      onFocus={() => setActiveKey(slice.key)}
                      onBlur={() => setActiveKey(null)}
                    >
                      <span className="flex items-center gap-2 min-w-0 text-white/90">
                        <span
                          className="w-2 h-2 rounded-full shrink-0 transition-transform duration-300 ease-out"
                          style={{
                            backgroundColor: slice.color,
                            transform: active ? "scale(1.25)" : "scale(1)",
                          }}
                        />
                        <span
                          className={`truncate ${
                            slice.key === "__rest" ? "text-dark-400" : ""
                          }`}
                        >
                          {slice.label}
                        </span>
                      </span>
                      <span className="text-xs text-dark-400 tabular-nums shrink-0">
                        {slice.sharePercent}%
                        <span className="text-dark-500 hidden lg:inline">
                          {" "}
                          · {formatNumber(slice.plays)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function WhenPanel({ timing }: { timing: ListeningTiming }) {
  const [hoverHour, setHoverHour] = useState<number | null>(null);
  const maxHour = Math.max(...timing.hours, 1);
  const activeHour = hoverHour ?? timing.peakHour;
  const activeCount = timing.hours[activeHour] ?? 0;
  const activeShare =
    timing.samplePlays > 0
      ? Math.round((activeCount / timing.samplePlays) * 100)
      : 0;
  const isPeakDefault = hoverHour == null;

  return (
    <div className="panel px-4 py-5 sm:px-5 sm:py-6 h-full">
      <p className="text-[10px] uppercase tracking-[0.2em] text-pink-300/80 mb-4">
        when
      </p>
      <p
        key={`when-hour-${activeHour}-${isPeakDefault ? "peak" : "hover"}`}
        className="text-2xl sm:text-3xl font-bold text-white tabular-nums leading-none mb-1 animate-fade-soft"
      >
        {formatHourLabel(activeHour)}
      </p>
      <p
        key={`when-sub-${activeHour}-${isPeakDefault ? "peak" : "hover"}`}
        className="text-xs text-dark-400 mb-4 min-h-[1.25rem] animate-fade-soft"
      >
        {isPeakDefault ? (
          <>busiest hour · {timing.peakSharePercent}% of recent plays</>
        ) : (
          <>
            {formatNumber(activeCount)}{" "}
            {activeCount === 1 ? "play" : "plays"} · {activeShare}% of recent
          </>
        )}
      </p>
      <div
        className="flex items-end gap-px h-20"
        role="img"
        aria-label="plays by hour of day"
      >
        {timing.hours.map((count, hour) => {
          const height = Math.max(8, Math.round((count / maxHour) * 100));
          const isActive = hour === activeHour;
          const isPeak = hour === timing.peakHour;
          const dimmed = hoverHour != null && !isActive;
          return (
            <button
              key={hour}
              type="button"
              className={`relative flex-1 min-w-0 rounded-sm transition-[opacity,transform,background-color] duration-300 ease-out focus:outline-none focus-visible:ring-1 focus-visible:ring-pink-300/60 ${
                isActive
                  ? "bg-pink-400"
                  : isPeak
                    ? "bg-pink-400/55"
                    : "bg-white/15 hover:bg-white/25"
              }`}
              style={{
                height: `${height}%`,
                opacity: dimmed ? 0.35 : 1,
                transform: isActive ? "scaleY(1.03)" : "scaleY(1)",
                transformOrigin: "bottom",
              }}
              onMouseEnter={() => setHoverHour(hour)}
              onMouseLeave={() => setHoverHour(null)}
              onFocus={() => setHoverHour(hour)}
              onBlur={() => setHoverHour(null)}
              aria-label={`${formatHourLabel(hour)} · ${count} ${
                count === 1 ? "play" : "plays"
              }`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-dark-500 mt-2 tabular-nums">
        <span>12am</span>
        <span>12pm</span>
        <span>11pm</span>
      </div>
    </div>
  );
}

export function DurationStatsSection({
  rangeLabel,
  depth,
  overlap,
  timing,
}: {
  rangeLabel: string;
  depth: ChartDepth | null;
  overlap: ChartOverlap | null;
  timing: ListeningTiming | null;
}) {
  return (
    <section>
      <h3 className="text-sm uppercase tracking-[0.18em] text-dark-400 mb-4 sm:mb-5">
        {rangeLabel}
      </h3>
      <div className="flex flex-col gap-3 sm:gap-4">
        {depth ? (
          <DepthPanel depth={depth} />
        ) : (
          <StatCard label="depth" value="—" />
        )}

        <div
          className={`grid grid-cols-1 gap-3 sm:gap-4 ${
            timing ? "md:grid-cols-2" : ""
          }`}
        >
          <EarwormsPanel overlap={overlap} />
          {timing ? <WhenPanel timing={timing} /> : null}
        </div>
      </div>
    </section>
  );
}

export function LifetimeSection({
  profile,
  accountAgeLabel,
  playsPerDay,
}: {
  profile: UserInfo | null;
  accountAgeLabel: string | null;
  playsPerDay: number | null;
}) {
  return (
    <section>
      <h3 className="text-sm uppercase tracking-[0.18em] text-dark-400 mb-4 sm:mb-5">
        lifetime
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="scrobbles"
          value={profile ? formatNumber(profile.playcount) : "—"}
          hint="total last.fm scrobbles"
        />
        <StatCard
          label="listening for"
          value={accountAgeLabel ?? "—"}
          hint={
            profile?.registeredUnix
              ? `since ${registeredLabel(profile.registeredUnix)}`
              : undefined
          }
        />
        <StatCard
          label="daily avg"
          value={playsPerDay != null ? formatNumber(playsPerDay) : "—"}
          hint="scrobbles per day since joining"
        />
      </div>
    </section>
  );
}
