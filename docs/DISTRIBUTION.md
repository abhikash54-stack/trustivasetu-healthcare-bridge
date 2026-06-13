# TrustivaSetu — App Distribution & Build Guide
**A Division of Aarthsetu Technologies Private Limited**

---

## 1. Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  EAS Build Service                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │   DEV    │  │ STAGING  │  │     PRODUCTION        │  │
│  │ (debug)  │  │  (APK)   │  │   (AAB / IPA)         │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
└───────┼─────────────┼───────────────────┼──────────────┘
        │             │                   │
        ▼             ▼                   ▼
   Dev Build     Internal APK       Play Store /
   (Expo Go)     (direct link)      App Store
```

---

## 2. Environment Architecture

| Environment | API URL | Use Case |
|---|---|---|
| `development` | `http://localhost:3000/api` | Local dev, hot reload |
| `staging` | `https://api-staging.trustivasetuhealth.com/api` | QA, UAT, advisor demos |
| `production` | `https://api.trustivasetuhealth.com/api` | Live users |

Each environment has:
- Separate API URL (set via `APP_ENV` in `eas.json`)
- Separate auth tokens / JWT secrets on backend
- Environment badge shown in the app header (non-production only)

---

## 3. EAS Configuration (`eas.json`)

```json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "staging":     { "distribution": "internal", "android": { "buildType": "apk" } },
    "preview":     { "distribution": "internal", "android": { "buildType": "apk" } },
    "production":  { "distribution": "store",    "android": { "buildType": "app-bundle" } }
  }
}
```

---

## 4. Build Commands

### Prerequisites
```bash
npm install -g eas-cli
eas login   # log in with info@aarthsetu.com
```

### Development Build (for emulator / physical device with dev client)
```bash
eas build --profile development --platform android
eas build --profile development --platform ios
```

### Staging APK (share with testers via direct link)
```bash
eas build --profile staging --platform android
# → Produces a downloadable APK link
```

### Preview Build (EAS internal distribution link)
```bash
eas build --profile preview --platform android
eas build --profile preview --platform ios
# → EAS generates a shareable URL: https://expo.dev/accounts/trustivasetu/builds/...
```

### Production AAB (Google Play Store upload)
```bash
eas build --profile production --platform android
eas submit --profile production --platform android
```

### Production IPA (Apple App Store / TestFlight)
```bash
eas build --profile production --platform ios
eas submit --profile production --platform ios
```

### Local APK (without EAS — offline build)
```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
# APK at: android/app/build/outputs/apk/release/app-release.apk
```

---

## 5. Tester Onboarding Flow

```
Super Admin
    │
    ▼
Invite by email (Admin Panel → Settings → Tester Management)
    │
    ▼
System sends invitation email
    ├── Recipient: tester@company.com
    ├── Subject: "You've been invited to TrustivaSetu"
    ├── Body: Install link + temporary password
    └── Expiry: 72 hours
    │
    ▼
Tester installs app (APK link / TestFlight / EAS link)
    │
    ▼
First login with temporary password
    │
    ▼
Forced password change on first login
    │
    ▼
Role assigned by Super Admin:
    ├── SUPER_ADMIN — full access
    ├── ADMIN — admin panel + all modules
    ├── MANAGER — leads, clinics, reports, tasks
    ├── RM — assigned leads, clinics, enquiries
    └── EMPLOYEE — attendance, leave, HR policies
    │
    ▼
Tester sees role-filtered LMS data
```

### Tester Access Management (Admin Panel API)
```
POST   /api/testers/invite          — Send invite email
POST   /api/testers/create          — Create account directly
PATCH  /api/testers/:id/role        — Change role
PATCH  /api/testers/:id/enable      — Enable access
PATCH  /api/testers/:id/disable     — Disable access
DELETE /api/testers/:id/expire      — Expire access immediately
GET    /api/testers/:id/audit       — View invitation audit trail
```

---

## 6. App Sharing Process

### Option A — EAS Preview Link (recommended for co-founders / advisors)
```bash
eas build --profile preview --platform android
# After build completes (~15 min):
# Share URL: https://expo.dev/accounts/aarthsetu1/builds/<build-id>
# Recipient installs directly from browser (Android) or TestFlight (iOS)
```

