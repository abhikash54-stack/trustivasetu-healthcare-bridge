import { useEffect } from 'react';
import * as Updates from 'expo-updates';

export function useOTAUpdates() {
  useEffect(() => {
    if (__DEV__) return;
    checkAndApplyUpdate();
  }, []);
}

async function checkAndApplyUpdate() {
  try {
    const result = await Updates.checkForUpdateAsync();
    if (result.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch {
    // Silently ignore — app continues on current bundle
  }
}
