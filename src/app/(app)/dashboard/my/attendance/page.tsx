'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTabSession } from '@/contexts/TabSessionContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

type AttendanceRecord = {
  id: string
  date: string
  attendanceType: 'PRESENT' | 'LEAVE' | 'OUTSTATION'
  workingType: 'FULL_DAY' | 'HALF_DAY'
  timeIn: string | null
  locationName: string | null
  outstationCity: string | null
  leaveType: string | null
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
}

const LEAVE_LABELS: Record<string, string> = {
  PL: 'Paid Leave', CL: 'Casual Leave', MEDICAL: 'Medical Leave', UNPLANNED: 'Unplanned Leave',
}

function getStatusLabel(rec: AttendanceRecord) {
  if (rec.attendanceType === 'PRESENT') return rec.workingType === 'HALF_DAY' ? 'Half Day' : 'Present'
  if (rec.attendanceType === 'OUTSTATION') return `Outstation${rec.outstationCity ? ` — ${rec.outstationCity}` : ''}`
  return LEAVE_LABELS[rec.leaveType ?? ''] ?? 'Leave'
}

function getStatusColor(rec: AttendanceRecord) {
  if (rec.approvalStatus === 'REJECTED') return 'bg-red-100 text-red-700'
  if (rec.attendanceType === 'PRESENT') {
    return rec.workingType === 'HALF_DAY' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
  }
  if (rec.attendanceType === 'OUTSTATION') return 'bg-orange-100 text-orange-700'
  return 'bg-blue-100 text-blue-700'
}

