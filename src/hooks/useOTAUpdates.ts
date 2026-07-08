import { useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

const UPDATE_READY_KEY = '@trustiva:update-ready';

export function useOTAUpdates() {
  useEffect(() => {
    if (__DEV__) return;

    let isMounted = true;

    async function checkAndApplyUpdate() {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (!result.isAvailable) return;

        await Updates.fetchUpdateAsync();
        await AsyncStorage.setItem(UPDATE_READY_KEY, '1');

        if (!isMounted) return;

        Alert.alert(
          'Update ready',
          'A new version has been downloaded. Restart the app to install it.',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Restart now',
              onPress: () => {
                Updates.reloadAsync().catch(() => undefined);
              },
            },
          ],
        );
      } catch {
        // Keep the current bundle active if the update process fails.
      }
    }

    checkAndApplyUpdate();

    return () => {
      isMounted = false;
    };
  }, []);
}
