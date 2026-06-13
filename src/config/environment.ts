import Constants from 'expo-constants';

export type AppEnvironment = 'development' | 'staging' | 'production';

interface EnvironmentConfig {
  name: string;
  apiUrl: string;
  supportEmail: string;
  websiteUrl: string;
  debugMode: boolean;
}

const configs: Record<AppEnvironment, EnvironmentConfig> = {
  development: {
    name: 'Development',
    apiUrl: 'http://localhost:3000/api',
    supportEmail: 'dev@aarthsetu.com',
    websiteUrl: 'https://trustivasetu.com',
    debugMode: true,
  },
  staging: {
    name: 'Staging',
    apiUrl: 'https://lms.trustivasetu.com/api',
    supportEmail: 'staging@aarthsetu.com',
    websiteUrl: 'https://trustivasetu.com',
    debugMode: true,
  },
  production: {
    name: 'Production',
    apiUrl: 'https://lms.trustivasetu.com/api',
    supportEmail: 'info@trustivasetu.com',
    websiteUrl: 'https://trustivasetu.com',
    debugMode: false,
  },
};

const appEnv = (Constants.expoConfig?.extra?.APP_ENV ?? 'production') as AppEnvironment;

export const ENV: EnvironmentConfig = configs[appEnv] ?? configs.production;
export const CURRENT_ENV: AppEnvironment = appEnv;

export const APP_INFO = {
  name: 'TrustivaSetu',
  tagline: 'A Division of Aarthsetu Technologies Private Limited',
  version: Constants.expoConfig?.version ?? '1.0.0',
  buildNumber: (Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode ?? '1').toString(),
  supportEmail: ENV.supportEmail,
  website: ENV.websiteUrl,
  copyright: `© ${new Date().getFullYear()} Aarthsetu Technologies Private Limited. All rights reserved.`,
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.aarthsetu.trustivasetu',
  appStoreUrl: 'https://apps.apple.com/app/trustivasetu/id000000000',
} as const;
