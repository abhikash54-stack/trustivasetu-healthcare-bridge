'use client'

import { useState } from 'react'
import { CREATE_USER_OPTIONS } from '@/lib/los/constants'
import { syncClinicToLMS, syncCommercialToLMS, syncUserToLMS } from '@/lib/los/sync-to-lms'
import { useLos } from '../LosProvider'
import { HospitalRegisterPanel } from '@/components/HospitalRegisterPanel'
import { btnPrimary, inputCls, selectCls } from '../ui'

export function UserAdminModule() {
  const { db, createUser, upsertHospital, notify, syncing, hospitals } = useLos()
  const [activeType, setActiveType] = useState<string>(CREATE_USER_OPTIONS[0])
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', hospitals: [] as string[] })
  const [error, setError] = useState('')
  const [scheme, setScheme] = useState({ hospitalName: '', schemeName: '' })
  const [hospitalTab, setHospitalTab] = useState('creation')

  const isValidPhone = /^[6-9]\d{9}$/
  const isValidEmail = /^[a-zA-Z0-9._%+-]+@trustivasetu\.com$/

  async function handleCreateUser() {
    setError('')
    if (!form.fullName || !isValidPhone.test(form.phone) || !form.password || !isValidEmail.test(form.email)) {
      setError('Fill all required fields with valid @trustivasetu.com email')
      return
    }
    try {
      await syncUserToLMS({ ...form, role: activeType, region: 'South India' })
      await createUser({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        password: form.password,
        role: activeType,
        hospitals: form.hospitals,
        status: 'ACTIVE',
      })
      notify('ok', 'User created + LMS synced')
      setForm({ fullName: '', phone: '', email: '', password: '', hospitals: [] })
    } catch (e) {
      notify('err', e instanceof Error ? e.message : 'Failed')
    }
  }

  async function syncHospital(payload: Record<string, unknown>) {
    await syncClinicToLMS(payload)
    const name = String(payload.fullName ?? payload.name ?? '')
    if (name) {
      await upsertHospital({
        name,
        city: String(payload.city ?? 'HYDERABAD'),
        phone: String(payload.phone ?? ''),
        email: String(payload.email ?? ''),
        stage: 'CREATED',
      })
    }
    notify('ok', 'Hospital synced to LMS')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">User Administration</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-2">
          {CREATE_USER_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveType(item)}
              className={`w-full text-left px-4 py-2 rounded-xl border ${
                activeType === item ? 'border-lime-300 bg-white/10' : 'border-white/10'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl min-h-[400px] p-6">
          {error && <p className="text-red-400 mb-2">{error}</p>}

          {activeType === 'Hospital' && (
            <HospitalRegisterPanel
              syncing={syncing}
              onSync={syncHospital}
              onRegistered={(name) => {
                void upsertHospital({
                  name,
                  city: 'HYDERABAD',
                  phone: '9999999999',
                  stage: 'CREATED',
                })
                notify('ok', 'Hospital added')
              }}
            />
          )}

          {activeType === 'Hospital Lifecycle' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {['creation', 'onboarding', 'scheme', 'hrc'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setHospitalTab(t)}
                    className={`px-3 py-1 rounded ${hospitalTab === t ? 'bg-lime-300 text-black' : 'bg-white/10'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {hospitalTab === 'scheme' && (
                <>
                  <select className={selectCls} value={scheme.hospitalName} onChange={(e) => setScheme({ ...scheme, hospitalName: e.target.value })}>
                    <option value="">Hospital</option>
                    {hospitals.map((h) => (
                      <option key={h} value={h} className="text-black">{h}</option>
                    ))}
                  </select>
                  <input className={inputCls} placeholder="Scheme name" value={scheme.schemeName} onChange={(e) => setScheme({ ...scheme, schemeName: e.target.value })} />
                  <button
                    type="button"
                    className={btnPrimary}
                    onClick={async () => {
                      await syncCommercialToLMS({ hospitalName: scheme.hospitalName, commercials: scheme })
                      notify('ok', 'Scheme synced')
                    }}
                  >
                    Save scheme → LMS
                  </button>
                </>
              )}
              {hospitalTab !== 'scheme' && activeType === 'Hospital Lifecycle' && (
                <p className="text-gray-400 text-sm">Use Hospital tab for full registration, or scheme tab for commercials.</p>
              )}
            </div>
          )}

          {!['Hospital', 'Hospital Lifecycle', 'Hospital Team Directory'].includes(activeType) && (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Create {activeType}</h3>
              <input className={inputCls} placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <input className={inputCls} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className={inputCls} placeholder="Email @trustivasetu.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className={inputCls} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <select
                className={selectCls}
                onChange={(e) => setForm({ ...form, hospitals: e.target.value ? [e.target.value] : [] })}
              >
                <option value="">Hospital</option>
                {hospitals.map((h) => (
                  <option key={h} value={h} className="text-black">{h}</option>
                ))}
              </select>
              <button type="button" className={btnPrimary} disabled={syncing} onClick={handleCreateUser}>
                {syncing ? 'Syncing…' : 'Create User'}
              </button>
              <ul className="mt-4 space-y-2">
                {db.users.map((u) => (
                  <li key={u.id} className="bg-white/10 p-2 rounded text-sm">
                    {u.fullName} — {u.email} ({u.role})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
