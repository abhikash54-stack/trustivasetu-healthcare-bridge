import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, restoreQueryCache } from './api/queryClient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { store } from './store';
import { Navigation } from './navigation';
import { ThemeProvider } from './theme/ThemeProvider';
import { useCachedAuth } from './hooks/useCachedAuth';
import { useOTAUpdates } from './hooks/useOTAUpdates';
import { tokenManager } from './api/tokenManager';
import { signOut } from './store/slices/authSlice';
import { clearUser } from './services/storageService';
import { logout } from './services/authService';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineBanner } from './components/OfflineBanner';
import { scheduleOccasionNotifications, scheduleAttendanceDailyReminders } from './services/notificationScheduler';

function AppContent() {
  const dispatch = useDispatch();
  useCachedAuth();
  useOTAUpdates();

  const user = useSelector((s: ReturnType<typeof store.getState>) => s.auth.user);

  useEffect(() => {
    if (user) {
      scheduleOccasionNotifications(user).catch(() => {});
      scheduleAttendanceDailyReminders().catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    restoreQueryCache().catch(() => {});
    tokenManager.setSessionExpiredCallback(async () => {
      await logout();
      await clearUser();
      dispatch(signOut());
    });
  }, [dispatch]);

  return (
    <>
      <OfflineBanner />
      <Navigation />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
