'use client'

import { useState } from 'react'
import { useLos } from '../LosProvider'
import { btnPrimary, inputCls, selectCls } from '../ui'
import type { EnquiryStatus } from '@/lib/los/types'

export function MyEnquiriesModule() {
  const { db, createEnquiry, updateEnquiry, createLead, session, notify } = useLos()
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    patientName: '',
    type: 'IPD',
    hospitalName: '',
  })

  async function handleCreate() {
    if (!form.mobile || !form.patientName) return
    await createEnquiry({
      name: form.name || form.patientName,
      mobile: form.mobile,
      patientName: form.patientName,
      type: form.type,
      hospitalName: form.hospitalName || db.hospitals[0]?.name || '',
      status: 'OPEN',
    })
    setForm({ name: '', mobile: '', patientName: '', type: 'IPD', hospitalName: '' })
    notify('ok', 'Enquiry created')
  }

  async function convertToLead(enquiryId: string) {
    const e = db.enquiries.find((x) => x.id === enquiryId)
    if (!e) return
    const lead = await createLead(
      {
        enquiryType: e.type,
        mobileNumber: e.mobile,
        motherName: 'Guardian',
        patientName: e.patientName,
        customerType: 'Cash',
        bedType: 'General Ward',
        admissionDate: new Date().toISOString().split('T')[0],
        dischargeDate: '',
        consultationDate: '',
        email: '',
        hospitalName: e.hospitalName,
        treatmentName: 'General',
        medicalEstimate: '100000',
        financingRequired: 'Yes',
        callbackDate: '',
        remarks: e.remarks ?? '',
      },
      session?.email ?? 'system',
      { status: 'OTP_VERIFIED' }
    )
    await updateEnquiry({ ...e, status: 'CONVERTED', leadId: lead.id })
    notify('ok', `Converted to ${lead.id}`)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-lime-300">My Enquiries</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
        <input className={inputCls} placeholder="Enquiry name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={inputCls} placeholder="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
        <input className={inputCls} placeholder="Patient" value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} />
        <select className={selectCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="IPD">IPD</option>
          <option value="OPD">OPD</option>
        </select>
        <select className={selectCls} value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}>
          <option value="">Hospital</option>
          {db.hospitals.map((h) => (
            <option key={h.id} value={h.name} className="text-black">{h.name}</option>
          ))}
        </select>
        <button type="button" className={btnPrimary} onClick={handleCreate}>Add Enquiry</button>
      </div>

      <table className="w-full text-sm border border-white/10 rounded-xl overflow-hidden">
        <thead className="bg-white/10">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Mobile</th>
            <th className="p-3 text-left">Patient</th>
            <th className="p-3 text-left">Type</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {db.enquiries.map((e) => (
            <tr key={e.id} className="border-t border-white/10">
              <td className="p-3">{e.name}</td>
              <td className="p-3">{e.mobile}</td>
              <td className="p-3">{e.patientName}</td>
              <td className="p-3">{e.type}</td>
              <td className="p-3">
                <select
                  className={selectCls}
                  value={e.status}
                  onChange={(ev) => updateEnquiry({ ...e, status: ev.target.value as EnquiryStatus })}
                >
                  {(['OPEN', 'CONTACTED', 'INTERESTED', 'CONVERTED', 'DROPPED'] as const).map((s) => (
                    <option key={s} value={s} className="text-black">{s}</option>
                  ))}
                </select>
              </td>
              <td className="p-3">
                {e.status !== 'CONVERTED' && (
                  <button type="button" className="text-lime-300 underline" onClick={() => convertToLead(e.id)}>
                    Convert to Lead
                  </button>
                )}
                {e.leadId && <span className="text-xs text-gray-400 ml-2">{e.leadId}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
