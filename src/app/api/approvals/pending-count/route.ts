import { NextResponse } from 'next/server'
import { getRequestSession } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getRequestSession()
  if (!session?.user) return NextResponse.json({ count: 0, leaves: 0, expenses: 0, attendance: 0 })

  const role = session.user.role as string
  if (!['SUPER_ADMIN', 'ADMIN', 'REGIONAL_MANAGER'].includes(role)) {
    return NextResponse.json({ count: 0, leaves: 0, expenses: 0, attendance: 0 })
  }

  const [leaves, expenses, attendance] = await Promise.all([
    db.leaveRequest.count({ where: { status: 'PENDING' } }),
    db.expense.count({ where: { status: 'SUBMITTED' } }),
    db.attendance.count({ where: { approvalStatus: 'PENDING' } }),
  ])

  return NextResponse.json({
    count: leaves + expenses + attendance,
    leaves,
    expenses,
    attendance,
  })
}
