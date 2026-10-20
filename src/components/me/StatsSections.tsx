import { formatNumber } from "@/lib/format";
import type { ChartDepth, ChartOverlap, ListeningTiming } from "@/lib/listening";
import type { UserInfo } from "@/lib/schemas";
import { StatCard } from "@/components/shared/StatCard";
import { ClippedText } from "@/components/shared/ClippedText";
import { DepthPanel } from "@/components/me/DepthChart";
import { WhenPanel } from "@/components/me/WhenChart";

function registeredLabel(unix: number): string {
  return new Date(unix * 1000)
    .toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
    .toLowerCase();
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
                <ClippedText
                  className="font-semibold text-white truncate"
                  text={hit.artist}
                />
                {pieces.length > 0 ? (
                  <ClippedText
                    className="text-xs text-dark-300 truncate mt-0.5"
                    text={pieces.join(" · ")}
                  />
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
