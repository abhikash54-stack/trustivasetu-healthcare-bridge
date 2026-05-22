'use client'

import { useState } from 'react'
import { useLos } from '../LosProvider'
import { btnPrimary, inputCls, selectCls } from '../ui'

export function AttendanceModule() {
  const { db, saveAttendance } = useLos()
  const [form, setForm] = useState({
    associateName: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:00',
    checkOut: '',
    status: 'Present' as 'Present' | 'Absent' | 'Half Day',
    location: '',
  })

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-lime-300">Attendance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
        <input className={inputCls} placeholder="Associate" value={form.associateName} onChange={(e) => setForm({ ...form, associateName: e.target.value })} />
        <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input type="time" className={inputCls} value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
        <input type="time" className={inputCls} placeholder="Check-out" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
        <select className={selectCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Half Day">Half Day</option>
        </select>
        <input className={inputCls} placeholder="Geo / location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <button type="button" className={btnPrimary} onClick={() => saveAttendance(form)}>Mark attendance</button>
      </div>
      <ul className="space-y-2">
        {db.attendance.map((a) => (
          <li key={a.id} className="bg-white/5 p-3 rounded-lg border border-white/10 text-sm">
            {a.date} — {a.associateName}: {a.status} ({a.checkIn}{a.checkOut ? ` - ${a.checkOut}` : ''})
          </li>
        ))}
      </ul>
    </div>
  )
}
