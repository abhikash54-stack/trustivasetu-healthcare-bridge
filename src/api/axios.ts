import axios from 'axios';
import Constants from 'expo-constants';

const apiBaseUrl = Constants.expoConfig?.extra?.API_BASE_URL ?? 'https://api.trustivasetuhealth.com';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
