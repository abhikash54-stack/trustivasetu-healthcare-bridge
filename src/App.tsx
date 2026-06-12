import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { store } from './store';
import { Navigation } from './navigation';
import { ThemeProvider } from './theme/ThemeProvider';
import { useCachedAuth } from './hooks/useCachedAuth';

const queryClient = new QueryClient();

export default function App() {
  useCachedAuth();
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <ThemeProvider>
              <Navigation />
              <StatusBar style="auto" />
            </ThemeProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </Provider>
  );
}
