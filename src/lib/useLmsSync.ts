'use client'

import { useCallback, useState } from 'react'
import {
  syncActivityToLMS,
  syncClinicToLMS,
  syncCommercialToLMS,
  syncEnquiryToLMS,
  syncUserToLMS,
} from './los-client'

export type SyncToast = { type: 'ok' | 'err'; message: string } | null

export function useLmsSync() {
  const [syncToast, setSyncToast] = useState<SyncToast>(null)
  const [syncing, setSyncing] = useState(false)

  const notify = useCallback((type: 'ok' | 'err', message: string) => {
    setSyncToast({ type, message })
    setTimeout(() => setSyncToast(null), 6000)
  }, [])

  const syncUser = useCallback(
    async (payload: {
      fullName: string
      phone: string
      email: string
      password: string
      role: string
      region?: string
      hospitals?: string[]
    }) => {
      setSyncing(true)
      try {
        const res = await syncUserToLMS({
          fullName: payload.fullName,
          name: payload.fullName,
          phone: payload.phone,
          email: payload.email.toLowerCase(),
          password: payload.password,
          role: payload.role,
          region: payload.region ?? 'South India',
          hospitals: payload.hospitals,
        })
        notify('ok', `User synced to LMS (${(res as { action?: string }).action ?? 'ok'})`)
        return res
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'User sync failed'
        notify('err', msg)
        throw e
      } finally {
        setSyncing(false)
      }
    },
    [notify]
  )

  const syncHospital = useCallback(
    async (payload: Record<string, unknown>) => {
      setSyncing(true)
      try {
        const res = await syncClinicToLMS(payload)
        notify('ok', `Hospital synced to LMS (${(res as { action?: string }).action ?? 'ok'})`)
        return res
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Hospital sync failed'
        notify('err', msg)
        throw e
      } finally {
        setSyncing(false)
      }
    },
    [notify]
  )

  const syncEnquiry = useCallback(
    async (leadForm: Record<string, unknown>, extra?: Record<string, unknown>) => {
      setSyncing(true)
      try {
        const res = await syncEnquiryToLMS(leadForm, extra)
        notify('ok', `Enquiry synced to LMS (${(res as { action?: string }).action ?? 'ok'})`)
        return res
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Enquiry sync failed'
        notify('err', msg)
        throw e
      } finally {
        setSyncing(false)
      }
    },
    [notify]
  )

  const syncCommercial = useCallback(
    async (payload: Record<string, unknown>) => {
      setSyncing(true)
      try {
        const res = await syncCommercialToLMS(payload)
        notify('ok', 'Commercials synced to LMS')
        return res
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Commercial sync failed'
        notify('err', msg)
        throw e
      } finally {
        setSyncing(false)
      }
    },
    [notify]
  )

  const syncActivity = useCallback(
    async (activityType: string, payload: Record<string, unknown>, menu?: string) => {
      setSyncing(true)
      try {
        const res = await syncActivityToLMS(activityType, { ...payload, menu: menu ?? activityType })
        notify('ok', `Synced to LMS — ${(res as { action?: string }).action ?? 'ok'} (reports updated)`)
        return res
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Sync failed'
        notify('err', msg)
        throw e
      } finally {
        setSyncing(false)
      }
    },
    [notify]
  )

  return {
    syncToast,
    syncing,
    syncUser,
    syncHospital,
    syncEnquiry,
    syncCommercial,
    syncActivity,
    notify,
  }
}
