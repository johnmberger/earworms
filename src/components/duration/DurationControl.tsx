import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PERIOD_OPTIONS } from "@/lib/period";
import { useDurationPendingContext } from "@/components/duration/DurationPending";

type DurationControlProps = {
  className?: string;
};

type PillBox = { left: number; width: number };

/** Segmented control for chart duration (`?period=`). Requires DurationPendingProvider. */
export default function DurationControl({ className = "" }: DurationControlProps) {
  const { isPending, displayPeriod, selectPeriod } =
    useDurationPendingContext();
  const railRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState<PillBox | null>(null);

  const updatePill = () => {
    const rail = railRef.current;
    const index = PERIOD_OPTIONS.findIndex((o) => o.value === displayPeriod);
    const el = itemRefs.current[index];
    if (!rail || !el) return;
    const railBox = rail.getBoundingClientRect();
    const elBox = el.getBoundingClientRect();
    setPill({
      left: elBox.left - railBox.left,
      width: elBox.width,
    });
  };

  useLayoutEffect(() => {
    updatePill();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- measure after displayPeriod changes
  }, [displayPeriod]);

  useEffect(() => {
    const onResize = () => updatePill();
    window.addEventListener("resize", onResize);

    const index = PERIOD_OPTIONS.findIndex((o) => o.value === displayPeriod);
    itemRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });

    const t = window.setTimeout(updatePill, 280);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pill + scroll tied to displayPeriod
  }, [displayPeriod]);

  return (
    <div className={className}>
      <div className="relative -mx-4 sm:mx-0">
        <div className="overflow-x-auto scrollbar-hide px-4 sm:px-0">
          <div
            ref={railRef}
            className={`relative flex min-w-max sm:min-w-0 sm:w-full gap-0.5 rounded-2xl border border-white/15 bg-white/7 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] md:backdrop-blur-2xl transition-opacity ${
              isPending ? "opacity-90" : ""
            }`}
            role="navigation"
            aria-label="chart duration"
            aria-busy={isPending}
          >
            {pill ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1 bottom-1 rounded-xl border border-white/40 bg-linear-to-b from-white/40 via-white/18 to-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.55)] md:backdrop-blur-md transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ left: pill.left, width: pill.width }}
              />
            ) : null}

            {PERIOD_OPTIONS.map((option, index) => {
              const active = option.value === displayPeriod;

              return (
                <button
                  key={option.value}
                  type="button"
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  title={option.label}
                  disabled={isPending && !active}
                  onClick={() => selectPeriod(option.value)}
                  className={`relative z-10 flex-1 shrink-0 sm:shrink px-3.5 py-2.5 rounded-xl text-center text-sm whitespace-nowrap transition-colors duration-200 ${
                    active
                      ? "text-white font-semibold"
                      : "text-white/45 hover:text-white/80"
                  } disabled:cursor-wait`}
                  aria-current={active ? "true" : undefined}
                >
                  <span className="sm:hidden">{option.shortLabel}</span>
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
