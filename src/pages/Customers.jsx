import { useState } from 'react'
import Layout from '../components/Layout'
import { useData } from '../context/DataContext'
import { format } from 'date-fns'
import { Search, Plus, Eye, User } from 'lucide-react'

const Customers = () => {
  const { customers, sales, formatMoney, addCustomer } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  })

  const filteredCustomers = customers.filter(customer => {
    const search = searchTerm.toLowerCase()
    return (
      customer.name?.toLowerCase().includes(search) ||
      customer.phone?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search)
    )
  })

  const handleAddCustomer = () => {
    if (!formData.name && !formData.phone) {
      alert('Please provide at least a name or phone number')
      return
    }

    // Check if customer already exists
    const existing = customers.find(c => c.phone === formData.phone && formData.phone)
    if (existing) {
      alert('Customer with this phone number already exists')
      return
    }

    addCustomer(formData)
    setFormData({ name: '', phone: '', email: '', address: '' })
    setShowAddModal(false)
    alert('Customer added successfully')
  }

  const getCustomerSales = (customerId) => {
    if (!customerId) return []
    // Match by phone number or name
    const customer = customers.find(c => c.id === customerId)
    if (!customer) return []
    
    return sales.filter(sale => 
      sale.buyerPhone === customer.phone || 
      sale.buyerName === customer.name
    )
  }

  const getCustomerTotalSpent = (customerId) => {
    const customerSales = getCustomerSales(customerId)
    return customerSales
      .filter(sale => sale.status === 'paid')
      .reduce((total, sale) => total + sale.total, 0)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-1">Manage customer information and view purchase history</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Customers List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(customer => {
            const customerSales = getCustomerSales(customer.id)
            const totalSpent = getCustomerTotalSpent(customer.id)
            
            return (
              <div key={customer.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{customer.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{customer.phone || 'No phone'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    className="text-blue-600 hover:text-blue-700"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  {customer.email && <div>Email: {customer.email}</div>}
                  <div>Total Orders: {customerSales.length}</div>
                  <div>Total Spent: {formatMoney(totalSpent)}</div>
                </div>
              </div>
            )
          })}
          {filteredCustomers.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No customers found
            </div>
          )}
        </div>

        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-4">Add Customer</h3>
              <div className="space-y-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
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
                    onClick={() => {
                      setShowAddModal(false)
                      setFormData({ name: '', phone: '', email: '', address: '' })
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomer}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Details Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-semibold">Customer Details</h3>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Name</label>
                      <div className="font-semibold">{selectedCustomer.name || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Phone</label>
                      <div className="font-semibold">{selectedCustomer.phone || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <div className="font-semibold">{selectedCustomer.email || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Total Spent</label>
                      <div className="font-semibold">
                        {formatMoney(getCustomerTotalSpent(selectedCustomer.id))}
                      </div>
                    </div>
                  </div>

                  {selectedCustomer.address && (
                    <div>
                      <label className="text-sm text-gray-600">Address</label>
                      <div className="font-semibold">{selectedCustomer.address}</div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Purchase History</h4>
                    <div className="space-y-2">
                      {getCustomerSales(selectedCustomer.id).length === 0 ? (
                        <p className="text-gray-500">No purchases yet</p>
                      ) : (
                        getCustomerSales(selectedCustomer.id).map(sale => (
                          <div key={sale.id} className="border border-gray-200 rounded p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold">
                                  {format(new Date(sale.createdAt), 'PPp')}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {sale.items.length} item{sale.items.length !== 1 ? 's' : ''} • {sale.paymentMethod}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{formatMoney(sale.total)}</div>
                                <span
                                  className={`inline-block px-2 py-1 text-xs rounded ${
                                    sale.status === 'paid'
                                      ? 'bg-green-100 text-green-800'
                                      : sale.status === 'partial'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {sale.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Customers

