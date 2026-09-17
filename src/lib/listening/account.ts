/** Lifetime average scrobbles per day since registration. */
export function averagePlaysPerDay(
  playcount: number,
  registeredUnix: number,
  now = new Date()
): number | null {
  if (playcount < 1 || registeredUnix < 1) return null;
  const days = Math.max(
    1,
    (now.getTime() - registeredUnix * 1000) / (24 * 60 * 60 * 1000)
  );
  return Math.round((playcount / days) * 10) / 10;
}

export function formatAccountAge(registeredUnix: number, now = new Date()): {
  years: number;
  label: string;
} {
  const registered = new Date(registeredUnix * 1000);
  const ms = Math.max(0, now.getTime() - registered.getTime());
  const years = ms / (365.25 * 24 * 60 * 60 * 1000);
  const wholeYears = Math.floor(years);
  const months = Math.floor((years - wholeYears) * 12);

  let label: string;
  if (wholeYears <= 0) {
    label = months <= 1 ? "about a month" : `${months} months`;
  } else if (months === 0) {
    label = wholeYears === 1 ? "1 year" : `${wholeYears} years`;
  } else {
    label = `${wholeYears}y ${months}m`;
  }

  return { years: Math.round(years * 10) / 10, label };
}