export default function MyAttendancePage() {
  const { user: session } = useTabSession()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showPunch, setShowPunch] = useState(false)
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')
  const monthKey = format(now, 'yyyy-MM')

  const [punch, setPunch] = useState({
    date: today,
    timeIn: format(now, 'HH:mm'),
    workingType: 'FULL_DAY' as 'FULL_DAY' | 'HALF_DAY',
    isOutstation: false,
    outstationCity: '',
    latitude: null as number | null,
    longitude: null as number | null,
    locationName: '',
    notes: '',
  })
  const [locating, setLocating] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/hr/attendance?month=${monthKey}`)
    const data = await res.json()
    setRecords(data.data ?? [])
    setLoading(false)
  }, [monthKey])

  useEffect(() => { fetchData() }, [fetchData])

  const todayRecord = records.find(r => r.date.split('T')[0] === today)
  const recent = [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)

  function captureGPS() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords
        setPunch(p => ({ ...p, latitude, longitude }))
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const d = await r.json()
          const city = d.address?.city || d.address?.town || d.address?.village || `${latitude.toFixed(3)},${longitude.toFixed(3)}`
          setPunch(p => ({ ...p, locationName: city }))
        } catch { /* ignore */ }
        setLocating(false)
      },
      () => { toast.error('Location access denied'); setLocating(false) }
    )
  }

  async function submitPunch() {
    setSubmitting(true)
    const res = await fetch('/api/hr/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: punch.date,
        attendanceType: punch.isOutstation ? 'OUTSTATION' : 'PRESENT',
        leaveType: null,
        workingType: punch.isOutstation ? 'FULL_DAY' : punch.workingType,
        outstationCity: punch.isOutstation ? (punch.outstationCity || null) : null,
        timeIn: punch.timeIn || null,
        latitude: punch.latitude,
        longitude: punch.longitude,
        locationName: punch.locationName || null,
        notes: punch.notes || null,
      }),
    })
    if (res.ok) {
      toast.success('Attendance marked!')
      setShowPunch(false)
      fetchData()
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Failed to mark attendance')
    }
    setSubmitting(false)
  }

  void session

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-sm text-gray-500">{format(now, 'EEEE, dd MMMM yyyy')}</p>
      </div>

      {/* Today's status banner */}
      {!todayRecord ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-amber-800 text-sm">Not marked today</p>
            <p className="text-xs text-amber-600 mt-0.5">Mark your attendance before end of day</p>
          </div>
          <button
            onClick={() => {
              setPunch(p => ({ ...p, date: today, timeIn: format(new Date(), 'HH:mm'), isOutstation: false, outstationCity: '', locationName: '', latitude: null, longitude: null, notes: '' }))
              setShowPunch(true)
            }}
            className="flex-shrink-0 px-4 py-2 bg-brand-600 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition"
          >
            Punch Now
          </button>
        </div>
      ) : (
        <div className={cn('rounded-xl border p-4 flex items-center justify-between gap-3',
          todayRecord.approvalStatus === 'APPROVED' ? 'bg-green-50 border-green-200' :
          todayRecord.approvalStatus === 'REJECTED' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
        )}>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Today: {getStatusLabel(todayRecord)}</p>
            {todayRecord.timeIn && <p className="text-xs text-gray-500 mt-0.5">Checked in at {todayRecord.timeIn}</p>}
            {todayRecord.locationName && <p className="text-xs text-gray-500">📍 {todayRecord.locationName}</p>}
          </div>
          <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0',
            todayRecord.approvalStatus === 'APPROVED' ? 'bg-green-200 text-green-800' :
            todayRecord.approvalStatus === 'REJECTED' ? 'bg-red-200 text-red-800' : 'bg-amber-100 text-amber-700'
          )}>
            {todayRecord.approvalStatus}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setPunch(p => ({ ...p, date: today, timeIn: format(new Date(), 'HH:mm'), isOutstation: false, outstationCity: '', locationName: '', latitude: null, longitude: null, notes: '' }))
            setShowPunch(true)
          }}
          className="flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Punch Attendance
        </button>
        <a href="/hr/attendance"
          className="flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Full Calendar
        </a>
      </div>

      {/* Recent records */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-700">This Month — Recent Records</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600" />
          </div>
        ) : recent.length === 0 ? (
          <p className="text-center py-8 text-sm text-gray-400">No records this month</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recent.map(rec => (
              <div key={rec.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{format(new Date(rec.date), 'EEE, dd MMM')}</p>
                  <p className="text-xs text-gray-500">
                    {rec.timeIn ? `In: ${rec.timeIn}` : ''}
                    {rec.locationName ? ` · 📍 ${rec.locationName}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getStatusColor(rec))}>
                    {getStatusLabel(rec)}
                  </span>
                  <span className={cn('text-[11px] font-bold',
                    rec.approvalStatus === 'APPROVED' ? 'text-green-600' :
                    rec.approvalStatus === 'REJECTED' ? 'text-red-500' : 'text-amber-500'
                  )}>
                    {rec.approvalStatus === 'APPROVED' ? '✓' : rec.approvalStatus === 'REJECTED' ? '✗' : '·'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Punch Modal */}
      {showPunch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPunch(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-5 pt-5 pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Punch Attendance</h2>
              <button onClick={() => setShowPunch(false)} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 text-lg">✕</button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date</label>
                <input type="date" value={punch.date} max={today}
                  onChange={e => setPunch(p => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Time In</label>
                <input type="time" value={punch.timeIn}
                  onChange={e => setPunch(p => ({ ...p, timeIn: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['FULL_DAY', 'HALF_DAY'] as const).map(w => (
                  <button key={w} type="button"
                    disabled={punch.isOutstation}
                    onClick={() => setPunch(p => ({ ...p, workingType: w }))}
                    className={cn('py-2.5 text-sm font-semibold rounded-xl border-2 transition',
                      punch.workingType === w && !punch.isOutstation
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300',
                      punch.isOutstation && 'opacity-40 cursor-not-allowed',
                    )}>
                    {w === 'FULL_DAY' ? '☀ Full Day' : '🌤 Half Day'}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Outstation / Travel</p>
                  <p className="text-xs text-gray-400">Working from outside office</p>
                </div>
                <button type="button"
                  onClick={() => setPunch(p => ({ ...p, isOutstation: !p.isOutstation, workingType: 'FULL_DAY' }))}
                  className={cn('relative w-11 h-6 rounded-full transition-colors', punch.isOutstation ? 'bg-orange-500' : 'bg-gray-200')}>
                  <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', punch.isOutstation && 'translate-x-5')} />
                </button>
              </div>
              {punch.isOutstation && (
                <input value={punch.outstationCity}
                  onChange={e => setPunch(p => ({ ...p, outstationCity: e.target.value }))}
                  placeholder="City / Destination *"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              )}
              <button type="button" onClick={captureGPS} disabled={locating}
                className={cn('w-full px-3 py-2.5 border-2 border-dashed rounded-lg text-sm transition flex items-center gap-2 justify-center',
                  punch.locationName ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300',
                )}>
                📍 {locating ? 'Getting location...' : punch.locationName ? punch.locationName : 'Capture GPS Location'}
              </button>
              {punch.locationName && (
                <button type="button" onClick={() => setPunch(p => ({ ...p, locationName: '', latitude: null, longitude: null }))}
                  className="text-xs text-gray-400 hover:text-gray-600 -mt-2">Clear location</button>
              )}
              <textarea value={punch.notes} onChange={e => setPunch(p => ({ ...p, notes: e.target.value }))} rows={2}
                placeholder="Notes (optional)"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
            </div>

            <div className="px-5 pb-5 flex gap-3">
              <button onClick={submitPunch} disabled={submitting || (punch.isOutstation && !punch.outstationCity)}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Mark Attendance'}
              </button>
              <button onClick={() => setShowPunch(false)}
                className="px-4 py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
