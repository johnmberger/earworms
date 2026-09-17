/**
 * Date / number formatting helpers used across the app.
 */

export const formatTrackDate = (uts: string): string => {
  const date = new Date(parseInt(uts, 10) * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const formatNumber = (value: number): string => {
  return value.toLocaleString("en-US");
};

export const getCurrentDate = (): Date => new Date();
