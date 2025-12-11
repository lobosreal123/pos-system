import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  ArrowRight,
  Package
} from 'lucide-react'

const Dashboard = () => {
  const {
    formatMoney,
    getTodaysRevenue,
    getTotalRevenue,
    getUnpaidOrders,
    sales,
    inventory,
    getInventoryValue,
    currency
  } = useData()
  const { currentUser } = useAuth()

  const todayRevenue = getTodaysRevenue()
  const unpaidOrders = getUnpaidOrders()
  const recentSales = sales
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const stats = [
    {
      label: "Today's Revenue",
      value: formatMoney(todayRevenue),
      icon: currency === 'GHS' ? null : DollarSign,
      iconText: currency === 'GHS' ? '₵' : null,
      color: 'bg-green-500',
      change: '+12%'
    },
    {
      label: 'Unpaid Orders',
      value: unpaidOrders.length,
      icon: AlertCircle,
      color: 'bg-red-500',
      change: unpaidOrders.length > 0 ? 'Action needed' : null
    }
  ]

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 backdrop-blur-sm bg-white/40 inline-block px-3 py-1 rounded-lg border border-white/20">Welcome back, {currentUser?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/20 p-4 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 truncate">{stat.label}</p>
                    <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mt-2 truncate">
                      {stat.value}
                    </p>
                    {stat.change && (
                      <p className="text-xs text-gray-500 mt-1 font-medium">{stat.change}</p>
                    )}
                  </div>
                  <div className={`${stat.color} p-2 sm:p-3 rounded-xl shadow-lg backdrop-blur-sm flex-shrink-0 ml-2 flex items-center justify-center`}>
                    {stat.iconText ? (
                      <span className="text-white text-xl sm:text-2xl font-bold">{stat.iconText}</span>
                    ) : (
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Unpaid Orders Alert */}
        {unpaidOrders.length > 0 && (
          <div className="backdrop-blur-xl bg-yellow-100/60 border border-yellow-300/30 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-400/30 rounded-xl backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-yellow-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">
                  {unpaidOrders.length} Unpaid Order{unpaidOrders.length !== 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-yellow-800 font-medium">
                  Total pending: {formatMoney(
                    unpaidOrders.reduce((sum, order) => sum + (order.total - (order.paidAmount || 0)), 0)
                  )}
                </p>
              </div>
              <Link
                to="/sales"
                className="px-4 py-2 backdrop-blur-sm bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 rounded-lg text-yellow-900 hover:text-yellow-950 font-semibold text-sm transition-all hover:scale-105"
              >
                View All
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Transactions */}
          <div className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all">
            <div className="p-4 sm:p-6 border-b border-white/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Recent Transactions</h2>
            </div>
            <div className="p-4 sm:p-6">
              {recentSales.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent transactions</p>
              ) : (
                <div className="space-y-4">
                  {recentSales.map(sale => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-3 sm:p-4 backdrop-blur-sm bg-white/40 hover:bg-white/60 border border-white/20 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {sale.buyerName || 'Walk-in Customer'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(sale.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatMoney(sale.total)}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 text-xs rounded-lg font-medium backdrop-blur-sm border ${
                            sale.status === 'paid'
                              ? 'bg-green-100/60 text-green-800 border-green-300/30'
                              : sale.status === 'partial'
                              ? 'bg-yellow-100/60 text-yellow-800 border-yellow-300/30'
                              : 'bg-red-100/60 text-red-800 border-red-300/30'
                          }`}
                        >
                          {sale.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link
                to="/sales"
                className="mt-4 flex items-center justify-center px-4 py-2 backdrop-blur-sm bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-700 hover:text-blue-800 font-semibold text-sm transition-all hover:scale-105"
              >
                View All Sales <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all">
            <div className="p-4 sm:p-6 border-b border-white/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Quick Actions</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Link
                  to="/pos"
                  className="flex flex-col items-center justify-center p-6 backdrop-blur-sm bg-blue-100/60 hover:bg-blue-200/60 border border-blue-300/30 rounded-xl transition-all hover:scale-105 hover:shadow-lg cursor-pointer group"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="p-3 bg-blue-500/20 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-8 h-8 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-900">New Sale</span>
                </Link>
                <Link
                  to="/sales"
                  className="flex flex-col items-center justify-center p-6 backdrop-blur-sm bg-green-100/60 hover:bg-green-200/60 border border-green-300/30 rounded-xl transition-all hover:scale-105 hover:shadow-lg group"
                >
                  <div className="p-3 bg-green-500/20 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-900">Sales History</span>
                </Link>
                <Link
                  to="/customers"
                  className="flex flex-col items-center justify-center p-6 backdrop-blur-sm bg-purple-100/60 hover:bg-purple-200/60 border border-purple-300/30 rounded-xl transition-all hover:scale-105 hover:shadow-lg group"
                >
                  <div className="p-3 bg-purple-500/20 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                    <Package className="w-8 h-8 text-purple-600" />
                  </div>
                  <span className="font-semibold text-gray-900">Customers</span>
                </Link>
                <Link
                  to="/admin"
                  className="flex flex-col items-center justify-center p-6 backdrop-blur-sm bg-gray-100/60 hover:bg-gray-200/60 border border-gray-300/30 rounded-xl transition-all hover:scale-105 hover:shadow-lg group"
                >
                  <div className="p-3 bg-gray-500/20 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-8 h-8 text-gray-600" />
                  </div>
                  <span className="font-semibold text-gray-900">Admin Panel</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard

