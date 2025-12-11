import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import {
  LayoutDashboard,
  ShoppingCart,
  History,
  Users,
  Settings,
  LogOut,
  Store,
  Menu,
  X
} from 'lucide-react'

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const { stores, currentStoreId, changeStore, formatMoney, getTodaysRevenue } = useData()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const currentStore = stores.find(s => s.id === currentStoreId)

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/pos', label: 'POS', icon: ShoppingCart },
    { path: '/sales', label: 'Sales History', icon: History },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/admin', label: 'Admin', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Top Navigation */}
      <nav className="relative backdrop-blur-xl bg-white/70 shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/60 transition-all"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">APPLE BAZAAR</h1>
              <div className="hidden sm:flex items-center space-x-2">
                <Store className="w-4 h-4 text-purple-600" />
                <select
                  value={currentStoreId || ''}
                  onChange={(e) => changeStore(e.target.value)}
                  className="backdrop-blur-sm bg-white/60 border border-white/30 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:bg-white/80"
                >
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:block text-right backdrop-blur-sm bg-white/40 rounded-lg px-3 py-1.5 border border-white/20">
                <div className="text-sm font-medium text-gray-700">{currentUser?.name}</div>
                <div className="text-xs text-gray-500">{currentUser?.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-sm font-medium backdrop-blur-sm bg-white/60 hover:bg-white/80 border border-white/30 rounded-lg text-gray-700 transition-all hover:shadow-lg hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
          {/* Mobile store selector */}
          <div className="sm:hidden pb-3">
            <div className="flex items-center space-x-2">
              <Store className="w-4 h-4 text-purple-600" />
              <select
                value={currentStoreId || ''}
                onChange={(e) => changeStore(e.target.value)}
                className="flex-1 backdrop-blur-sm bg-white/60 border border-white/30 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex relative">
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          w-64 backdrop-blur-xl bg-white/95 lg:bg-white/50 shadow-xl border-r border-white/20
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          pt-16 lg:pt-0 lg:min-h-[calc(100vh-4rem)]
        `}>
          <nav className="p-4 space-y-2">
            {/* Mobile user info */}
            <div className="sm:hidden mb-4 p-3 backdrop-blur-sm bg-white/40 rounded-lg border border-white/20">
              <div className="text-sm font-medium text-gray-700">{currentUser?.name}</div>
              <div className="text-xs text-gray-500">{currentUser?.role}</div>
            </div>
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/50 scale-105'
                      : 'text-gray-700 backdrop-blur-sm bg-white/40 hover:bg-white/60 border border-white/20 hover:shadow-md hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 relative w-full lg:w-auto">
          {children}
        </main>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default Layout

