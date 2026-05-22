# Publish LMS → analytics.trustivasetu.com

Production URL: **https://analytics.trustivasetu.com**

## 1. PostgreSQL (required — Vercel par embedded DB nahi chalega)

1. [Neon](https://neon.tech) ya [Supabase](https://supabase.com) par free Postgres banao.
2. Connection string copy karo (`postgresql://...`).

## 2. Vercel project + env variables

Dashboard: [vercel.com](https://vercel.com) → project **trustiva-lms** (ya naya project)

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon/Supabase connection string |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` jaisa long random string |
| `NEXTAUTH_URL` | `https://analytics.trustivasetu.com` |
| `WEBHOOK_SECRET` | Strong random secret |
| `LOS_API_KEY` | Same as LOS app `NEXT_PUBLIC_LOS_API_KEY` |

CLI se add (optional):

```powershell
cd c:\trustiva-lms
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add WEBHOOK_SECRET production
vercel env add LOS_API_KEY production
```

## 3. Deploy

**Important:** Command hamesha **LMS project root** se chalao (`C:\trustiva-lms` ya `trustiva-lms` folder jahan `package.json` + `src/` hai). Parent `trustivasetu-website` se mat chalao.

```powershell
cd C:\trustiva-lms
# pehli baar link (agar .vercel na ho):
# vercel link

vercel deploy --prod
```

Purana CLI: `vercel --prod` bhi chal sakta hai.

**Error:** `Support for single file deployments has been removed`  
→ Aap galat folder se deploy kar rahe ho, ya kisi **ek file** par command chala di. Fix: upar wala `cd C:\trustiva-lms` phir `vercel deploy --prod` (koi file path mat do).

Pehli baar: project name, link to team **trustivasetu** — confirm karein.

Build automatically runs `prisma migrate deploy` (`vercel-build` script).

## 4. Production seed (sirf ek baar)

```powershell
# Local se production DB par (DATABASE_URL production wala set karke):
npx prisma migrate deploy
npm run db:seed
```

Sirf admin + regions + lenders — baaki data LOS se aayega.

## 5. Custom domain — analytics.trustivasetu.com

**Vercel:** Project → **Settings** → **Domains** → Add `analytics.trustivasetu.com`

**DNS** (jahan `trustivasetu.com` host hai — GoDaddy / Cloudflare / etc.):

| Type | Name | Value |
|------|------|--------|
| CNAME | `analytics` | `cname.vercel-dns.com` |

(Cloudflare ho to proxy **DNS only** grey cloud pehle test ke liye.)

SSL Vercel auto issue karega (5–30 min).

## 6. LOS production URLs

LOS `.env.production`:

```
NEXT_PUBLIC_LMS_URL=https://analytics.trustivasetu.com
NEXT_PUBLIC_LOS_API_KEY=<same as LMS LOS_API_KEY>
```

## 7. Verify

- https://analytics.trustivasetu.com/login
- Admin login → empty clinics/leads until LOS sync
- LOS se hospital save → LMS Clinics par dikhe

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Prisma | `DATABASE_URL` production env check karo |
| Login redirect loop | `NEXTAUTH_URL` exactly `https://analytics.trustivasetu.com` |
| LOS sync 401 | `LOS_API_KEY` dono apps mein same |
| Domain not working | DNS CNAME propagate — 24h max |
| `single file deployments` removed | `cd C:\trustiva-lms` then `vercel deploy --prod` — full project, not one file |
| Junction / symlink se fail | Deploy **`C:\trustiva-lms`** (real path) se karo |
