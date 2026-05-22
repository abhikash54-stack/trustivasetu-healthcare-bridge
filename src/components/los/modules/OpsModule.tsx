'use client'

import { useState } from 'react'
import { useLos } from '../LosProvider'
import { syncActivityToLMS } from '@/lib/los/sync-to-lms'
import { btnPrimary, inputCls, selectCls } from '../ui'

type Props = { menu: string }

export function OpsModule({ menu }: Props) {
  const { db, addComment, addNach, addCollection, setLeadStatus, notify, syncing } = useLos()
  const [leadId, setLeadId] = useState('')
  const [text, setText] = useState('')
  const [amount, setAmount] = useState(0)
  const [nachRef, setNachRef] = useState('')
  const [hospitalName, setHospitalName] = useState('')
  const [paymentAmount, setPaymentAmount] = useState(0)

  const lead = db.leads.find((l) => l.id === leadId)

  async function syncCredit(decision: string) {
    if (!lead) return
    await setLeadStatus(lead.id, decision === 'APPROVED' ? 'APPROVED' : 'REJECTED', 'credit')
    notify('ok', 'Credit decision saved + LMS synced')
  }

  async function syncLender() {
    if (!lead) return
    try {
      await syncActivityToLMS('lender', {
        ...lead.form,
        patientName: lead.applicantName,
        mobileNumber: lead.mobileNumber,
        hospitalName: lead.hospitalName,
        lenderCode: menu.includes('1') ? 'LENDER1' : menu.includes('2') ? 'LENDER2' : 'LENDER3',
        menu,
      })
      notify('ok', 'Lender application synced')
    } catch (e) {
      notify('err', e instanceof Error ? e.message : 'Failed')
    }
  }

  if (menu === 'User comments') {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-lime-300">User comments</h2>
        <select className={selectCls} value={leadId} onChange={(e) => setLeadId(e.target.value)}>
          <option value="">Select lead</option>
          {db.leads.map((l) => (
            <option key={l.id} value={l.id} className="text-black">{l.id}</option>
          ))}
        </select>
        <textarea className={inputCls} rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Internal comment" />
        <button type="button" className={btnPrimary} onClick={() => addComment({ leadId, text, visibility: 'internal', by: 'ops' })}>
          Save comment
        </button>
        <ul className="space-y-2">
          {db.comments.filter((c) => !leadId || c.leadId === leadId).map((c) => (
            <li key={c.id} className="bg-white/5 p-3 rounded text-sm">{c.text}</li>
          ))}
        </ul>
      </div>
    )
  }

  if (menu === 'Nach registrations') {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-lime-300">NACH Registration</h2>
        <select className={selectCls} value={leadId} onChange={(e) => setLeadId(e.target.value)}>
          <option value="">Lead</option>
          {db.leads.map((l) => (
            <option key={l.id} value={l.id} className="text-black">{l.id}</option>
          ))}
        </select>
        <input className={inputCls} placeholder="NACH reference" value={nachRef} onChange={(e) => setNachRef(e.target.value)} />
        <button type="button" className={btnPrimary} disabled={!leadId} onClick={() => addNach({ leadId, reference: nachRef, status: 'SUCCESS' })}>
          Register NACH
        </button>
      </div>
    )
  }

  if (menu.includes('Collection') || menu === 'Tele collection') {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-lime-300">{menu}</h2>
        <select className={selectCls} value={leadId} onChange={(e) => setLeadId(e.target.value)}>
          <option value="">Lead</option>
          {db.leads.map((l) => (
            <option key={l.id} value={l.id} className="text-black">{l.id}</option>
          ))}
        </select>
        <input type="number" className={inputCls} placeholder="Amount" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} />
        <button
          type="button"
          className={btnPrimary}
          disabled={!leadId || syncing}
          onClick={async () => {
            await addCollection({ leadId, amount, dpdBucket: '1-30', outcome: 'Paid' })
            if (lead) {
              await setLeadStatus(lead.id, 'DISBURSED', 'collection')
            }
            notify('ok', 'Collection recorded + LMS')
          }}
        >
          Record collection
        </button>
      </div>
    )
  }

  if (menu === 'Credit deviations') {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-lime-300">Credit deviations</h2>
        <select className={selectCls} value={leadId} onChange={(e) => setLeadId(e.target.value)}>
          <option value="">Lead</option>
          {db.leads.map((l) => (
            <option key={l.id} value={l.id} className="text-black">{l.id}</option>
          ))}
        </select>
        <textarea className={inputCls} rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Deviation reason" />
        <div className="flex gap-2">
          <button type="button" className={btnPrimary} onClick={() => syncCredit('APPROVED')}>Approve</button>
          <button type="button" className="bg-red-500 text-white px-4 py-2 rounded-lg" onClick={() => syncCredit('REJECTED')}>Reject</button>
        </div>
      </div>
    )
  }

  if (menu === 'Hospital payments') {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-lime-300">Hospital payments</h2>
        <select className={selectCls} value={hospitalName} onChange={(e) => setHospitalName(e.target.value)}>
          <option value="">Hospital</option>
          {db.hospitals.map((h) => (
            <option key={h.id} value={h.name} className="text-black">{h.name}</option>
          ))}
        </select>
        <input type="number" className={inputCls} value={paymentAmount || ''} onChange={(e) => setPaymentAmount(Number(e.target.value))} />
        <button
          type="button"
          className={btnPrimary}
          disabled={syncing}
          onClick={async () => {
            try {
              await syncActivityToLMS('payment', { hospitalName, paymentAmount, menu })
              notify('ok', 'Payment synced to LMS clinics')
            } catch (e) {
              notify('err', e instanceof Error ? e.message : 'Failed')
            }
          }}
        >
          Record settlement
        </button>
      </div>
    )
  }

  if (menu.includes('Lender')) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-lime-300">{menu}</h2>
        <select className={selectCls} value={leadId} onChange={(e) => setLeadId(e.target.value)}>
          <option value="">Lead</option>
          {db.leads.map((l) => (
            <option key={l.id} value={l.id} className="text-black">{l.id}</option>
          ))}
        </select>
        <button type="button" className={btnPrimary} disabled={!leadId || syncing} onClick={syncLender}>
          Push to lender + LMS
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-lime-300">{menu}</h2>
      <p className="text-gray-400">Operations pool — use Enquiries tab or convert from My Enquiries.</p>
    </div>
  )
}
