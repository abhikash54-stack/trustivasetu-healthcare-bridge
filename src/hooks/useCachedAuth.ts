import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { loadUser } from '../services/storageService';
import { verifySession } from '../services/authService';
import { signIn, signOut } from '../store/slices/authSlice';

export function useCachedAuth() {
  const dispatch = useDispatch();

  useEffect(() => {
    async function restoreSession() {
      const cachedUser = await loadUser();
      if (!cachedUser) return;

      // Optimistically restore from cache so the UI doesn't flash the login screen
      dispatch(signIn({ user: cachedUser }));

      // Verify the session cookie is still valid
      const verifiedUser = await verifySession();
      if (!verifiedUser) {
        dispatch(signOut());
      } else {
        // Refresh in case profile changed on the server
        dispatch(signIn({ user: verifiedUser }));
      }
    }

    restoreSession();
  }, [dispatch]);
}
