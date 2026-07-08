import Constants from 'expo-constants';

export type AppEnvironment = 'development' | 'staging' | 'production';
export type AppReleaseChannel = 'preview' | 'production';

interface EnvironmentConfig {
  name: string;
  apiUrl: string;
  supportEmail: string;
  grievanceEmail: string;
  supportPhone: string;
  websiteUrl: string;
  releaseDate: string;
  updateApiUrl: string;
  releaseNotesUrl: string;
  downloadPortalUrl: string;
  androidDownloadUrl: string;
  iosTestFlightUrl: string;
  debugMode: boolean;
  releaseChannel: AppReleaseChannel;
  previewUpdateApiUrl: string;
}

function ensureHttps(url: string, allowLocalhost = false): string {
  if (allowLocalhost && /^http:\/\/localhost(:|\/|$)/.test(url)) {
    return url;
  }
  if (!/^https:\/\//.test(url)) {
    throw new Error(`Insecure URL blocked in environment config: ${url}`);
  }
  return url;
}

const configs: Record<AppEnvironment, EnvironmentConfig> = {
  development: {
    name: 'Development',
    apiUrl: ensureHttps('http://localhost:3000/api', true),
    supportEmail: 'dev@aarthsetu.com',
    grievanceEmail: 'grievance-dev@aarthsetu.com',
    supportPhone: '+91-9876543210',
    websiteUrl: 'https://trustivasetu.com',
    releaseDate: '2026-07-08',
    updateApiUrl: 'https://app.trustivasetu.com/version.json',
    releaseNotesUrl: 'https://app.trustivasetu.com/release-notes.html',
    downloadPortalUrl: 'https://app.trustivasetu.com',
    androidDownloadUrl: 'https://app.trustivasetu.com/latest.apk',
    iosTestFlightUrl: 'https://app.trustivasetu.com',
    debugMode: true,
    releaseChannel: 'preview',
    previewUpdateApiUrl: 'https://app.trustivasetu.com/version.json',
  },
  staging: {
    name: 'Staging',
    apiUrl: ensureHttps('https://lms.trustivasetu.com/api'),
    supportEmail: 'staging@aarthsetu.com',
    grievanceEmail: 'grievance-staging@aarthsetu.com',
    supportPhone: '+91-9876543210',
    websiteUrl: 'https://trustivasetu.com',
    releaseDate: '2026-07-08',
    updateApiUrl: 'https://app.trustivasetu.com/version.json',
    releaseNotesUrl: 'https://app.trustivasetu.com/release-notes.html',
    downloadPortalUrl: 'https://app.trustivasetu.com',
    androidDownloadUrl: 'https://app.trustivasetu.com/latest.apk',
    iosTestFlightUrl: 'https://app.trustivasetu.com',
    debugMode: true,
    releaseChannel: 'preview',
    previewUpdateApiUrl: 'https://app.trustivasetu.com/version.json',
  },
  production: {
    name: 'Production',
    apiUrl: ensureHttps('https://lms.trustivasetu.com/api'),
    supportEmail: 'info@trustivasetu.com',
    grievanceEmail: 'grievance@trustivasetu.com',
    supportPhone: '+91-9876543210',
    websiteUrl: 'https://trustivasetu.com',
    releaseDate: '2026-07-08',
    updateApiUrl: 'https://app.trustivasetu.com/version.json',
    releaseNotesUrl: 'https://app.trustivasetu.com/release-notes.html',
    downloadPortalUrl: 'https://app.trustivasetu.com',
    androidDownloadUrl: 'https://app.trustivasetu.com/latest.apk',
    iosTestFlightUrl: 'https://app.trustivasetu.com',
    debugMode: false,
    releaseChannel: 'production',
    previewUpdateApiUrl: 'https://app.trustivasetu.com/version.json',
  },
};

const appEnv = (Constants.expoConfig?.extra?.APP_ENV ?? 'production') as AppEnvironment;
const appChannel = (Constants.expoConfig?.extra?.APP_CHANNEL ?? (appEnv === 'production' ? 'production' : 'preview')) as AppReleaseChannel;

const baseConfig = configs[appEnv] ?? configs.production;
export const ENV: EnvironmentConfig = {
  ...baseConfig,
  releaseChannel: appChannel,
};
export const CURRENT_ENV: AppEnvironment = appEnv;

export const APP_INFO = {
  name: 'TrustivaSetu',
  tagline: 'A Division of Aarthsetu Technologies Private Limited',
  version: Constants.expoConfig?.version ?? '1.0.0',
  buildNumber: (Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode ?? '1').toString(),
  supportEmail: ENV.supportEmail,
  grievanceEmail: ENV.grievanceEmail,
  supportPhone: ENV.supportPhone,
  website: ENV.websiteUrl,
  releaseDate: ENV.releaseDate,
  updateApiUrl: ENV.updateApiUrl,
  releaseChannel: ENV.releaseChannel,
  releaseNotesUrl: ENV.releaseNotesUrl,
  downloadPortalUrl: ENV.downloadPortalUrl,
  androidDownloadUrl: ENV.androidDownloadUrl,
  iosTestFlightUrl: ENV.iosTestFlightUrl,
  copyright: `© ${new Date().getFullYear()} Aarthsetu Technologies Private Limited. All rights reserved.`,
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.aarthsetu.trustivasetu',
  appStoreUrl: '', // App Store submission pending — populate after iOS review approval
} as const;
