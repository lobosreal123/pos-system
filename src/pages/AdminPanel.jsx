import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import {
  Package,
  Users,
  Settings as SettingsIcon,
  BarChart3,
  Store,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  X
} from 'lucide-react'
import {
  IPHONE_MODELS,
  IPHONE_COLORS,
  IPHONE_STORAGE,
  CONDITIONS
} from '../utils/iphoneModels'
import { format } from 'date-fns'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { generateTestInventory, generateTestSales, generateTestCustomers } from '../utils/testData'

const AdminPanel = () => {
  const { currentUser } = useAuth()
  const {
    inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    sales,
    customers,
    addCustomer,
    formatMoney,
    currency,
    settings,
    saveSettings,
    stores,
    addStore,
    updateStore,
    changeStore,
    currentStoreId,
    getInventoryValue,
    getTodaysRevenue,
    getTotalRevenue
  } = useData()

  const [activeTab, setActiveTab] = useState('inventory')
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showStoreModal, setShowStoreModal] = useState(false)
  const [editingStore, setEditingStore] = useState(null)
  const [adminPassword, setAdminPassword] = useState('')
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)

  // Check admin access
  if (currentUser?.role !== 'admin') {
    if (!showPasswordPrompt) {
      return (
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
              <button
                onClick={() => setShowPasswordPrompt(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Enter Admin Password
              </button>
            </div>
          </div>
        </Layout>
      )
    }

    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md w-full p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && adminPassword === settings.adminPassword) {
                  setShowPasswordPrompt(false)
                }
              }}
            />
            <button
              onClick={() => {
                if (adminPassword === settings.adminPassword) {
                  setShowPasswordPrompt(false)
                } else {
                  alert('Invalid password')
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Access Admin Panel
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const tabs = [
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'accessories', label: 'Accessories', icon: Package },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'stores', label: 'Stores', icon: Store },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ]

  // Analytics data
  const getDailyRevenue = () => {
    const dailyData = {}
    sales
      .filter(s => s.status === 'paid')
      .forEach(sale => {
        const date = sale.createdAt.split('T')[0]
        dailyData[date] = (dailyData[date] || 0) + sale.total
      })
    return Object.entries(dailyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
      .map(([date, revenue]) => ({
        date: format(new Date(date), 'MMM d'),
        revenue
      }))
  }

  const getTopSellingDevices = () => {
    const deviceCounts = {}
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const key = item.name
        deviceCounts[key] = (deviceCounts[key] || 0) + item.quantity
      })
    })
    return Object.entries(deviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, quantity]) => ({ name, quantity }))
  }

  const getTopCashiers = () => {
    const cashierStats = {}
    sales
      .filter(s => s.status === 'paid')
      .forEach(sale => {
        const cashier = sale.cashierName
        if (!cashierStats[cashier]) {
          cashierStats[cashier] = { sales: 0, revenue: 0 }
        }
        cashierStats[cashier].sales += 1
        cashierStats[cashier].revenue += sale.total
      })
    return Object.entries(cashierStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }

  const exportInventory = () => {
    const headers = ['ID', 'Name', 'Model', 'Color', 'Storage', 'Condition', 'Price', 'Stock', 'Category']
    const rows = inventory.map(item => [
      item.id,
      item.name || '',
      item.model || '',
      item.color || '',
      item.storage || '',
      item.condition || '',
      item.price || '',
      item.stock || '',
      item.category || ''
    ])
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-1">Manage inventory, users, and system settings</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <InventoryTab
                inventory={inventory.filter(i => !i.isAccessory)}
                addInventoryItem={addInventoryItem}
                updateInventoryItem={updateInventoryItem}
                deleteInventoryItem={deleteInventoryItem}
                formatMoney={formatMoney}
                getInventoryValue={getInventoryValue}
                exportInventory={exportInventory}
                showModal={showInventoryModal}
                setShowModal={setShowInventoryModal}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
              />
            )}

            {/* Accessories Tab */}
            {activeTab === 'accessories' && (
              <InventoryTab
                inventory={inventory.filter(i => i.isAccessory)}
                addInventoryItem={addInventoryItem}
                updateInventoryItem={updateInventoryItem}
                deleteInventoryItem={deleteInventoryItem}
                formatMoney={formatMoney}
                getInventoryValue={getInventoryValue}
                exportInventory={exportInventory}
                showModal={showInventoryModal}
                setShowModal={setShowInventoryModal}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
                isAccessories={true}
              />
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <UsersTab
                showModal={showUserModal}
                setShowModal={setShowUserModal}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
              />
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <AnalyticsTab
                dailyRevenue={getDailyRevenue()}
                topSellingDevices={getTopSellingDevices()}
                topCashiers={getTopCashiers()}
                formatMoney={formatMoney}
                sales={sales}
                inventory={inventory}
                getTodaysRevenue={getTodaysRevenue}
                getTotalRevenue={getTotalRevenue}
                getInventoryValue={getInventoryValue}
              />
            )}

            {/* Stores Tab */}
            {activeTab === 'stores' && (
              <StoresTab
                stores={stores}
                currentStoreId={currentStoreId}
                addStore={addStore}
                updateStore={updateStore}
                changeStore={changeStore}
                showModal={showStoreModal}
                setShowModal={setShowStoreModal}
                editingStore={editingStore}
                setEditingStore={setEditingStore}
              />
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <SettingsTab
                settings={settings || {}}
                saveSettings={saveSettings}
                currency={currency || 'USD'}
                exportInventory={exportInventory}
                addInventoryItem={addInventoryItem}
                addCustomer={addCustomer}
                sales={sales || []}
                inventory={inventory || []}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

// Inventory Tab Component
const InventoryTab = ({
  inventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  formatMoney,
  getInventoryValue,
  exportInventory,
  showModal,
  setShowModal,
  editingItem,
  setEditingItem,
  isAccessories = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    color: '',
    storage: '',
    condition: '',
    price: '',
    stock: '',
    category: isAccessories ? 'Accessory' : 'Device',
    isAccessory: isAccessories
  })

  const handleEdit = (item) => {
    setFormData({
      name: item.name || '',
      model: item.model || '',
      color: item.color || '',
      storage: item.storage || '',
      condition: item.condition || '',
      price: item.price || '',
      stock: item.stock || '',
      category: item.category || (isAccessories ? 'Accessory' : 'Device'),
      isAccessory: item.isAccessory || isAccessories,
      barcode: item.barcode || ''
    })
    setEditingItem(item)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formData.name && !formData.model) {
      alert('Please provide at least a name or model')
      return
    }

    const itemData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock) || 0
    }

    if (editingItem) {
      updateInventoryItem(editingItem.id, itemData)
    } else {
      addInventoryItem(itemData)
    }

    setFormData({
      name: '',
      model: '',
      color: '',
      storage: '',
      condition: '',
      price: '',
      stock: '',
      category: isAccessories ? 'Accessory' : 'Device',
      isAccessory: isAccessories
    })
    setEditingItem(null)
    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteInventoryItem(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            {isAccessories ? 'Accessories' : 'Inventory'} Management
          </h2>
          <p className="text-sm text-gray-600">
            Total Value: {formatMoney(getInventoryValue())} • {inventory.length} items
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportInventory}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingItem(null)
              setFormData({
                name: '',
                model: '',
                color: '',
                storage: '',
                condition: '',
                price: '',
                stock: '',
                category: isAccessories ? 'Accessory' : 'Device',
                isAccessory: isAccessories,
                barcode: ''
              })
              setShowModal(true)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name/Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{item.name || item.model}</div>
                  <div className="text-sm text-gray-500">{item.category}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {[item.color, item.storage, item.condition].filter(Boolean).join(' • ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {formatMoney(item.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${
                    item.stock > 10 ? 'bg-green-100 text-green-800' :
                    item.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.stock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {inventory.length === 0 && (
          <div className="text-center py-8 text-gray-500">No items found</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <InventoryModal
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
          onCancel={() => {
            setShowModal(false)
            setEditingItem(null)
          }}
          isAccessories={isAccessories}
        />
      )}
    </div>
  )
}

