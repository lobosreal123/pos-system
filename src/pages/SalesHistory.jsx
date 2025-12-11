import { useState } from 'react'
import Layout from '../components/Layout'
import { useData } from '../context/DataContext'
import { formatDistanceToNow, format } from 'date-fns'
import { Search, Trash2, Eye, Download, X, Printer, CreditCard } from 'lucide-react'
import { printReceipt } from '../utils/receipt'

const SalesHistory = () => {
  const { sales, deleteSale, formatMoney, settings, stores, currentStoreId, updateSalePayment } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSale, setSelectedSale] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentSale, setPaymentSale] = useState(null)
  const [cashAmount, setCashAmount] = useState('')
  const [mobileMoneyAmount, setMobileMoneyAmount] = useState('')
  const [showUnpaidConfirm, setShowUnpaidConfirm] = useState(false)

  // Group sales by date
  const groupedSales = sales.reduce((groups, sale) => {
    const date = sale.createdAt.split('T')[0]
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(sale)
    return groups
  }, {})

  const sortedDates = Object.keys(groupedSales).sort((a, b) => b.localeCompare(a))

  const filteredDates = sortedDates.filter(date => {
    const daySales = groupedSales[date]
    return daySales.some(sale => {
      const search = searchTerm.toLowerCase()
      return (
        sale.id.toLowerCase().includes(search) ||
        sale.buyerName?.toLowerCase().includes(search) ||
        sale.buyerPhone?.toLowerCase().includes(search) ||
        sale.cashierName?.toLowerCase().includes(search) ||
        sale.items.some(item =>
          item.name?.toLowerCase().includes(search) ||
          item.imei1?.toLowerCase().includes(search) ||
          (item.imei2 && item.imei2.toLowerCase().includes(search)) ||
          (item.serialNumber && item.serialNumber.toLowerCase().includes(search))
        )
      )
    })
  })

  const handleDelete = () => {
    if (!showDeleteModal) return
    
    const password = prompt('Enter admin password to delete this sale:')
    if (password === settings.adminPassword) {
      deleteSale(showDeleteModal)
      setShowDeleteModal(null)
      alert('Sale deleted successfully')
    } else {
      alert('Invalid password')
    }
  }

  const exportToCSV = () => {
    const headers = [
      'Sale ID',
      'Date',
      'Buyer Name',
      'Buyer Phone',
      'Cashier',
      'Items',
      'IMEI 1',
      'IMEI 2',
      'Serial Number',
      'Quantity',
      'Price',
      'Total',
      'Paid Amount',
      'Status',
      'Payment Method'
    ]

    const rows = sales.map(sale => {
      return sale.items.map((item, index) => [
        index === 0 ? sale.id : '',
        index === 0 ? format(new Date(sale.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
        index === 0 ? sale.buyerName || '' : '',
        index === 0 ? sale.buyerPhone || '' : '',
        index === 0 ? sale.cashierName || '' : '',
        item.name || '',
        item.imei1 || '',
        item.imei2 || '',
        item.serialNumber || '',
        item.quantity || '',
        item.price || '',
        index === 0 ? sale.total : '',
        index === 0 ? sale.paidAmount || 0 : '',
        index === 0 ? sale.status : '',
        index === 0 ? sale.paymentMethod || '' : ''
      ])
    }).flat()

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
            <p className="text-gray-600 mt-1">View and manage all sales transactions</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by IMEI, model, cashier, buyer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Sales List */}
        <div className="space-y-6">
          {filteredDates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No sales found</p>
            </div>
          ) : (
            filteredDates.map(date => (
              <div key={date} className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {groupedSales[date].length} sale{groupedSales[date].length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="divide-y divide-gray-200">
                  {groupedSales[date]
                    .filter(sale => {
                      const search = searchTerm.toLowerCase()
                      return (
                        sale.id.toLowerCase().includes(search) ||
                        sale.buyerName?.toLowerCase().includes(search) ||
                        sale.buyerPhone?.toLowerCase().includes(search) ||
                        sale.cashierName?.toLowerCase().includes(search) ||
                        sale.items.some(item =>
                          item.name?.toLowerCase().includes(search) ||
                          item.imei1?.toLowerCase().includes(search) ||
                          (item.imei2 && item.imei2.toLowerCase().includes(search)) ||
                          (item.serialNumber && item.serialNumber.toLowerCase().includes(search))
                        )
                      )
                    })
                    .map(sale => (
                      <div 
                        key={sale.id} 
                        className={`p-4 hover:bg-gray-50 ${
                          sale.status !== 'paid' ? 'cursor-pointer' : ''
                        }`}
                        onClick={() => {
                          if (sale.status !== 'paid') {
                            // Unpaid/Partial - open payment modal
                            setPaymentSale(sale)
                            setCashAmount('')
                            setMobileMoneyAmount('')
                            setShowPaymentModal(true)
                          } else {
                            // Paid - open details
                            setSelectedSale(sale)
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {sale.buyerName || 'Walk-in Customer'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {format(new Date(sale.createdAt), 'h:mm a')} • {sale.cashierName}
                                </div>
                              </div>
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
                              {sale.status !== 'paid' && (
                                <span className="text-xs text-blue-600 flex items-center">
                                  <CreditCard className="w-3 h-3 mr-1" />
                                  Click to pay
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              {sale.items.length} item{sale.items.length !== 1 ? 's' : ''} • {sale.paymentMethod}
                            </div>
                            <div className="mt-1">
                              {sale.items.map((item, idx) => (
                                <div key={idx} className="text-xs text-gray-500">
                                  {item.quantity}x {item.name} - IMEI1: {item.imei1}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-xl font-bold text-gray-900">
                              {formatMoney(sale.total)}
                            </div>
                            {sale.status !== 'paid' && (
                              <div className="text-sm text-gray-500">
                                Paid: {formatMoney(sale.paidAmount || 0)}
                              </div>
                            )}
                            <div className="flex space-x-2 mt-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedSale(sale)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    const saleStore = stores.find(s => s.id === sale.storeId)
                                    await printReceipt(sale, {
                                      storeName: saleStore?.name || 'APPLE BAZAAR',
                                      storeAddress: saleStore?.address || '',
                                      storePhone: settings.storePhone || '',
                                      showQRCode: settings.receiptShowQRCode !== false,
                                      paperWidth: settings.receiptPaperWidth || '80mm'
                                    })
                                  } catch (error) {
                                    console.error('Print error:', error)
                                    alert('Error printing receipt. Please try again.')
                                  }
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded"
                                title="Print Receipt"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteModal(sale.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sale Details Modal */}
        {selectedSale && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-semibold">Sale Details</h3>
                  <button
                    onClick={() => setSelectedSale(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Sale ID</label>
                      <div className="font-semibold">{selectedSale.id}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Date & Time</label>
                      <div className="font-semibold">
                        {format(new Date(selectedSale.createdAt), 'PPpp')}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Buyer Name</label>
                      <div className="font-semibold">{selectedSale.buyerName || 'Walk-in Customer'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Buyer Phone</label>
                      <div className="font-semibold">{selectedSale.buyerPhone || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Cashier</label>
                      <div className="font-semibold">{selectedSale.cashierName}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Payment Method</label>
                      <div className="font-semibold">{selectedSale.paymentMethod}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${
                          selectedSale.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : selectedSale.status === 'partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedSale.status}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Items</h4>
                    <div className="space-y-3">
                      {selectedSale.items.map((item, idx) => (
                        <div key={idx} className="border border-gray-200 rounded p-3">
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            <div>Quantity: {item.quantity}</div>
                            <div>Price: {formatMoney(item.price)}</div>
                            <div>Subtotal: {formatMoney(item.price * item.quantity)}</div>
                            <div className="mt-2 pt-2 border-t">
                              <div><strong>IMEI 1:</strong> {item.imei1}</div>
                              {item.imei2 && <div><strong>IMEI 2:</strong> {item.imei2}</div>}
                              {item.serialNumber && <div><strong>Serial Number:</strong> {item.serialNumber}</div>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold">Total:</span>
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 truncate">
                        {formatMoney(selectedSale.total)}
                      </span>
                    </div>
                    {selectedSale.status !== 'paid' && (
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-semibold">{formatMoney(selectedSale.paidAmount || 0)}</span>
                      </div>
                    )}
                    {selectedSale.status !== 'paid' && (
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-red-600 font-semibold">Remaining:</span>
                        <span className="font-bold text-red-600">
                          {formatMoney(selectedSale.total - (selectedSale.paidAmount || 0))}
                        </span>
                      </div>
                    )}
                    
                    <div className="mt-4 space-y-2">
                      {selectedSale.status !== 'paid' && (
                        <button
                          onClick={() => {
                            setSelectedSale(null)
                            setPaymentSale(selectedSale)
                            setCashAmount('')
                            setMobileMoneyAmount('')
                            setShowPaymentModal(true)
                          }}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 font-semibold"
                        >
                          <CreditCard className="w-5 h-5" />
                          <span>Complete Payment</span>
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          try {
                            const saleStore = stores.find(s => s.id === selectedSale.storeId)
                            await printReceipt(selectedSale, {
                              storeName: saleStore?.name || 'APPLE BAZAAR',
                              storeAddress: saleStore?.address || '',
                              storePhone: settings.storePhone || '',
                              showQRCode: settings.receiptShowQRCode !== false,
                              paperWidth: settings.receiptPaperWidth || '80mm'
                            })
                          } catch (error) {
                            console.error('Print error:', error)
                            alert('Error printing receipt. Please try again.')
                          }
                        }}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                      >
                        <Printer className="w-5 h-5" />
                        <span>Print Receipt</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Completion Modal */}
        {showPaymentModal && paymentSale && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border-4 border-yellow-400">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-blue-600">Complete Payment</h3>
                  <p className="text-xs text-gray-500 mt-1">⚠️ You can complete even with no payment</p>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setPaymentSale(null)
                    setCashAmount('')
                    setMobileMoneyAmount('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Sale ID</div>
                  <div className="font-semibold">{paymentSale.id}</div>
                  <div className="text-sm text-gray-600 mt-2 mb-1">Total Amount</div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 truncate">
                    {formatMoney(paymentSale.total)}
                  </div>
                  <div className="text-sm text-gray-600 mt-2 mb-1">Already Paid</div>
                  <div className="font-semibold">
                    {formatMoney(paymentSale.paidAmount || 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-2 mb-1">Remaining Balance</div>
                  <div className="text-xl font-bold text-red-600">
                    {formatMoney(paymentSale.total - (paymentSale.paidAmount || 0))}
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 font-semibold">
                    ⚠️ You can complete this order even with no payment. Click "Complete Without Payment" button below.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cash Amount
                  </label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Money Amount
                  </label>
                  <input
                    type="number"
                    value={mobileMoneyAmount}
                    onChange={(e) => setMobileMoneyAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="text-sm text-blue-900">
                    <div className="flex justify-between mb-1">
                      <span>Cash:</span>
                      <span className="font-semibold">{formatMoney(parseFloat(cashAmount) || 0)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Mobile Money:</span>
                      <span className="font-semibold">{formatMoney(parseFloat(mobileMoneyAmount) || 0)}</span>
                    </div>
                    <div className="border-t border-blue-300 pt-1 mt-1 flex justify-between font-bold">
                      <span>Total Payment:</span>
                      <span>
                        {formatMoney((parseFloat(cashAmount) || 0) + (parseFloat(mobileMoneyAmount) || 0))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false)
                      setPaymentSale(null)
                      setCashAmount('')
                      setMobileMoneyAmount('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const totalPayment = (parseFloat(cashAmount) || 0) + (parseFloat(mobileMoneyAmount) || 0)
                      const remaining = paymentSale.total - (paymentSale.paidAmount || 0)
                      
                      // Allow completing with no payment - but show confirmation
                      if (totalPayment <= 0) {
                        setShowUnpaidConfirm(true)
                        return
                      }

                      if (totalPayment > remaining) {
                        alert(`Payment amount (${formatMoney(totalPayment)}) exceeds remaining balance (${formatMoney(remaining)})`)
                        return
                      }

                      // Determine payment method
                      let paymentMethod = paymentSale.paymentMethod || 'Cash'
                      if (cashAmount > 0 && mobileMoneyAmount > 0) {
                        paymentMethod = 'Split Payment'
                      } else if (mobileMoneyAmount > 0) {
                        paymentMethod = 'Mobile Money'
                      } else if (cashAmount > 0) {
                        paymentMethod = 'Cash'
                      }

                      // Process payment (combined amount)
                      updateSalePayment(paymentSale.id, {
                        amount: totalPayment,
                        paymentMethod: paymentMethod,
                        cashAmount: parseFloat(cashAmount) || 0,
                        mobileMoneyAmount: parseFloat(mobileMoneyAmount) || 0
                      })

                      alert('Payment processed successfully!')
                      setShowPaymentModal(false)
                      setPaymentSale(null)
                      setCashAmount('')
                      setMobileMoneyAmount('')
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                      (parseFloat(cashAmount) || 0) + (parseFloat(mobileMoneyAmount) || 0) <= 0
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {((parseFloat(cashAmount) || 0) + (parseFloat(mobileMoneyAmount) || 0) <= 0) 
                      ? 'Complete Without Payment' 
                      : 'Process Payment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unpaid Confirmation Modal */}
        {showUnpaidConfirm && paymentSale && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 border-4 border-red-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-red-600">⚠️ Unpaid Order Confirmation</h3>
                </div>
                <button
                  onClick={() => setShowUnpaidConfirm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-semibold mb-2">
                    This payment is UNPAID
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total Amount:</span>
                      <span className="font-bold">{formatMoney(paymentSale.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Already Paid:</span>
                      <span className="font-bold">{formatMoney(paymentSale.paidAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-red-700 font-semibold">Remaining Balance:</span>
                      <span className="font-bold text-red-600">
                        {formatMoney(paymentSale.total - (paymentSale.paidAmount || 0))}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700">
                  Are you sure you want to proceed without receiving payment? This order will remain as <strong>UNPAID</strong>.
                </p>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setShowUnpaidConfirm(false)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Return to Payment
                  </button>
                  <button
                    onClick={() => {
                      // Confirm unpaid - don't process any payment
                      setShowUnpaidConfirm(false)
                      setShowPaymentModal(false)
                      setPaymentSale(null)
                      setCashAmount('')
                      setMobileMoneyAmount('')
                      alert('Order confirmed as UNPAID. Payment can be completed later from Sales History.')
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                  >
                    Confirm Unpaid
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-4">Delete Sale</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this sale? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default SalesHistory

