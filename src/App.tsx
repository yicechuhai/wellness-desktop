import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, ClipboardList, CreditCard,
  Repeat, Phone, Package, Sparkles, FileSpreadsheet,
  Menu, X
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import ServiceRecords from './pages/ServiceRecords'
import SaleRecords from './pages/SaleRecords'
import MembershipCards from './pages/MembershipCards'
import FollowupTasks from './pages/FollowupTasks'
import ServiceItems from './pages/ServiceItems'
import AIGenerator from './pages/AIGenerator'
import ExcelImport from './pages/ExcelImport'

const navItems = [
  { path: '/dashboard', label: '驾驶舱', icon: LayoutDashboard },
  { path: '/customers', label: '客户管理', icon: Users },
  { path: '/service', label: '到店服务', icon: ClipboardList },
  { path: '/sales', label: '成交收款', icon: CreditCard },
  { path: '/cards', label: '疗程卡', icon: Repeat },
  { path: '/followup', label: '回访任务', icon: Phone },
  { path: '/items', label: '项目价格', icon: Package },
  { path: '/ai', label: 'AI话术', icon: Sparkles },
  { path: '/excel', label: 'Excel导入', icon: FileSpreadsheet },
]

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  const currentLabel = navItems.find(n => n.path === location.pathname)?.label || '养生馆'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm md:hidden">
        <div className="flex items-center h-12 px-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 shrink-0">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold truncate max-w-[60%]">{currentLabel}</h1>
          <div className="w-8 shrink-0" />
        </div>
      </header>

      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm hidden md:flex items-center h-14 px-4">
        <Menu size={20} className="text-gray-400 mr-3" />
        <h1 className="text-lg font-bold">养生馆经营跟进系统</h1>
        <span className="ml-auto text-sm text-gray-500">{currentLabel}</span>
      </header>

      <aside className="hidden md:block fixed left-0 top-14 bottom-0 w-52 bg-white border-r z-30 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path}
                className={'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ' +
                  (active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50')}>
                <Icon size={18} />{item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {isMobile && sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-12 bottom-0 w-60 bg-white z-50 shadow-xl md:hidden overflow-y-auto">
            <nav className="p-3 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon
                const active = location.pathname === item.path
                return (
                  <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                    className={'flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ' +
                      (active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50')}>
                    <Icon size={18} />{item.label}
                  </Link>
                )
              })}
            </nav>
          </aside>
        </>
      )}

      <main className="pt-12 md:pt-14 md:pl-52 min-h-screen">
        <div className="p-3 md:p-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/service" element={<ServiceRecords />} />
            <Route path="/sales" element={<SaleRecords />} />
            <Route path="/cards" element={<MembershipCards />} />
            <Route path="/followup" element={<FollowupTasks />} />
            <Route path="/items" element={<ServiceItems />} />
            <Route path="/ai" element={<AIGenerator />} />
            <Route path="/excel" element={<ExcelImport />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
