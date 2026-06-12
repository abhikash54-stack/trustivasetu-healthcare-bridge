import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { loadAuthState } from '../services/storageService';
import { signIn } from '../store/slices/authSlice';

export function useCachedAuth() {
  const dispatch = useDispatch();

  useEffect(() => {
    async function init() {
      const stored = await loadAuthState();
      if (stored) {
        const parsed = JSON.parse(stored) as { token: string; user: { name: string; email: string } };
        dispatch(signIn(parsed));
      }
    }

    init();
  }, [dispatch]);
}
