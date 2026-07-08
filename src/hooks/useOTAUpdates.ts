import { useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import { APP_INFO } from '../config/environment';
import { getCurrentAppVersionInfo, getLatestUpdateMetadata, isNativeUpdateAvailable, markLastUpdateCheck, ReleaseMetadata } from '../services/updateService';

const UPDATE_READY_KEY = '@trustiva:update-ready';

export async function checkForAvailableUpdates(showAlert = true): Promise<{ otaAvailable: boolean; nativeAvailable: boolean; metadata: ReleaseMetadata | null; message: string }> {
  const current = getCurrentAppVersionInfo();
  let metadata: ReleaseMetadata | null = null;
  let otaAvailable = false;
  let nativeAvailable = false;

  try {
    if (!__DEV__) {
      const result = await Updates.checkForUpdateAsync();
      otaAvailable = Boolean(result.isAvailable);
      if (otaAvailable) {
        await Updates.fetchUpdateAsync();
        await AsyncStorage.setItem(UPDATE_READY_KEY, '1');
      }
    }
  } catch {
    // Ignore OTA failures and continue to native metadata checks.
  }

  try {
    metadata = await getLatestUpdateMetadata();
    nativeAvailable = isNativeUpdateAvailable(current.version, Number(current.buildNumber ?? 0), metadata);
    await markLastUpdateCheck();
  } catch {
    metadata = null;
  }

  if (showAlert) {
    if (otaAvailable) {
      Alert.alert('Update downloaded', 'The app update is ready. Restart the app to apply it.', [
        { text: 'Later', style: 'cancel' },
        { text: 'Restart now', onPress: () => Updates.reloadAsync().catch(() => undefined) },
      ]);
      return { otaAvailable, nativeAvailable, metadata, message: 'Update downloaded. Restart the app to apply it.' };
    }

    if (nativeAvailable && metadata) {
      Alert.alert(
        'A newer version is available',
        `${metadata.version} · ${metadata.releaseNotes}`,
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Update now',
            onPress: () => {
              const portal = APP_INFO.downloadPortalUrl || 'https://app.trustivasetu.com';
              Linking.openURL(portal);
            },
          },
        ],
      );
      return { otaAvailable, nativeAvailable, metadata, message: 'A newer version is available.' };
    }

    if (showAlert) {
      Alert.alert('No updates available', 'You are on the latest available version.');
    }
  }

  return { otaAvailable, nativeAvailable, metadata, message: nativeAvailable ? 'A newer version is available.' : 'No updates available.' };
}

export function useOTAUpdates() {
  useEffect(() => {
    if (__DEV__) return;

    let isMounted = true;

    async function checkAndApplyUpdate() {
      const result = await checkForAvailableUpdates(false);
      if (!isMounted) return;
      if (result.otaAvailable) {
        await AsyncStorage.setItem(UPDATE_READY_KEY, '1');
      }
    }

    checkAndApplyUpdate();

    return () => {
      isMounted = false;
    };
  }, []);
}
