import { Skeleton } from "@/components/shared/Skeleton";

export function MePeriodSkeleton() {
  return (
    <section aria-hidden="true">
      <Skeleton className="h-3 w-24 mb-4 sm:mb-5" />
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="panel px-4 py-5 sm:px-5 sm:py-6">
          <Skeleton className="h-2.5 w-14 mb-5" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
            <Skeleton className="w-[200px] h-[200px] rounded-full mx-auto sm:mx-0 shrink-0" />
            <div className="min-w-0 flex-1 w-full">
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 max-w-lg">
                <div>
                  <Skeleton className="h-7 w-12 mb-2" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <div>
                  <Skeleton className="h-7 w-10 mb-2" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div>
                  <Skeleton className="h-7 w-10 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <Skeleton className="h-3.5 w-[70%]" />
                    <Skeleton className="h-3 w-8 shrink-0" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="panel px-4 py-5 sm:px-5 sm:py-6">
            <Skeleton className="h-2.5 w-20 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-[60%]" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          </div>
          <div className="panel px-4 py-5 sm:px-5 sm:py-6">
            <Skeleton className="h-2.5 w-12 mb-4" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-48 mb-4" />
            <Skeleton className="h-20 w-full rounded-md" />
            <div className="flex justify-between mt-2">
              <Skeleton className="h-2.5 w-8" />
              <Skeleton className="h-2.5 w-8" />
              <Skeleton className="h-2.5 w-8" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