// Inventory Modal Component
const InventoryModal = ({ formData, setFormData, onSave, onCancel, isAccessories }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">
              {formData.id ? 'Edit' : 'Add'} {isAccessories ? 'Accessory' : 'Device'}
            </h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            {!isAccessories && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model (iPhone)
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="">Select Model</option>
                  {IPHONE_MODELS.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                  <option value="custom">Custom</option>
                </select>
              </div>
            )}

            {!isAccessories && formData.model && formData.model !== 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">Select Color</option>
                    {IPHONE_COLORS.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Storage
                  </label>
                  <select
                    value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">Select Storage</option>
                    {IPHONE_STORAGE.map(storage => (
                      <option key={storage} value={storage}>{storage}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">Select Condition</option>
                    {CONDITIONS.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                min="0"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="e.g., iPhone, Accessory, Custom"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barcode (optional)
              </label>
              <input
                type="text"
                value={formData.barcode || ''}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="Enter barcode for scanning"
              />
              <p className="text-xs text-gray-500 mt-1">
                Scan or enter barcode for quick item lookup
              </p>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Users Tab Component
const UsersTab = ({ showModal, setShowModal, editingUser, setEditingUser }) => {
  const { users, addUser, updateUser, deleteUser } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: ''
  })

  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      password: '',
      name: user.name
    })
    setEditingUser(user)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formData.username || !formData.name) {
      alert('Please fill in all required fields')
      return
    }

    if (editingUser) {
      const updates = { name: formData.name }
      if (formData.password) {
        updates.password = formData.password
      }
      updateUser(editingUser.id, updates)
    } else {
      if (!formData.password) {
        alert('Password is required for new users')
        return
      }
      const result = addUser(formData)
      if (!result.success) {
        alert(result.error)
        return
      }
    }

    setFormData({ username: '', password: '', name: '' })
    setEditingUser(null)
    setShowModal(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-sm text-gray-600">{users.length} / 20 users</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null)
            setFormData({ username: '', password: '', name: '' })
            setShowModal(true)
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">
                {editingUser ? 'Edit' : 'Add'} User
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  disabled={!!editingUser}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {!editingUser && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder={editingUser ? 'Leave blank to keep current' : ''}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Analytics Tab Component
const AnalyticsTab = ({
  dailyRevenue,
  topSellingDevices,
  topCashiers,
  formatMoney,
  sales,
  inventory,
  getTodaysRevenue,
  getTotalRevenue,
  getInventoryValue
}) => {
  // Calculate payment status data for the pie chart
  const paidAmount = sales
    .filter(sale => sale.status === 'paid')
    .reduce((sum, sale) => sum + sale.total, 0)

  const unpaidAmount = sales
    .filter(sale => sale.status === 'unpaid')
    .reduce((sum, sale) => sum + sale.total, 0)

  // Unsold = Total available inventory value
  const unsoldAmount = getInventoryValue()

  const totalAmount = paidAmount + unpaidAmount + unsoldAmount

  // Pie chart data
  const paymentData = [
    {
      name: 'Paid',
      value: paidAmount,
      percentage: totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(1) : 0,
      color: '#10b981' // green
    },
    {
      name: 'Unpaid',
      value: unpaidAmount,
      percentage: totalAmount > 0 ? ((unpaidAmount / totalAmount) * 100).toFixed(1) : 0,
      color: '#ef4444' // red
    },
    {
      name: 'Unsold',
      value: unsoldAmount,
      percentage: totalAmount > 0 ? ((unsoldAmount / totalAmount) * 100).toFixed(1) : 0,
      color: '#3b82f6' // blue
    }
  ].filter(item => item.value > 0) // Only show non-zero values

  const COLORS = paymentData.map(item => item.color)

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="backdrop-blur-xl bg-white/90 rounded-lg shadow-lg border border-white/20 p-3">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{formatMoney(data.value)}</p>
          <p className="text-xs text-gray-500">{data.payload.percentage}%</p>
        </div>
      )
    }
    return null
  }

  // Custom label for pie chart
  const renderLabel = (entry) => {
    return `${entry.percentage}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div>
          <h2 className="text-xl font-semibold">Sales Analytics</h2>
        </div>
        
        {/* Payment Status Pie Chart */}
        {paymentData.length > 0 && totalAmount > 0 ? (
          <div className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/20 p-3 w-full lg:w-72">
            <h3 className="text-xs font-semibold text-gray-700 mb-2 text-center">Payment Status</h3>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={50}
                  innerRadius={25}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }}
                  iconType="circle"
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontSize: '10px', fontWeight: '500' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1 text-xs">
              {paymentData.map((item, index) => (
                <div key={index} className="flex justify-between items-center gap-2">
                  <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                    <div 
                      className="w-2.5 h-2.5 rounded-full border border-white/30 flex-shrink-0" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-600 font-medium text-xs truncate">{item.name}:</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-semibold text-gray-900 text-xs whitespace-nowrap">{formatMoney(item.value)}</span>
                    <span className="text-gray-500 ml-1 text-xs whitespace-nowrap">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/20 p-3 w-full lg:w-72">
            <h3 className="text-xs font-semibold text-gray-700 mb-2 text-center">Payment Status</h3>
            <div className="text-center py-6 text-gray-500 text-xs">
              No payment data available
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-blue-100/60 border border-blue-300/30 p-4 rounded-xl shadow-lg">
          <div className="text-xs sm:text-sm font-medium text-gray-600 truncate">Today's Revenue</div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate mt-1">{formatMoney(getTodaysRevenue())}</div>
        </div>
        <div className="backdrop-blur-xl bg-green-100/60 border border-green-300/30 p-4 rounded-xl shadow-lg">
          <div className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Revenue</div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate mt-1">{formatMoney(getTotalRevenue())}</div>
        </div>
        <div className="backdrop-blur-xl bg-purple-100/60 border border-purple-300/30 p-4 rounded-xl shadow-lg">
          <div className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Sales</div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate mt-1">{sales.filter(s => s.status === 'paid').length}</div>
        </div>
        <div className="backdrop-blur-xl bg-yellow-100/60 border border-yellow-300/30 p-4 rounded-xl shadow-lg">
          <div className="text-xs sm:text-sm font-medium text-gray-600 truncate">Inventory Value</div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate mt-1">{formatMoney(getInventoryValue())}</div>
        </div>
      </div>

      {/* Daily Revenue Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Daily Revenue (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => formatMoney(value)} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Devices */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Selling Devices</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSellingDevices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Cashiers */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Performing Cashiers</h3>
          <div className="space-y-3">
            {topCashiers.map((cashier, idx) => (
              <div key={idx} className="border border-gray-200 rounded p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{cashier.name}</div>
                    <div className="text-sm text-gray-600">{cashier.sales} sales</div>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {formatMoney(cashier.revenue)}
                  </div>
                </div>
              </div>
            ))}
            {topCashiers.length === 0 && (
              <div className="text-center py-8 text-gray-500">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Stores Tab Component
const StoresTab = ({
  stores,
  currentStoreId,
  addStore,
  updateStore,
  changeStore,
  showModal,
  setShowModal,
  editingStore,
  setEditingStore
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  })

  const handleEdit = (store) => {
    setFormData({
      name: store.name,
      address: store.address || ''
    })
    setEditingStore(store)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formData.name) {
      alert('Please provide a store name')
      return
    }

    if (editingStore) {
      updateStore(editingStore.id, formData)
    } else {
      addStore(formData)
    }

    setFormData({ name: '', address: '' })
    setEditingStore(null)
    setShowModal(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Store Management</h2>
          <p className="text-sm text-gray-600">{stores.length} stores</p>
        </div>
        <button
          onClick={() => {
            setEditingStore(null)
            setFormData({ name: '', address: '' })
            setShowModal(true)
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Store</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map(store => (
          <div
            key={store.id}
            className={`border rounded-lg p-4 ${
              store.id === currentStoreId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold text-lg">{store.name}</div>
                {store.id === currentStoreId && (
                  <span className="text-xs text-blue-600 font-medium">Current Store</span>
                )}
              </div>
              <button
                onClick={() => handleEdit(store)}
                className="text-blue-600 hover:text-blue-900"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            {store.address && (
              <div className="text-sm text-gray-600">{store.address}</div>
            )}
            {store.id !== currentStoreId && (
              <button
                onClick={() => changeStore(store.id)}
                className="mt-3 w-full px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Switch to this store
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Store Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">
                {editingStore ? 'Edit' : 'Add'} Store
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows="3"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Settings Tab Component
const SettingsTab = ({ settings = {}, saveSettings, currency, exportInventory, addInventoryItem, addCustomer, sales = [], inventory = [] }) => {
  const { users } = useAuth()
  const { addSale } = useData()
  
  // Safe defaults
  const safeSettings = settings || {}
  const safeCurrency = currency || safeSettings?.currency || 'USD'
  
  // Initialize formData with safe defaults
  const [formData, setFormData] = useState({
    currency: safeCurrency,
    adminPassword: safeSettings?.adminPassword || 'admin123',
    receiptPaperWidth: safeSettings?.receiptPaperWidth || '80mm',
    receiptShowQRCode: safeSettings?.receiptShowQRCode !== false,
    storePhone: safeSettings?.storePhone || '',
    storeEmail: safeSettings?.storeEmail || ''
  })
  
  // Update formData when currency or settings change
  useEffect(() => {
    if (currency && currency !== formData.currency) {
      setFormData(prev => ({ ...prev, currency: currency }))
    }
  }, [currency])

  // Sync formData with settings when settings change
  useEffect(() => {
    if (safeSettings.currency && safeSettings.currency !== formData.currency) {
      setFormData(prev => ({ ...prev, currency: safeSettings.currency }))
    }
  }, [safeSettings.currency])

  const handleSave = () => {
    const settingsToSave = {
      ...formData,
      currency: formData.currency || 'USD'
    }
    console.log('Saving settings:', settingsToSave)
    saveSettings(settingsToSave)
    alert('Settings saved successfully! The currency has been changed to ' + (settingsToSave.currency === 'GHS' ? 'Ghanaian Cedi (₵)' : 'US Dollar ($)') + '.')
    // Force a small delay to ensure state updates, then reload to refresh currency display
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  const handleBackup = () => {
    const backup = {
      stores: JSON.parse(localStorage.getItem('stores') || '[]'),
      inventory: JSON.parse(localStorage.getItem(`inventory-${localStorage.getItem('currentStoreId')}`) || '[]'),
      sales: JSON.parse(localStorage.getItem(`sales-${localStorage.getItem('currentStoreId')}`) || '[]'),
      customers: JSON.parse(localStorage.getItem(`customers-${localStorage.getItem('currentStoreId')}`) || '[]'),
      cashiers: JSON.parse(localStorage.getItem('cashiers') || '[]'),
      settings: JSON.parse(localStorage.getItem('settings') || '{}'),
      timestamp: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pos-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleRestore = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const backup = JSON.parse(event.target.result)
            if (backup.stores) localStorage.setItem('stores', JSON.stringify(backup.stores))
            if (backup.inventory) localStorage.setItem(`inventory-${backup.currentStoreId || localStorage.getItem('currentStoreId')}`, JSON.stringify(backup.inventory))
            if (backup.sales) localStorage.setItem(`sales-${backup.currentStoreId || localStorage.getItem('currentStoreId')}`, JSON.stringify(backup.sales))
            if (backup.customers) localStorage.setItem(`customers-${backup.currentStoreId || localStorage.getItem('currentStoreId')}`, JSON.stringify(backup.customers))
            if (backup.cashiers) localStorage.setItem('cashiers', JSON.stringify(backup.cashiers))
            if (backup.settings) localStorage.setItem('settings', JSON.stringify(backup.settings))
            alert('Data restored successfully! Please refresh the page.')
            window.location.reload()
          } catch (error) {
            alert('Error restoring backup: ' + error.message)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">System Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Currency Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Multi-Currency Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Currency
              </label>
              <select
                value={formData.currency || currency || safeSettings?.currency || 'USD'}
                onChange={(e) => {
                  const newCurrency = e.target.value
                  setFormData({ ...formData, currency: newCurrency })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="GHS">GHS (₵) - Ghanaian Cedi</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Select the default currency for pricing and transactions. All prices will be displayed in the selected currency.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium">
                <strong>Selected Currency:</strong> {(formData.currency || currency || safeSettings?.currency || 'USD') === 'USD' ? 'US Dollar ($)' : 'Ghanaian Cedi (₵)'}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Click "Save Settings" to apply the currency change. The change will apply to all future transactions. Existing sales will retain their original currency.
              </p>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={formData.adminPassword}
                onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Password required to access admin panel
              </p>
            </div>
          </div>
        </div>

        {/* Receipt & Printer Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Receipt & Printer Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Paper Width
              </label>
              <select
                value={formData.receiptPaperWidth}
                onChange={(e) => setFormData({ ...formData, receiptPaperWidth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="58mm">58mm (2 inch) - Narrow</option>
                <option value="80mm">80mm (3 inch) - Standard</option>
                <option value="110mm">110mm (4 inch) - Wide</option>
                <option value="A4">A4 - Standard Paper</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select paper width for receipt printing
              </p>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.receiptShowQRCode}
                  onChange={(e) => setFormData({ ...formData, receiptShowQRCode: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  Show QR Code on Receipt
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Include QR code with receipt details on printed receipts
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Phone (for receipts)
              </label>
              <input
                type="text"
                value={formData.storePhone}
                onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="+1234567890"
              />
              <p className="text-xs text-gray-500 mt-1">
                Phone number to display on receipts
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Email (for receipts)
              </label>
              <input
                type="email"
                value={formData.storeEmail}
                onChange={(e) => setFormData({ ...formData, storeEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="store@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email address for receipt communications
              </p>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Data Management</h3>
          <div className="space-y-3">
            <button
              onClick={handleBackup}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Create Backup
            </button>
            <button
              onClick={handleRestore}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Restore Backup
            </button>
            <button
              onClick={exportInventory}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export Inventory CSV
            </button>
          </div>
        </div>

        {/* Test Data Generation */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Test Data</h3>
          <p className="text-sm text-gray-600 mb-4">
            Generate test data for quick setup and demonstration. This will add sample inventory items, sales, and customers.
          </p>
          <button
            onClick={() => {
              if (confirm('This will generate test data. Continue?')) {
                // Generate inventory
                const testInventory = generateTestInventory()
                testInventory.forEach(item => {
                  addInventoryItem(item)
                })

                // Generate customers
                const testCustomers = generateTestCustomers()
                testCustomers.forEach(customer => {
                  addCustomer(customer)
                })

                // Generate sales (requires existing inventory)
                setTimeout(() => {
                  const currentInventory = JSON.parse(
                    localStorage.getItem(`inventory-${localStorage.getItem('currentStoreId')}`) || '[]'
                  )
                  const testSales = generateTestSales(currentInventory, users)
                  testSales.forEach(sale => {
                    addSale(sale)
                  })
                  alert('Test data generated successfully!')
                  window.location.reload()
                }, 500)
              }
            }}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Generate Test Data
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}

export default AdminPanel

