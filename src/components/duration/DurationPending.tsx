import {
  createContext,
  ReactNode,
  useContext,
} from "react";
import { ChartPeriod } from "@/lib/period";
import { useDurationPending } from "@/hooks";

type DurationPendingValue = ReturnType<typeof useDurationPending>;

const DurationPendingContext = createContext<DurationPendingValue | null>(
  null
);

export function DurationPendingProvider({
  period,
  pathname,
  children,
}: {
  period: ChartPeriod;
  pathname: string;
  children: ReactNode;
}) {
  const value = useDurationPending(pathname, period);
  return (
    <DurationPendingContext.Provider value={value}>
      {children}
    </DurationPendingContext.Provider>
  );
}

export function useDurationPendingContext(): DurationPendingValue {
  const ctx = useContext(DurationPendingContext);
  if (!ctx) {
    throw new Error(
      "useDurationPendingContext must be used within DurationPendingProvider"
    );
  }
  return ctx;
}

export function useIsDurationPending(): boolean {
  return useDurationPendingContext().isPending;
}
