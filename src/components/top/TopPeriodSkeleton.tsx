import { Skeleton } from "@/components/shared/Skeleton";

function SkeletonRankRow() {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Skeleton className="h-4 w-5 shrink-0" />
      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-[70%]" />
        <Skeleton className="h-2.5 w-[40%]" />
      </div>
      <Skeleton className="h-3 w-8 shrink-0" />
    </div>
  );
}

export function TopPeriodSkeleton() {
  return (
    <div className="space-y-10 sm:space-y-12" aria-hidden="true">
      <section>
        <Skeleton className="h-3 w-36 mb-4 sm:mb-5" />
        <div className="flex flex-col gap-1.5 sm:grid sm:grid-cols-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="sm:hidden flex items-center gap-3 min-h-[64px] rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2">
                <Skeleton className="w-14 h-14 rounded-lg shrink-0" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-3.5 w-[70%]" />
                  <Skeleton className="h-3 w-[55%]" />
                </div>
              </div>
              <div className="panel px-3 py-4 sm:px-4 sm:py-5 hidden sm:flex flex-col items-center">
                <Skeleton className="w-40 h-40 sm:w-44 sm:h-44 rounded-xl mb-3" />
                <Skeleton className="h-2.5 w-16 mb-2" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-3" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">
        {[0, 1, 2].map((col) => (
          <div key={col}>
            <Skeleton className="h-5 w-28 mb-4" />
            <div className="space-y-0.5">
              {Array.from({ length: 8 }, (_, i) => (
                <SkeletonRankRow key={i} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
