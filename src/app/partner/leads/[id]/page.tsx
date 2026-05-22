'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { STATUS_LABELS } from '@/lib/los/constants'
import { LosProvider, useLos } from '@/components/los/LosProvider'
import { StatusBadge, btnPrimary, inputCls } from '@/components/los/ui'

function LeadDetailInner() {
  const { id } = useParams()
  const { db, updateLead, setLeadStatus, addComment, session } = useLos()
  const [tab, setTab] = useState('personal')
  const [comment, setComment] = useState('')
  const lead = db.leads.find((l) => l.id === id)

  if (!lead) {
    return (
      <div className="min-h-screen bg-[#07111f] text-white p-8">
        <Link href="/partner" className="text-blue-400">← Console</Link>
        <p className="mt-4">Lead not found</p>
      </div>
    )
  }

  const tabs = ['personal', 'address', 'employment', 'co-applicant', 'documents', 'timeline', 'disbursal']

  return (
    <div className="min-h-screen bg-[#07111f] text-white p-6">
      <Link href="/partner" className="text-blue-400 text-sm">← All Leads</Link>
      <div className="flex flex-wrap justify-between items-start gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{lead.applicantName}</h1>
          <p className="text-gray-400 font-mono text-sm">{lead.id}</p>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <div className="sticky top-0 bg-[#07111f] z-10 flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded capitalize text-sm ${tab === t ? 'bg-lime-300 text-black' : 'bg-white/10'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'personal' && (
        <div className="grid md:grid-cols-2 gap-4 bg-white/5 p-6 rounded-xl border border-white/10">
          <p>Mobile: {lead.mobileNumber}</p>
          <p>Hospital: {lead.hospitalName}</p>
          <p>Estimate: ₹{lead.estimateAmount.toLocaleString()}</p>
          <p>Eligibility: {lead.eligibility}</p>
          <p>Enquiry: {lead.form.enquiryType}</p>
          <p>Treatment: {lead.form.treatmentName}</p>
        </div>
      )}

      {tab === 'timeline' && (
        <ul className="space-y-2">
          {lead.auditLog.map((a, i) => (
            <li key={i} className="bg-white/5 p-3 rounded text-sm border border-white/10">
              <span className="text-lime-300">{a.action}</span> — {new Date(a.at).toLocaleString()} by {a.by}
              {a.note && <p className="text-gray-400">{a.note}</p>}
            </li>
          ))}
        </ul>
      )}

      {tab === 'disbursal' && (
        <div className="space-y-4 bg-white/5 p-6 rounded-xl border border-white/10">
          <input
            type="number"
            className={inputCls}
            placeholder="Approved amount"
            defaultValue={lead.approvedAmount}
            onBlur={(e) =>
              updateLead({ ...lead, approvedAmount: Number(e.target.value) }, true)
            }
          />
          <button type="button" className={btnPrimary} onClick={() => setLeadStatus(lead.id, 'DISBURSED', session?.email ?? 'admin')}>
            Mark disbursed → LMS
          </button>
        </div>
      )}

      {(tab === 'address' || tab === 'employment' || tab === 'co-applicant' || tab === 'documents') && (
        <p className="text-gray-400">Complete via Create Lead wizard — data stored on lead record.</p>
      )}

      <div className="mt-8 bg-white/5 p-4 rounded-xl border border-white/10">
        <h3 className="font-semibold mb-2">Internal comment</h3>
        <textarea className={inputCls} rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
        <button
          type="button"
          className={btnPrimary + ' mt-2'}
          onClick={() => addComment({ leadId: lead.id, text: comment, visibility: 'internal', by: session?.email ?? 'user' })}
        >
          Add comment
        </button>
      </div>

      <p className="mt-4 text-xs text-gray-500">Status: {STATUS_LABELS[lead.status]}</p>
    </div>
  )
}

export default function LeadDetailPage() {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    if (localStorage.getItem('trustiva-user')) setOk(true)
  }, [])
  if (!ok) return null
  return (
    <LosProvider>
      <LeadDetailInner />
    </LosProvider>
  )
}
