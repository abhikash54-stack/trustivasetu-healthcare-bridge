import * as Sharing from 'expo-sharing';
import { Alert, Linking, Platform } from 'react-native';
import { ENV } from '../config/environment';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const FileSystem = require('expo-file-system/legacy') as {
  cacheDirectory: string | null;
  createDownloadResumable: (
    uri: string,
    fileUri: string,
    options?: { headers?: Record<string, string> },
  ) => { downloadAsync: () => Promise<{ uri: string } | null> };
};

export type ExportType = 'leads' | 'clinics' | 'lender' | 'dashboard';

const EXPORT_LABELS: Record<ExportType, string> = {
  leads: 'Leads',
  clinics: 'Clinics',
  lender: 'Lender Performance',
  dashboard: 'Dashboard Report',
};

export async function downloadAndShareExport(type: ExportType): Promise<void> {
  const label = EXPORT_LABELS[type];
  const url = `${ENV.apiUrl}/export?type=${type}`;
  const filename = `trustiva-${type}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  const cacheDir = FileSystem.cacheDirectory ?? '';
  const localUri = `${cacheDir}${filename}`;

  const isSharingAvailable = await Sharing.isAvailableAsync();

  if (!isSharingAvailable || Platform.OS === 'web' || !cacheDir) {
    await Linking.openURL(url);
    return;
  }

  try {
    const dl = FileSystem.createDownloadResumable(url, localUri, {
      headers: { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    });
    const result = await dl.downloadAsync();
    if (!result?.uri) throw new Error('Download failed');

    await Sharing.shareAsync(result.uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: `Export ${label}`,
      UTI: 'com.microsoft.excel.xlsx',
    });
  } catch {
    Alert.alert(
      `Export ${label}`,
      'Could not download the file. Open in browser instead?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Browser', onPress: () => Linking.openURL(url) },
      ],
    );
  }
}
