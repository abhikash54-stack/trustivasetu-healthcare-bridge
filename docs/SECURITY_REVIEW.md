# TrustivaSetu Security Review

## Current Status

The mobile app now enforces HTTPS-only API access, uses secure storage patterns, and blocks insecure update URLs. The remaining security controls must be enforced in the backend and infrastructure layers.

## High Priority Backend Actions

1. Enforce Argon2id/bcrypt password hashing.
2. Implement JWT validation and refresh-token rotation.
3. Add rate limiting and request validation.
4. Enforce RBAC per API route.
5. Add immutable audit logs and admin activity tracking.
6. Add device/session controls and single-session policy support.

## Mobile App Hardening

- Keep tokens in Expo Secure Store.
- Avoid persisting passwords.
- Ensure production logs are suppressed.
- Add a dedicated security screen for device integrity checks.
- Prepare for root/jailbreak and emulator detection.

## Compliance Notes

- Privacy policy and terms should be linked in app and portal.
- Account deletion requests should be routed to a secure support workflow.
- Data retention and consent flows should be documented and backed by backend services.
