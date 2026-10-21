type CacheEntry<T> = { value: T; expiresAt: number };

const store = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs = 30_000): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function invalidatePublicCaches(): void {
  for (const key of store.keys()) {
    if (key.startsWith('public:')) {
      store.delete(key);
    }
  }
}
