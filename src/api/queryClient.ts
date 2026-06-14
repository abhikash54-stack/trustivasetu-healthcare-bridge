import { QueryClient } from '@tanstack/query-core';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = '@trustiva:query_cache';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: (failureCount: number, error: unknown) => {
        const status = (error as any)?.response?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 2;
      },
      retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 10000),
    },
  },
});

const qc = queryClient as any;

export async function restoreQueryCache(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const { timestamp, queries } = JSON.parse(raw) as { timestamp: number; queries: Array<{ queryKey: unknown[]; data: unknown }> };
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) return;
    for (const entry of queries) {
      qc.setQueryData(entry.queryKey, entry.data);
    }
  } catch {
    // corrupted cache — ignore
  }
}

export async function persistQueryCache(): Promise<void> {
  try {
    const cache: Array<{ queryKey: unknown[]; data: unknown }> = qc
      .getQueryCache()
      .getAll()
      .filter((q: any) => q.state.status === 'success')
      .map((q: any) => ({ queryKey: q.queryKey, data: q.state.data }))
      .slice(0, 50);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), queries: cache }));
  } catch {
    // storage full — ignore
  }
}

qc.getQueryCache().subscribe((event: any) => {
  if (event?.type === 'updated' && event.query.state.status === 'success') {
    persistQueryCache().catch(() => {});
  }
});

export function invalidateQueries(...keys: unknown[][]): void {
  for (const key of keys) {
    qc.invalidateQueries({ queryKey: key });
  }
}
