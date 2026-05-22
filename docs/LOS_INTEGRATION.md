# Trustiva LOS ↔ LMS Integration



LMS mein **demo hospitals/leads nahi** — saara data LOS se aata hai. Jab aap LOS mein hospital, user, commercial ya enquiry create/update karte ho, LMS API call se automatically sync hota hai.



## Setup



**LMS `.env`:**

```

LOS_API_KEY="your-shared-secret"

WEBHOOK_SECRET="your-shared-secret"

```



**LOS `.env.local`:**

```

NEXT_PUBLIC_LMS_URL=https://analytics.trustivasetu.com

NEXT_PUBLIC_LOS_API_KEY=your-shared-secret

```



Copy `src/lib/los-client.ts` into your LOS project.



## LMS APIs (POST + header `x-los-api-key`)



| LOS action | API | Create / Update |

|------------|-----|-----------------|

| Register / edit hospital | `POST /api/los/sync/clinic` | Upsert by `externalId` |

| Hospital commercials | `POST /api/los/sync/commercial` | Updates `metadata.commercials` |

| Create / edit user | `POST /api/los/sync/user` | Upsert by `email` |

| Create / edit enquiry | `POST /api/los/sync/enquiry` | Upsert by `losEnquiryId` |



## LOS code — har save par call karein



```typescript

import {

  syncClinicToLMS,

  syncCommercialToLMS,

  syncUserToLMS,

  syncEnquiryToLMS,

} from '@/lib/los-client'



// Hospital register OR edit form submit

await syncClinicToLMS({

  externalId: hospital.id,           // stable ID from LOS

  fullName: 'Hospital1 - HYDERABAD',

  phone, email, address, city, state,

  regionCode: 'SOUTH',

  commercials: commercialForm,       // optional — also stored on clinic

})



// Commercial-only update

await syncCommercialToLMS({

  externalId: hospital.id,

  hospitalName: 'Hospital1 - HYDERABAD',

  commercials: commercialForm,

})



// User create OR update

await syncUserToLMS({

  email: 'rm.south@trustivasetu.com',

  fullName, phone, password, role: 'Regional Manager',

  region: 'South India',

})



// Enquiry create OR update

await syncEnquiryToLMS(leadForm, { losEnquiryId: `LOS-${mobile}-${patient}` })

```



## Clear demo data (one time)



```powershell

cd c:\trustiva-lms

npm run db:clear

```



Keeps: regions, lenders, `admin@trustivasetu.com` only.



## Verify



1. LOS se hospital save → LMS **Clinics** par dikhe

2. User save → LMS **Users** par dikhe

3. Enquiry save → LMS **Leads** par dikhe

4. **Admin → Webhook Logs** — `los.enquiry.sync` PROCESSED



## Architecture



```

LOS UI (save button)  ──POST /api/los/sync/*──►  LMS PostgreSQL

                              │

                              ▼

                    Dashboard / Reports / Leads

```



**Important:** LOS abhi `localStorage` use karta hai — har form submit par upar wale `sync*ToLMS()` calls add karni hongi. LOS folder same workspace mein kholo taaki hum har tab wire kar saken.

