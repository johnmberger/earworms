import { formatNumber } from "@/lib/dateUtils";
import type { ListeningDensity } from "@/lib/listening";
import { StatCard } from "@/components/shared/StatCard";

function densityDelta(today: number, yesterday: number): string {
  if (today === yesterday) return "same as yesterday";
  if (today > yesterday) {
    const n = today - yesterday;
    return `+${n} vs yesterday`;
  }
  const n = yesterday - today;
  return `−${n} vs yesterday`;
}

/** Recent listening pace — lives on home next to latest tracks. */
export default function PaceSection({
  density,
}: {
  density: ListeningDensity | null;
}) {
  if (!density) return null;

  return (
    <section className="mt-14 sm:mt-16">
      <h3 className="text-sm uppercase tracking-[0.18em] text-dark-400 mb-4 sm:mb-5">
        pace
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="today"
          value={formatNumber(density.today)}
          hint={densityDelta(density.today, density.yesterday)}
        />
        <StatCard
          label="yesterday"
          value={formatNumber(density.yesterday)}
          hint="scrobbles yesterday"
        />
        <StatCard
          label="recent daily avg"
          value={formatNumber(density.recentDailyAvg)}
          hint={`from the last ${formatNumber(density.samplePlays)} scrobbles across ${density.sampleDays} day${density.sampleDays === 1 ? "" : "s"}`}
        />
      </div>
    </section>
  );
}
