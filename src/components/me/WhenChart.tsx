import { useState } from "react";
import { formatNumber } from "@/lib/format";
import { formatHourLabel, type ListeningTiming } from "@/lib/listening";

export function WhenPanel({ timing }: { timing: ListeningTiming }) {
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
        className="text-xs text-dark-400 mb-4 min-h-5 animate-fade-soft"
      >
        {isPeakDefault ? (
          <>busiest hour (ET) · {timing.peakSharePercent}% of recent plays</>
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
        aria-label="plays by hour of day in Eastern Time"
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
              className={`relative flex-1 min-w-0 rounded-xs transition-[opacity,transform,background-color] duration-300 ease-out focus:outline-hidden focus-visible:ring-1 focus-visible:ring-pink-300/60 ${
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
              aria-label={`${formatHourLabel(hour)} ET · ${count} ${
                count === 1 ? "play" : "plays"
              }`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-dark-500 mt-2 tabular-nums">
        <span>12am ET</span>
        <span>12pm</span>
        <span>11pm</span>
      </div>
    </div>
  );
}
