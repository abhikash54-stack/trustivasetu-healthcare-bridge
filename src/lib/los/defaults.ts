import type { LosDatabase } from './types'

export const EMPTY_DB: LosDatabase = {
  users: [],
  hospitals: [
    {
      id: 'h1',
      name: 'Hospital1 - HYDERABAD',
      city: 'HYDERABAD',
      phone: '9999999991',
      stage: 'ACTIVE_PARTNER',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'h2',
      name: 'Hospital2 - GK1',
      city: 'DELHI',
      phone: '9999999992',
      stage: 'ACTIVE_PARTNER',
      createdAt: new Date().toISOString(),
    },
  ],
  leads: [],
  enquiries: [],
  visits: [],
  attendance: [],
  targets: [],
  emiQuotes: [],
  comments: [],
  nach: [],
  collections: [],
}
