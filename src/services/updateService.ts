import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { APP_INFO } from '../config/environment';

export interface ReleaseMetadata {
  version: string;
  buildNumber: number;
  releaseDate: string;
  releaseNotes: string;
  apkUrl?: string;
  mandatory?: boolean;
  minimumSupportedVersion?: string;
  maintenanceMode?: boolean;
  forceUpdate?: boolean;
  iOSAppStoreUrl?: string;
  signature?: string;
  signatureAlgorithm?: string;
  source?: string;
}

export interface AppVersionInfo {
  version: string;
  buildNumber: string;
  releaseDate: string;
}

const LAST_UPDATE_CHECK_KEY = '@trustiva:last-update-check';
const DEFAULT_METADATA_URL = APP_INFO.updateApiUrl;

function ensureHttps(url: string): string {
  if (!/^https:\/\//.test(url)) {
    throw new Error(`Blocked insecure update URL: ${url}`);
  }
  return url;
}

function ensurePermanentPortalUrl(url: string | undefined, label: string): string | undefined {
  if (!url) return undefined;
  const normalized = ensureHttps(url);
  if (!normalized.startsWith('https://app.trustivasetu.com')) {
    throw new Error(`${label} must use the permanent portal URL.`);
  }
  return normalized;
}

function parseVersion(version: string): number[] {
  return (version || '0.0.0')
    .split('.')
    .map((part) => Number.parseInt(part.replace(/[^\d]/g, ''), 10) || 0);
}

function compareVersions(left: string, right: string): number {
  const a = parseVersion(left);
  const b = parseVersion(right);
  const max = Math.max(a.length, b.length);
  for (let index = 0; index < max; index += 1) {
    const av = a[index] ?? 0;
    const bv = b[index] ?? 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

function normalizeMetadata(payload: any): ReleaseMetadata {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid update metadata response.');
  }

  const version = String(payload.version ?? '').trim();
  const buildNumber = Number(payload.buildNumber ?? 0);
  const releaseDate = String(payload.releaseDate ?? '').trim();
  const releaseNotes = String(payload.releaseNotes ?? '').trim();

  if (!version) {
    throw new Error('Update metadata is missing a valid version.');
  }

  if (!Number.isInteger(buildNumber) || buildNumber < 1) {
    throw new Error('Update metadata is missing a valid build number.');
  }

  if (!releaseDate) {
    throw new Error('Update metadata is missing a release date.');
  }

  const apkUrl = ensurePermanentPortalUrl(payload.apkUrl ? String(payload.apkUrl).trim() : undefined, 'APK URL');
  const iOSAppStoreUrl = ensurePermanentPortalUrl(payload.iOSAppStoreUrl ? String(payload.iOSAppStoreUrl).trim() : undefined, 'iOS TestFlight URL');

  return {
    version,
    buildNumber,
    releaseDate,
    releaseNotes,
    apkUrl,
    mandatory: payload.mandatory === true,
    minimumSupportedVersion: payload.minimumSupportedVersion ? String(payload.minimumSupportedVersion) : undefined,
    maintenanceMode: payload.maintenanceMode === true,
    forceUpdate: payload.forceUpdate === true,
    iOSAppStoreUrl,
    signature: payload.signature ? String(payload.signature) : undefined,
    signatureAlgorithm: payload.signatureAlgorithm ? String(payload.signatureAlgorithm) : undefined,
    source: payload.source ? String(payload.source) : 'manifest',
  };
}

export async function getLatestUpdateMetadata(url = DEFAULT_METADATA_URL): Promise<ReleaseMetadata | null> {
  const endpoint = ensureHttps(url);
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Update metadata request failed with status ${response.status}.`);
  }

  const data = await response.json();
  return normalizeMetadata(data);
}

export function isNativeUpdateAvailable(currentVersion: string, currentBuildNumber: number, metadata: ReleaseMetadata | null | undefined): boolean {
  if (!metadata) return false;
  const versionDelta = compareVersions(metadata.version, currentVersion);
  const buildDelta = metadata.buildNumber - currentBuildNumber;
  return versionDelta > 0 || buildDelta > 0;
}

export function getCurrentAppVersionInfo(): AppVersionInfo {
  return {
    version: Constants.expoConfig?.version ?? APP_INFO.version,
    buildNumber: String(Constants.expoConfig?.android?.versionCode ?? Constants.expoConfig?.ios?.buildNumber ?? APP_INFO.buildNumber),
    releaseDate: APP_INFO.releaseDate,
  };
}

export async function markLastUpdateCheck(): Promise<void> {
  await AsyncStorage.setItem(LAST_UPDATE_CHECK_KEY, new Date().toISOString());
}

export async function getLastUpdateCheck(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_UPDATE_CHECK_KEY);
}
