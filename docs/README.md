# TrustivaSetu Distribution

This folder hosts the permanent public download experience for TrustivaSetu.

## Permanent public URL

- https://app.trustivasetu.com

## Release update flow

1. Upload the newest signed Android APK to this folder as latest.apk.
2. Update docs/version.json with the new version, build number, release notes, and APK URL.
3. Keep the public URL unchanged.
4. The website and app will automatically read the updated manifest.

## Important

- Do not use temporary Expo artifact URLs in the website or app.
- The public download URL must remain https://app.trustivasetu.com for all releases.
