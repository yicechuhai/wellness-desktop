import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, ClipboardList, CreditCard,
  Repeat, Phone, Package, Sparkles, FileSpreadsheet,
  Shield, Menu, X, LogOut, Download
} from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import ServiceRecords from './pages/ServiceRecords';
import SaleRecords from './pages/SaleRecords';
import MembershipCards from './pages/MembershipCards';
import FollowupTasks from './pages/FollowupTasks';
import ServiceItems from './pages/ServiceItems';
import AIGenerator from './pages/AIGenerator';
import ExcelImport from './pages/ExcelImport';
import AdminUsers from './pages/AdminUsers';

const allNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'therapist', 'reception'] },
  { path: '/customers', label: 'Customers', icon: Users, roles: ['admin', 'manager', 'therapist', 'reception'] },
  { path: '/service', label: 'Services', icon: ClipboardList, roles: ['admin', 'manager', 'therapist', 'reception'] },
  { path: '/sales', label: 'Sales', icon: CreditCard, roles: ['admin', 'manager', 'reception'] },
  { path: '/cards', label: 'Cards', icon: Repeat, roles: ['admin', 'manager', 'reception'] },
  { path: '/followup', label: 'Follow-ups', icon: Phone, roles: ['admin', 'manager', 'therapist'] },
  { path: '/items', label: 'Items', icon: Package, roles: ['admin', 'manager', 'therapist', 'reception'] },
  { path: '/ai', label: 'AI Assistant', icon: Sparkles, roles: ['admin', 'manager', 'therapist', 'reception'] },
  { path: '/excel', label: 'Import', icon: FileSpreadsheet, roles: ['admin', 'manager'] },
  { path: '/admin/users', label: 'User Mgmt', icon: Shield, roles: ['admin'] },
];

function AppContent() {
  const { user, isLoading, logout, hasRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  if (!user) return <Login />;

  const navItems = allNavItems.filter(item => hasRole(item.roles));
  const currentLabel = navItems.find(n => n.path === location.pathname)?.label || 'Wellness';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm md:hidden">
        <div className="flex items-center h-12 px-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 shrink-0">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold truncate max-w-[60%]">{currentLabel}</h1>
          <div className="ml-auto flex items-center gap-1">
            <span className="text-xs text-gray-400 truncate max-w-[80px]">{user.name}</span>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm hidden md:flex items-center h-14 px-4">
        <Menu size={20} className="text-gray-400 mr-3" />
        <h1 className="text-lg font-bold">Wellness System</h1>
        <span className="ml-4 text-sm text-gray-400">{currentLabel}</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-gray-600">{user.name}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">{user.role}</span>
          <button onClick={logout} className="flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 px-2 py-1 rounded"><LogOut size={14} /> Logout</button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-14 bottom-0 w-52 bg-white border-r z-30 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ' + (active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50')}>
                <Icon size={18} />{item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {isMobile && sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-12 bottom-0 w-60 bg-white z-50 shadow-xl md:hidden overflow-y-auto">
            <nav className="p-3 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={'flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ' + (active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50')}>
                    <Icon size={18} />{item.label}
                  </Link>
                );
              })}
              <div className="border-t pt-2 mt-2">
                <button onClick={logout} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-red-600 w-full"><LogOut size={18} /> Logout ({user.name})</button>
              </div>
            </nav>
          </aside>
        </>
      )}

      {/* Main Content */}
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
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
