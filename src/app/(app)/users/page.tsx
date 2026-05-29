'use client'

import { useState, useEffect, useCallback } from 'react'

import { formatDate, getRoleColor, getRoleLabel, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface User {
  id: string; email: string; name: string; role: string; isActive: boolean
  phone: string | null; createdAt: string
  regionAssignments: Array<{ region: { id: string; name: string } }>
  clinicAssignments: Array<{ clinic: { id: string; name: string } }>
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [search, setSearch] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    const res = await fetch(`/api/users?${p}`)
    const data = await res.json()
    setUsers(data.data ?? [])
    setLoading(false)
  }, [search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function toggleActive(user: User) {
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !user.isActive }),
    })
    if (res.ok) { toast.success('User updated'); fetchUsers() }
    else toast.error('Failed to update user')
  }

  return (
    <div className="flex flex-col min-h-full">
      

      <div className="flex-1 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <input type="text" placeholder="Search users..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 w-64" />
          <button onClick={() => { setEditUser(null); setShowForm(true) }}
            className="ml-auto px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-gray-800">{editUser ? 'Edit User' : 'Add New User'}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <UserForm initial={editUser} onSuccess={() => { setShowForm(false); fetchUsers() }} onCancel={() => setShowForm(false)} />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Name', 'Email', 'Role', 'Regions', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-semibold text-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{u.name}</p>
                            {u.phone && <p className="text-xs text-gray-500">{u.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', getRoleColor(u.role))}>
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {u.regionAssignments.length > 0
                          ? u.regionAssignments.map(r => r.region.name).join(', ')
                          : <span className="text-gray-400">All</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditUser(u); setShowForm(true) }}
                            className="text-xs text-brand-600 hover:text-brand-800 font-medium">Edit</button>
                          <button onClick={() => toggleActive(u)}
                            className={cn('text-xs font-medium', u.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800')}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="text-center text-sm text-gray-400 py-10">No users found</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function UserForm({ initial, onSuccess, onCancel }: { initial: User | null; onSuccess: () => void; onCancel: () => void }) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState({
    name: initial?.name ?? '', email: initial?.email ?? '',
    password: '', role: initial?.role ?? 'TEAM_MEMBER', phone: initial?.phone ?? '',
  })
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>(initial?.regionAssignments.map(r => r.region.id) ?? [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/regions').then(r => r.json()).then(d => setRegions(d.data ?? []))
  }, [])

  function upd(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, regionIds: selectedRegions, ...(isEdit && !form.password ? { password: undefined } : {}) }
      const url = isEdit ? `/api/users/${initial!.id}` : '/api/users'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Failed') }
      toast.success(isEdit ? 'User updated' : 'User created')
      onSuccess()
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
        <input type="text" value={form.name} onChange={e => upd('name', e.target.value)} required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
      </div>
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email * (@trustivasetu.com)</label>
          <input type="email" value={form.email} onChange={e => upd('email', e.target.value)} required
            placeholder="name@trustivasetu.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
        <input type="password" value={form.password} onChange={e => upd('password', e.target.value)} required={!isEdit} minLength={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
          <select value={form.role} onChange={e => upd('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
            <option value="TEAM_MEMBER">Team Member</option>
            <option value="REGIONAL_MANAGER">Regional Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="tel" value={form.phone} onChange={e => upd('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Assign Regions</label>
        <div className="space-y-1.5 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
          {regions.map(r => (
            <label key={r.id} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedRegions.includes(r.id)}
                onChange={e => setSelectedRegions(prev => e.target.checked ? [...prev, r.id] : prev.filter(x => x !== r.id))}
                className="rounded text-brand-600" />
              <span className="text-sm text-gray-700">{r.name}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">Leave empty = all regions (for Admins)</p>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60">
          {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
          Cancel
        </button>
      </div>
    </form>
  )
}
