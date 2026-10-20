type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();

/** Chart pages / Last.fm tops — stale is fine for several minutes. */
export const CHART_CACHE_TTL_SECONDS = 5 * 60;

/** CDN / browser caching for /top and /me (includes ?period= variants). */
export const CHART_PAGE_CACHE_CONTROL = `public, s-maxage=${CHART_CACHE_TTL_SECONDS}, stale-while-revalidate=${CHART_CACHE_TTL_SECONDS * 2}`;

/**
 * Process-local TTL cache for Last.fm chart aggregates.
 * Helps warm Node/serverless instances; pair with HTTP Cache-Control for CDN.
 */
export async function withTtlCache<T>(
  key: string,
  ttlSeconds: number,
  load: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value as T;
  }

  const value = await load();
  store.set(key, { value, expiresAt: now + ttlSeconds * 1000 });
  return value;
}

/** Test helper — clears the in-process cache. */
export function clearTtlCache(): void {
  store.clear();
}
