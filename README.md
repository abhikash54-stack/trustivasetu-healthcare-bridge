# Trustivasetu Healthcare Bridge

A React Native mobile app built with Expo SDK 56 for the Trustivasetu healthcare platform. It connects relationship managers, clinics, leads, and enquiries through a unified field operations interface.

## Tech Stack

- **Expo SDK 56** — React Native 0.85 / React 19
- **TypeScript**
- **Redux Toolkit v2** + **React Redux v9** — global state
- **TanStack Query v5** — server state / data fetching
- **React Navigation v6** — stack + bottom tab navigation
- **Axios** — HTTP client
- **Shopify Restyle** — theme-based styling

## Screens

| Area | Screens |
|------|---------|
| Auth | Splash, Login, Forgot Password |
| App | Dashboard, Leads, Lead Details, Clinics, Clinic Details |
| App | Enquiries, Enquiry Details, Tasks, Agreements, RM Assignment, Profile |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your device

### Install

```bash
npm install --legacy-peer-deps
```

### Run

```bash
# Local network
npx expo start

# Tunnel (for Expo Go over any network)
npx expo start --tunnel
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Project Structure

```
src/
  api/          # Axios instance
  components/   # Shared UI components
  constants/    # Route names
  hooks/        # useAuth, useCachedAuth
  navigation/   # Stack and tab navigators
  screens/      # Auth and app screens
  services/     # API service modules
  store/        # Redux store and slices
  theme/        # Restyle theme and ThemeProvider
  types/        # TypeScript types
  utils/        # Validators
```

## Environment

API base URL is configured in `app.json` under `expo.extra.API_BASE_URL`.

## Compatibility

- Expo Go: compatible
- expo-doctor: 21/21 checks passed
