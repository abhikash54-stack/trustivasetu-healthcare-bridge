# Production URLs — data.trustivasetu.com

Single Vercel deploy (trustiva-lms project):

| App | URL |
|-----|-----|
| **LMS login** | https://data.trustivasetu.com/lms/login |
| **LMS dashboard** | https://data.trustivasetu.com/dashboard |
| **LOS login** | https://data.trustivasetu.com/login |
| **LOS console** | https://data.trustivasetu.com/partner |

## Vercel env (required)

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` = `https://data.trustivasetu.com`
- `LOS_API_KEY` = same value used by LOS sync client
- `WEBHOOK_SECRET` (optional)

## Deploy

```powershell
cd C:\trustiva-lms
npm install
npm run deploy
```
