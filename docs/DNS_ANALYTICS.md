# analytics.trustivasetu.com — DNS setup (zaroori)

App **Vercel par deploy ho chuka hai**. Error `DNS_PROBE_FINISHED_NXDOMAIN` ka matlab: domain name internet par point nahi ho raha — code ki problem nahi.

## Abhi kaam karne wala URL (DNS ke bina)

**https://data.trustivasetu.com/login**

Login: `admin@trustivasetu.com` / `Admin@123`

## analytics.trustivasetu.com ke liye (ek baar)

Jahan `trustivasetu.com` manage hota hai (Namecheap / GoDaddy — aapke nameserver: `registrar-servers.com`):

### Option A — A record (Vercel recommended)

| Type | Host / Name | Value | TTL |
|------|-------------|-------|-----|
| **A** | `analytics` | `76.76.21.21` | 300 / Auto |

### Option B — CNAME (agar A allow na ho)

| Type | Host | Value |
|------|------|--------|
| **CNAME** | `analytics` | `cname.vercel-dns.com` |

Save karo → 5–30 min wait → browser: https://analytics.trustivasetu.com/login

## Verify

```powershell
nslookup analytics.trustivasetu.com
```

IP `76.76.21.21` ya CNAME dikhna chahiye.

Vercel: Project **trustiva-lms** → Settings → Domains → `analytics.trustivasetu.com` = Valid Configuration

## Localhost vs production

| URL | Kab use karein |
|-----|----------------|
| `http://localhost:3000` | Sirf `npm run dev` (developers) |
| `https://data.trustivasetu.com` | **Abhi sab users ke liye** |
| `https://analytics.trustivasetu.com` | DNS ke baad |

`npm run dev` mat chalao agar sirf live site chahiye — browser mein **data.trustivasetu.com** kholo.
