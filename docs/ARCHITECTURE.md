# TrustivaSetu Enterprise Architecture Review

## Overview

TrustivaSetu is a healthcare-finance platform composed of a React Native mobile app, a web-based LMS, backend APIs, databases, and a permanent distribution portal. The current frontend already supports secure HTTPS-only API access, permanent portal-based updates, and role-aware onboarding flows. The remaining enterprise work is mainly backend and infrastructure automation.

## Current Frontend Strengths

- Expo-managed mobile app with typed services and centralized environment configuration.
- Permanent download portal at https://app.trustivasetu.com.
- Version manifest-driven update checks.
- Secure storage and session hardening patterns already implemented in the app layer.
- Support, privacy, terms, and account-deletion screens included for compliance readiness.

## Recommended Production Architecture

CloudFront
↓
AWS WAF
↓
Application Load Balancer
↓
API Gateway / App Service / ECS / EKS
↓
Auth + Business APIs
↓
PostgreSQL / Aurora
↓
Encrypted backups + monitoring

## Security Recommendations

### Authentication
- Use HTTPS everywhere.
- Enforce JWT validation and rotation.
- Support refresh-token rotation and session revocation.
- Add device fingerprinting and configurable single-session enforcement.
- Auto-logout on token expiry or suspicious activity.

### Password Security
- Use Argon2id or bcrypt for password hashing.
- Enforce strong password policy and temporary password expiration.
- Track password history and block reuse.

### API Security
- Rate limiting and WAF rules.
- Strict request validation and schema enforcement.
- SQL injection protection via parameterized queries.
- CSRF protection for browser-based flows.
- Secure headers and CORS hardening.
- Request logging and audit trail.

### Mobile Security
- Continue using Expo Secure Store for tokens.
- Avoid storing raw passwords locally.
- Add screenshot protection for sensitive screens.
- Remove production debug logs.
- Prepare root/jailbreak and emulator detection.
- Prepare SSL pinning for high-risk workflows.

## Operational Recommendations

- Configure crash reporting and performance monitoring.
- Add audit logging for admin actions, authentication events, and data exports.
- Implement alerting for suspicious login activity, failed logins, and service degradation.
- Keep release metadata and OTA manifests versioned and signed.

## Compliance Recommendations

- Publish privacy policy and terms.
- Add consent management and account deletion workflow.
- Keep DPDP-ready data inventory and retention controls.
- Prepare grievance officer and audit documentation.

## Release Automation

Git push
↓
GitHub Actions
↓
TypeScript + Expo Doctor
↓
EAS Build
↓
Upload APK to object storage
↓
Update version.json
↓
Publish portal assets
↓
Publish OTA updates

## Remaining Backend TODOs

- Replace demo auth endpoints with server-backed RBAC enforcement.
- Implement password hashing and session management in the backend.
- Add audit logs, rate limiting, and monitoring.
- Integrate hospital data isolation and role checks at the API layer.
