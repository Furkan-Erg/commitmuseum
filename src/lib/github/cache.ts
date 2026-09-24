/**
 * Ephemeral, in-process request memoization — NOT a persistence layer.
 *
 * CommitMuseum deliberately keeps no database: every dashboard load
 * refetches live from the GitHub API. This map only coalesces duplicate
 * calls that happen to land within the same short window (e.g. a page
 * render that touches the same GitHub endpoint twice), so a page reload
 * always sees fresh data. Entries expire quickly and vanish entirely on
 * process restart.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 60_000;

export async function withMemo<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const now = Date.now();
  const cached = store.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  const value = await fn();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}
