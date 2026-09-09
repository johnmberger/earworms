import { formatNumber } from "@/lib/dateUtils";
import {
  depthVibe,
  type ChartDepth,
  type ChartOverlap,
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

export function DurationStatsSection({
  rangeLabel,
  depth,
  overlap,
}: {
  rangeLabel: string;
  depth: ChartDepth | null;
  overlap: ChartOverlap | null;
}) {
  return (
    <section>
      <h3 className="text-sm uppercase tracking-[0.18em] text-dark-400 mb-4 sm:mb-5">
        {rangeLabel}
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {depth ? (
          <div className="panel px-4 py-5 sm:px-5 sm:py-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-pink-300/80 mb-4">
              depth
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums leading-none">
                  {formatNumber(depth.totalPlays)}
                </p>
                <p className="text-xs text-dark-400 mt-1.5">plays</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums leading-none">
                  {formatNumber(depth.uniqueArtists)}
                </p>
                <p className="text-xs text-dark-400 mt-1.5">artists</p>
              </div>
            </div>

            {depth.leaders.length > 0 ? (
              <>
                <div className="flex h-2 rounded-full overflow-hidden bg-white/5 mb-3">
                  {depth.leaders.map((leader, i) => {
                    const tones = [
                      "bg-pink-400",
                      "bg-purple-400",
                      "bg-blue-400",
                      "bg-cyan-400",
                      "bg-violet-300",
                    ];
                    return (
                      <div
                        key={leader.name}
                        className={`${tones[i % tones.length]} min-w-[2px]`}
                        style={{
                          width: `${Math.max(leader.sharePercent, 1)}%`,
                        }}
                        title={`${leader.name} · ${leader.sharePercent}%`}
                      />
                    );
                  })}
                  {depth.leadersSharePercent < 100 ? (
                    <div
                      className="bg-white/10 min-w-[2px] flex-1"
                      title="everyone else"
                    />
                  ) : null}
                </div>
                <ul className="space-y-1.5 mb-3">
                  {depth.leaders.map((leader, i) => {
                    const tones = [
                      "bg-pink-400",
                      "bg-purple-400",
                      "bg-blue-400",
                      "bg-cyan-400",
                      "bg-violet-300",
                    ];
                    return (
                      <li
                        key={leader.name}
                        className="flex items-baseline justify-between gap-3 text-sm"
                      >
                        <span className="flex items-center gap-2 min-w-0 text-white/90">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${tones[i % tones.length]}`}
                          />
                          <span className="truncate">{leader.name}</span>
                        </span>
                        <span className="text-xs text-dark-400 tabular-nums shrink-0">
                          {leader.sharePercent}%
                          <span className="text-dark-500 hidden sm:inline">
                            {" "}
                            · {formatNumber(leader.plays)}{" "}
                            {leader.plays === 1 ? "play" : "plays"}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-xs text-dark-400">
                  top {depth.leaders.length} = {depth.leadersSharePercent}% of
                  plays · {depth.playsPerArtist} plays / artist ·{" "}
                  {depthVibe(depth)}
                </p>
              </>
            ) : null}
          </div>
        ) : (
          <StatCard label="depth" value="—" />
        )}

        {overlap && overlap.items.length > 0 ? (
          <div className="panel px-4 py-5 sm:px-5 sm:py-6">
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
        ) : (
          <div className="panel px-4 py-5 sm:px-5 sm:py-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-pink-300/80 mb-3">
              earworms
            </p>
            <p className="text-sm text-dark-300">
              nothing stuck across charts for this window.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export function LifetimeSection({
  profile,
  accountAgeLabel,
}: {
  profile: UserInfo | null;
  accountAgeLabel: string | null;
}) {
  return (
    <section>
      <h3 className="text-sm uppercase tracking-[0.18em] text-dark-400 mb-4 sm:mb-5">
        lifetime
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
      </div>
    </section>
  );
}
