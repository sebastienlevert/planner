import { useCallback, useEffect, useRef, useState } from 'react';
import { cacheService } from '../services/idb-cache.service';

interface UseCachedQueryOptions<T> {
  /** Unique cache key */
  key: string;
  /** Async function that fetches fresh data */
  fetcher: () => Promise<T>;
  /** Time-to-live in ms. Omit for no expiry. */
  ttlMs?: number;
  /** Skip fetching (e.g. when not authenticated yet) */
  enabled?: boolean;
  /** Called when fresh data differs from cache */
  onDataChanged?: (fresh: T) => void;
}

interface UseCachedQueryResult<T> {
  data: T | null;
  /** True only on initial load when there is no cached data */
  isLoading: boolean;
  /** True while the background revalidation fetch is in-flight */
  isRevalidating: boolean;
  /** Data came from cache and hasn't been revalidated yet */
  isStale: boolean;
  error: string | null;
  /** Manually trigger a revalidation */
  revalidate: () => Promise<void>;
}

/**
 * Stale-while-revalidate hook backed by IndexedDB.
 *
 * 1. Returns cached data immediately (isStale = true)
 * 2. Fetches fresh data in background
 * 3. Updates state only if data hash differs
 */
export function useCachedQuery<T>(options: UseCachedQueryOptions<T>): UseCachedQueryResult<T> {
  const { key, fetcher, ttlMs, enabled = true, onDataChanged } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs to track latest values without re-triggering effects
  const fetcherRef = useRef(fetcher);
  const onChangedRef = useRef(onDataChanged);
  fetcherRef.current = fetcher;
  onChangedRef.current = onDataChanged;

  // 1. Load from cache on mount (or key change)
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      const cached = await cacheService.get<T>(key);
      if (cached && !cancelled) {
        setData(cached.data);
        setIsStale(true);
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, enabled]);

  // 2. Background revalidation
  const revalidate = useCallback(async () => {
    if (!enabled) return;
    setIsRevalidating(true);
    setError(null);
    try {
      const fresh = await fetcherRef.current();
      const { changed } = await cacheService.setIfChanged(key, fresh, ttlMs);
      if (changed) {
        setData(fresh);
        onChangedRef.current?.(fresh);
      }
      setIsStale(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch failed');
    } finally {
      setIsRevalidating(false);
      setIsLoading(false);
    }
  }, [key, ttlMs, enabled]);

  // Auto-revalidate on mount / key change
  useEffect(() => {
    if (enabled) revalidate();
  }, [revalidate, enabled]);

  return { data, isLoading, isRevalidating, isStale, error, revalidate };
}
