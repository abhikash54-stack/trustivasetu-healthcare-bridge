import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { loadAuthState } from '../services/storageService';
import { tokenManager } from '../api/tokenManager';
import { signIn } from '../store/slices/authSlice';

export function useCachedAuth() {
  const dispatch = useDispatch();

  useEffect(() => {
    async function restoreSession() {
      const stored = await loadAuthState();
      if (stored) {
        tokenManager.setTokens(stored.token, stored.refreshToken);
        dispatch(signIn({
          token: stored.token,
          refreshToken: stored.refreshToken,
          user: stored.user,
        }));
      }
    }

    restoreSession();
  }, [dispatch]);
}
