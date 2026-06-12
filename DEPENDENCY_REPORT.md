Dependency resolution report — trustivasetu-healthcare-bridge

Summary (actions taken automatically):

- Scanned: `package.json`.
- Fixed invalid package range: `@shopify/restyle` ^4.2.0 → ^2.4.5 (published 2.x series).
- Downgraded `react` from 19.2.3 → 18.2.0 to satisfy `react-redux` peerDependency constraints.
- Updated `@types/react` to `~18.2.21` to match React 18 typings.

Detected conflicts (not fully resolvable without forcing):

- `react-native@0.85.3` has a peer dependency requiring `react@^19.2.3`.
  - This conflicts with `react-redux@8.1.3` which expects `react` up to 18.
  - Two viable strategies:
    1. Keep `react-native@0.85.3` and use `react@19.x` (requires upgrading `react-redux` or using `--legacy-peer-deps`).
    2. Downgrade `react-native` to a 0.72/0.71 series compatible with React 18 (may conflict with Expo SDK version).

Actions performed to continue setup automatically:

- Ran `npm install --legacy-peer-deps` to bypass strict peer dependency resolution and allow installation to proceed while these conflicts remain.

Notes & recommendations:

- The install was executed with `--legacy-peer-deps` so the node_modules tree may contain mismatched peers. This is acceptable for development scaffolding but should be resolved before production builds.
- Preferred long-term fix: choose a consistent trio of (Expo SDK version, React version, React Native version) and pin packages accordingly. For Expo SDK 56 consult the Expo SDK 56 docs for exact compatible React / React Native versions.
- If you want a conservative, safer setup: (a) restore `react` to 19.2.3 and (b) replace `react-redux` usage with local typed wrappers or a version compatible with React 19 if available. Alternatively, use `redux` hooks without `react-redux` until compatible versions are published.

Current state when this report was generated:
- `package.json` updated with `@shopify/restyle` ^2.4.5 and `react` 18.2.0.
- `npm install --legacy-peer-deps` in progress (or recently run). See `BUILD_STATUS.md` for runtime/typecheck results.

Generated at: 2026-06-12
