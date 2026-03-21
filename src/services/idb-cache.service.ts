/**
 * IndexedDB Cache Service — stale-while-revalidate pattern.
 *
 * All API data goes through this cache. Components render cached data instantly,
 * then a background fetch updates the cache (and UI) only when data has changed.
 */

const DB_NAME = 'nestly_cache';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  hash: string;
  timestamp: number;
  expiresAt: number | null; // null = no expiry
}

function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

function hashData(data: unknown): string {
  return djb2Hash(JSON.stringify(data));
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

function txn(mode: IDBTransactionMode): Promise<IDBObjectStore> {
  return openDB().then((db) => {
    const tx = db.transaction(STORE_NAME, mode);
    return tx.objectStore(STORE_NAME);
  });
}

function idbRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Get cached data by key. Returns null if not found or expired.
 */
async function get<T>(key: string): Promise<{ data: T; hash: string; timestamp: number } | null> {
  try {
    const store = await txn('readonly');
    const entry = await idbRequest<CacheEntry<T> | undefined>(store.get(key));
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      // Expired — remove async, return null
      remove(key).catch(() => {});
      return null;
    }
    return { data: entry.data, hash: entry.hash, timestamp: entry.timestamp };
  } catch {
    return null;
  }
}

/**
 * Store data in cache. Returns the hash of the stored data.
 */
async function set<T>(key: string, data: T, ttlMs?: number): Promise<string> {
  const hash = hashData(data);
  const entry: CacheEntry<T> = {
    key,
    data,
    hash,
    timestamp: Date.now(),
    expiresAt: ttlMs ? Date.now() + ttlMs : null,
  };
  try {
    const store = await txn('readwrite');
    await idbRequest(store.put(entry));
  } catch {
    // Silently fail — cache is a best-effort optimization
  }
  return hash;
}

/**
 * Set data only if hash differs from the current entry.
 * Returns { changed: boolean, hash: string }.
 */
async function setIfChanged<T>(
  key: string,
  data: T,
  ttlMs?: number
): Promise<{ changed: boolean; hash: string }> {
  const newHash = hashData(data);
  try {
    const store = await txn('readonly');
    const existing = await idbRequest<CacheEntry | undefined>(store.get(key));
    if (existing && existing.hash === newHash) {
      return { changed: false, hash: newHash };
    }
  } catch {
    // Fall through to write
  }
  await set(key, data, ttlMs);
  return { changed: true, hash: newHash };
}

async function remove(key: string): Promise<void> {
  try {
    const store = await txn('readwrite');
    await idbRequest(store.delete(key));
  } catch {
    // Silent
  }
}

async function clearAll(): Promise<void> {
  try {
    const store = await txn('readwrite');
    await idbRequest(store.clear());
  } catch {
    // Silent
  }
}

/**
 * Remove all entries whose keys start with the given prefix.
 */
async function clearByPrefix(prefix: string): Promise<void> {
  try {
    const store = await txn('readwrite');
    const allKeys = await idbRequest<IDBValidKey[]>(store.getAllKeys());
    for (const k of allKeys) {
      if (typeof k === 'string' && k.startsWith(prefix)) {
        store.delete(k);
      }
    }
  } catch {
    // Silent
  }
}

export const cacheService = {
  get,
  set,
  setIfChanged,
  remove,
  clearAll,
  clearByPrefix,
};