### Option B — Direct APK (quickest for Android)
```bash
eas build --profile staging --platform android
# Download APK from EAS dashboard
# Share via WhatsApp, email, or Drive
# Recipient: Settings → Install unknown apps → enable → install
```

### Option C — Expo Go (fastest for testing, no install needed)
```bash
npx expo start --tunnel
# Share QR code
# Requires: Expo Go app + same WiFi (or tunnel)
```

---

## 7. APK / TestFlight Distribution

### Android Internal Testing (Google Play Console)
1. Build AAB: `eas build --profile production --platform android`
2. Upload to Play Console → Internal testing track
3. Add tester emails to the Internal testing group
4. Testers receive Play Store install link

### iOS TestFlight
1. Build IPA: `eas build --profile production --platform ios`
2. Submit to App Store Connect: `eas submit --profile production --platform ios`
3. App Store Connect → TestFlight → Add internal testers (by Apple ID)
4. External testers → Create group → Add emails → Apple sends TestFlight invite

### Enterprise Distribution (without stores)
```bash
# iOS: Requires Apple Enterprise Program ($299/year)
eas build --profile production --platform ios
# Distribute IPA via MDM or hosted link

# Android: Host APK on internal server / Google Drive
eas build --profile staging --platform android
# Share download link directly
```

---

## 8. Production Release Checklist

### Pre-Build
- [ ] Update `version` in `app.json` (e.g. `1.0.1`)
- [ ] Update `versionCode` / `buildNumber` in `app.json`
- [ ] Set `APP_ENV=production` in `eas.json` production profile
- [ ] Verify production API URL in `src/config/environment.ts`
- [ ] Run `npx tsc --noEmit` — 0 errors
- [ ] Run `npx expo start -c` and test on physical device
- [ ] Test login, drawer navigation, all screen loads
- [ ] Verify role-based menu visibility (RM vs Employee vs Admin)
- [ ] Test on Android 10+ and iOS 15+

### Build & Submit
- [ ] `eas build --profile production --platform android`
- [ ] `eas build --profile production --platform ios`
- [ ] Test production build on physical device before submitting
- [ ] `eas submit --profile production --platform android`
- [ ] `eas submit --profile production --platform ios`

### Play Store Metadata
- **App Name**: TrustivaSetu
- **Short Description**: Healthcare Fintech LMS for Clinic Onboarding & Loan Management
- **Category**: Business
- **Content Rating**: Everyone
- **Privacy Policy URL**: https://trustivasetu.com/privacy

### App Store Metadata
- **App Name**: TrustivaSetu
- **Subtitle**: A Division of Aarthsetu Technologies
- **Category**: Business
- **Age Rating**: 4+
- **Privacy Policy URL**: https://trustivasetu.com/privacy

---

## 9. Branding Applied (Code Changes)

| Location | Before | After |
|---|---|---|
| `app.json` name | `trustivasetu-healthcare-bridge` | `TrustivaSetu` |
| `app.json` slug | `trustivasetu-healthcare-bridge` | `trustivasetu` |
| `app.json` bundle ID | _(none)_ | `com.aarthsetu.trustivasetu` |
| `app.json` splash bg | _(none)_ | `#006B3C` (brand green) |
| Login screen | Plain header | TrustivaSetu logo + tagline on green bg |
| App header | User name + role | TrustivaSetu · User name · Role |
| Drawer footer | _(none)_ | TrustivaSetu branding + version |
| About screen | _(none)_ | Full brand card with version, links |
| Drawer menu | No About item | "About TrustivaSetu" menu item |
| Copyright | _(none)_ | © Aarthsetu Technologies Pvt Ltd |

---

## 10. Environment Variable Reference

| Variable | Values | Set In |
|---|---|---|
| `APP_ENV` | `development`, `staging`, `production` | `eas.json` → `env` |
| `API_BASE_URL` | Derived from `APP_ENV` in `environment.ts` | Code |

---

*TrustivaSetu — A Division of Aarthsetu Technologies Private Limited*
*© 2025 Aarthsetu Technologies Private Limited. All rights reserved.*
