'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SIDEBAR_ITEMS, SIDEBAR_SECTIONS } from '@/lib/los/constants'
import { LmsSyncBanner } from '@/components/LmsSyncBanner'
import { useLos } from './LosProvider'

export function LosShell() {
  const router = useRouter()
  const { syncToast } = useLos()
  const [selectedMenu, setSelectedMenu] = useState('User Administration')
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="min-h-screen bg-[#07111f] text-white flex">
      <LmsSyncBanner toast={syncToast} />
      <aside className="w-[250px] bg-[#071827] border-r border-white/10 h-screen overflow-y-auto p-4 text-[12px] shrink-0">
        <h1 className="text-2xl font-bold text-lime-300 leading-tight">
          Trustiva LOS
          <br />
          <span className="text-sm font-normal text-white/70">Healthcare Console</span>
        </h1>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem('trustiva-user')
            router.push('/login')
          }}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl mt-5 font-semibold"
        >
          Logout
        </button>
        <input
          type="text"
          placeholder="Search menu"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mt-6 p-2 rounded bg-white/10 text-white placeholder-gray-400"
        />
        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white/80 mb-3">MAIN MENU</h3>
            <div className="space-y-1">
              {SIDEBAR_ITEMS.filter((i) => i.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSelectedMenu(item)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm ${
                    selectedMenu === item ? 'bg-lime-300 text-black font-semibold' : 'hover:bg-white/10'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          {SIDEBAR_SECTIONS.map((section) => {
            const items = section.items.filter((i) => i.toLowerCase().includes(searchTerm.toLowerCase()))
            if (!items.length) return null
            return (
              <div key={section.title}>
                <h3 className="text-sm font-bold text-white/80 mb-3">{section.title}</h3>
                <div className="space-y-1">
                  {items.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSelectedMenu(item)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm ${
                        selectedMenu === item ? 'bg-lime-300 text-black font-semibold' : 'hover:bg-white/10'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </aside>
      <main className="flex-1 p-5 overflow-y-auto max-h-screen">
        {/* Pass selected menu via clone - use context simpler */}
        <MenuRouter menu={selectedMenu} />
      </main>
    </div>
  )
}

import { ActiveCasesModule } from './modules/ActiveCasesModule'
import { AllLeadsModule } from './modules/AllLeadsModule'
import { AssociateTargetsModule } from './modules/AssociateTargetsModule'
import { AttendanceModule } from './modules/AttendanceModule'
import { CreateLeadModule } from './modules/CreateLeadModule'
import { EmiCalculatorModule } from './modules/EmiCalculatorModule'
import { LeadAllocationModule } from './modules/LeadAllocationModule'
import { MyEnquiriesModule } from './modules/MyEnquiriesModule'
import { MyLeadsModule } from './modules/MyLeadsModule'
import { OpsModule } from './modules/OpsModule'
import { UserAdminModule } from './modules/UserAdminModule'
import { VisitsModule } from './modules/VisitsModule'

function MenuRouter({ menu }: { menu: string }) {
  switch (menu) {
    case 'User Administration':
      return <UserAdminModule />
    case 'Associate Targets':
      return <AssociateTargetsModule />
    case 'Attendance':
      return <AttendanceModule />
    case 'All Leads':
      return <AllLeadsModule />
    case 'Lead Allocation':
      return <LeadAllocationModule />
    case 'Active Cases':
      return <ActiveCasesModule />
    case 'Create Lead':
      return <CreateLeadModule />
    case 'My Leads':
      return <MyLeadsModule />
    case 'My Enquiries':
      return <MyEnquiriesModule />
    case 'Visits':
      return <VisitsModule />
    case 'Finance Estimator':
      return <EmiCalculatorModule />
    case 'Enquiries':
      return <MyEnquiriesModule />
    default:
      if (
        menu.includes('Lender') ||
        menu.includes('Credit') ||
        menu.includes('Collection') ||
        menu === 'Nach registrations' ||
        menu === 'User comments' ||
        menu === 'Hospital payments' ||
        menu === 'Tele collection'
      ) {
        return <OpsModule menu={menu} />
      }
      return <OpsModule menu={menu} />
  }
}
