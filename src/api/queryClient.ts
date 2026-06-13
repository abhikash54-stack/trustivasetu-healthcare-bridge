import { QueryClient } from '@tanstack/react-query';

// Singleton shared between App.tsx (provider) and screens that need
// to imperatively invalidate queries without the useQueryClient hook.
export const queryClient = new QueryClient();

export function invalidateQueries(...keys: string[][]): void {
  (queryClient as any).invalidateQueries({ queryKey: keys[0] });
  for (let i = 1; i < keys.length; i++) {
    (queryClient as any).invalidateQueries({ queryKey: keys[i] });
  }
}
