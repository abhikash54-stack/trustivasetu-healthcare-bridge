import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { store } from './store';
import { Navigation } from './navigation';
import { ThemeProvider } from './theme/ThemeProvider';
import { useCachedAuth } from './hooks/useCachedAuth';
import { tokenManager } from './api/tokenManager';
import { signOut } from './store/slices/authSlice';
import { clearAuthState } from './services/storageService';
import { logout } from './services/authService';

const queryClient = new QueryClient();

function AppContent() {
  const dispatch = useDispatch();
  useCachedAuth();

  useEffect(() => {
    tokenManager.setSessionExpiredCallback(async () => {
      await logout();
      await clearAuthState();
      tokenManager.clearTokens();
      dispatch(signOut());
    });
  }, [dispatch]);

  return (
    <>
      <Navigation />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </Provider>
  );
}
