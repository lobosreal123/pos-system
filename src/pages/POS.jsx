import { useState, useEffect, useRef } from 'react'
import Layout from '../components/Layout'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import {
  IPHONE_MODELS,
  IPHONE_COLORS,
  IPHONE_STORAGE,
  CONDITIONS,
  PAYMENT_METHODS
} from '../utils/iphoneModels'
import { Plus, Minus, X, ShoppingCart, Search, ScanLine, Printer, AlertTriangle } from 'lucide-react'
import BarcodeScanner from '../components/BarcodeScanner'
import { printReceipt } from '../utils/receipt'

const POS = () => {
  const { inventory = [], addSale, addCustomer, formatMoney, currency, stores = [], currentStoreId, settings = {} } = useData()
  const { currentUser } = useAuth()
  
  // Safety check - ensure we have valid data
  if (!formatMoney || !addSale) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">Loading APPLE BAZAAR...</p>
          </div>
        </div>
      </Layout>
    )
  }
  const [cart, setCart] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCartItem, setSelectedCartItem] = useState(null)
  const [expandedCartForIMEI, setExpandedCartForIMEI] = useState([])
  const [imei1, setImei1] = useState('')
  const [imei2, setImei2] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const imei1InputRef = useRef(null)
  const imei2InputRef = useRef(null)
  const currentItemRef = useRef(null)
  const itemsListRef = useRef(null)
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showIMeIModal, setShowIMeIModal] = useState(false)
  
  // Auto-focus IMEI input and scroll to current item when modal opens or item changes
  useEffect(() => {
    if (showIMeIModal) {
      // Auto-focus IMEI input
      if (imei1InputRef.current) {
        setTimeout(() => imei1InputRef.current?.focus(), 100)
      }
      // Auto-scroll to current item in the list
      if (currentItemRef.current && itemsListRef.current) {
        setTimeout(() => {
          currentItemRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          })
        }, 200)
      }
    }
  }, [showIMeIModal, selectedCartItem])
  // Payment method is now auto-determined from entered amounts, but keep for backward compatibility
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [cashAmount, setCashAmount] = useState('')
  const [mobileMoneyAmount, setMobileMoneyAmount] = useState('')
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [lastSale, setLastSale] = useState(null)
  const [lowStockThreshold] = useState(5) // Configurable low stock threshold
  const [lowStockNotifications, setLowStockNotifications] = useState([])
  const [showUnpaidConfirm, setShowUnpaidConfirm] = useState(false)

  // Calculate real-time available stock (original stock minus cart quantity)
  const getAvailableStock = (item) => {
    if (!item) return 0
    const originalStock = item.stock || 0
    const cartItem = (cart || []).find(c => c && c.id === item.id && !c.imei1)
    const cartQuantity = cartItem?.quantity || 0
    return Math.max(0, originalStock - cartQuantity)
  }

  // Check if item is low stock
  const isLowStock = (item) => {
    const availableStock = getAvailableStock(item)
    return availableStock > 0 && availableStock <= lowStockThreshold
  }

  // Filter inventory with real-time stock calculation - hide items with 0 available stock
  const filteredInventory = (inventory || []).filter(item => {
    if (!item) return false
    const search = searchTerm.toLowerCase()
    const matchesSearch = (
      item.name?.toLowerCase().includes(search) ||
      item.model?.toLowerCase().includes(search) ||
      item.category?.toLowerCase().includes(search) ||
      item.barcode?.toLowerCase().includes(search)
    )
    const availableStock = getAvailableStock(item)
    return matchesSearch && availableStock > 0
  })

  const handleBarcodeScan = (scannedCode) => {
    // Try to find item by barcode
    const item = (inventory || []).find(i => i && i.barcode === scannedCode)
    if (!item) {
      alert(`Item with barcode ${scannedCode} not found`)
      setShowBarcodeScanner(false)
      return
    }
    
    const availableStock = getAvailableStock(item)
    if (availableStock <= 0) {
      alert(`Item with barcode ${scannedCode} is out of stock`)
      setShowBarcodeScanner(false)
      return
    }
    
    addToCartDirectly(item)
    setShowBarcodeScanner(false)
  }

  // Add item to cart directly without IMEI (will be collected during checkout)
  const addToCartDirectly = (item, quantity = 1) => {
    if (!item) return
    
    // Only check if stock is exactly 0 - no other restrictions
    const availableStock = getAvailableStock(item)
    if (availableStock <= 0) {
      alert('Item is out of stock')
      return
    }
    
    // Check if item already in cart
    const existingCartItem = (cart || []).find(c => c && c.id === item.id && !c.imei1)
    
    if (existingCartItem) {
      // Update quantity if item already in cart - no stock limit check
      updateQuantity(existingCartItem.cartId, quantity)
    } else {
      // Add new item to cart - no stock limit check
      const cartItem = {
        ...item,
        quantity: quantity,
        imei1: null,
        imei2: null,
        serialNumber: null,
        cartId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
      setCart([...(cart || []), cartItem])
    }
  }

  // Add item with quantity controls
  const addItemWithQuantity = (item, delta) => {
    if (!item) return
    
    // Only check if stock is exactly 0 - no other restrictions
    const availableStock = getAvailableStock(item)
    if (availableStock <= 0) {
      alert('Item is out of stock')
      return
    }
    
    const existingCartItem = (cart || []).find(c => c && c.id === item.id && !c.imei1)
    
    if (existingCartItem) {
      const currentCartQuantity = existingCartItem.quantity || 0
      const newQuantity = currentCartQuantity + delta
      
      // Only prevent if quantity would go below 1 or stock is 0
      if (newQuantity < 1) {
        alert('Quantity cannot be less than 1')
        return
      }
      
      // Allow adding even if it exceeds available stock (no restriction)
      updateQuantity(existingCartItem.cartId, delta)
    } else {
      // Adding new item - only prevent if stock is exactly 0
      if (availableStock <= 0) {
        alert('Item is out of stock')
        return
      }
      addToCartDirectly(item, 1)
    }
  }

  const removeFromCart = (cartId) => {
    setCart((cart || []).filter(item => item && item.cartId !== cartId))
  }

  const updateQuantity = (cartId, delta) => {
    if (!cart || !cartId) return
    
    setCart((cart || []).map(item => {
      if (!item || item.cartId !== cartId) return item
      
      const newQuantity = (item.quantity || 0) + delta
      
      // Cannot go below 1 - remove item instead
      if (newQuantity < 1) {
        return null
      }
      
      // No stock restrictions - allow any quantity
      // Just update the quantity without checking stock
      const updatedItem = { ...item, quantity: newQuantity }
      
      return updatedItem
    }).filter(item => item !== null))
  }

  const cartTotal = (cart || []).reduce((sum, item) => {
    if (!item) return sum
    return sum + ((item.price || 0) * (item.quantity || 0))
  }, 0)

  const handleCheckout = () => {
    if (!cart || cart.length === 0) {
      alert('Cart is empty')
      return
    }

    // Expand cart items with quantity > 1 into individual items
    const expandedCart = []
    cart.forEach(item => {
      if (!item) return
      const quantity = item.quantity || 1
      for (let i = 0; i < quantity; i++) {
        expandedCart.push({
          ...item,
          quantity: 1,
          itemIndex: i + 1, // Track which instance (1, 2, 3...)
          originalCartId: item.cartId,
          uniqueId: `${item.cartId}-${i}` // Unique ID for each instance
        })
      }
    })

    // Check if all items have IMEI 1 (15 digits)
    const itemsWithoutIMEI = expandedCart.filter(item => !item.imei1 || item.imei1.length !== 15)
    
    if (itemsWithoutIMEI.length > 0) {
      // Store expanded cart temporarily
      setExpandedCartForIMEI(expandedCart)
      // Show IMEI collection modal for items without IMEI
      setSelectedCartItem(itemsWithoutIMEI[0])
      setImei1('')
      setImei2('')
      setSerialNumber('')
      setShowIMeIModal(true)
    } else {
      // All items have valid IMEI, proceed to payment
      proceedToPayment()
    }
  }

  const proceedToPayment = () => {
    // Save customer if provided
    if (buyerName || buyerPhone) {
      addCustomer({
        name: buyerName,
        phone: buyerPhone
      })
    }

    setShowPaymentModal(true)
    setCashAmount('')
    setMobileMoneyAmount('')
  }

  const validateIMEI = (imei) => {
    // Only allow digits and exactly 15 digits
    const digitsOnly = imei.replace(/\D/g, '')
    return digitsOnly.length === 15
  }

  const handleIMEI1Change = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 15) // Only digits, max 15
    setImei1(value)
    
    // Auto-advance to IMEI2 or Serial when 15 digits reached
    if (value.length === 15) {
      const isIPhone = IPHONE_MODELS.includes(selectedCartItem?.model || '')
      if (!isIPhone && imei2InputRef.current) {
        setTimeout(() => imei2InputRef.current?.focus(), 100)
      }
    }
  }

  const handleIMEI2Change = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 15) // Only digits, max 15
    setImei2(value)
  }

  const saveIMEI = () => {
    if (!selectedCartItem) return

    if (!imei1.trim()) {
      alert('IMEI 1 is required for all devices')
      return
    }

    if (!validateIMEI(imei1)) {
      alert('IMEI 1 must be exactly 15 digits')
      return
    }

    // Validate IMEI 2 if provided
    if (imei2.trim() && !validateIMEI(imei2)) {
      alert('IMEI 2 must be exactly 15 digits')
      return
    }

    const isIPhone = IPHONE_MODELS.includes(selectedCartItem.model || '')

    // Update expanded cart item with IMEI
    const updatedExpandedCart = expandedCartForIMEI.map(item => {
      if (item.uniqueId === selectedCartItem.uniqueId) {
        return {
          ...item,
          imei1: imei1.trim(),
          imei2: isIPhone ? null : (imei2.trim() || null),
          serialNumber: isIPhone ? null : (serialNumber.trim() || null)
        }
      }
      return item
    })

    setExpandedCartForIMEI(updatedExpandedCart)

    // Check if there are more items without valid IMEI
    const remainingItems = updatedExpandedCart.filter(item => 
      item.uniqueId !== selectedCartItem.uniqueId && (!item.imei1 || item.imei1.length !== 15)
    )

    if (remainingItems.length > 0) {
      // Move to next item
      setSelectedCartItem(remainingItems[0])
      setImei1('')
      setImei2('')
      setSerialNumber('')
      // Focus on IMEI1 input
      setTimeout(() => {
        imei1InputRef.current?.focus()
      }, 100)
    } else {
      // All items have valid IMEI, consolidate back to cart and proceed to payment
      consolidateCartWithIMEI(updatedExpandedCart)
      setShowIMeIModal(false)
      setSelectedCartItem(null)
      proceedToPayment()
    }
  }

  const consolidateCartWithIMEI = (expandedCart) => {
    if (!expandedCart || expandedCart.length === 0) return
    
    // Group expanded items back by original cart ID
    const grouped = expandedCart.reduce((acc, item) => {
      if (!item || !item.originalCartId) return acc
      const key = item.originalCartId
      if (!acc[key]) {
        acc[key] = {
          ...item,
          quantity: 0,
          items: []
        }
      }
      acc[key].quantity++
      acc[key].items.push({
        imei1: item.imei1,
        imei2: item.imei2,
        serialNumber: item.serialNumber,
        itemIndex: item.itemIndex
      })
      return acc
    }, {})

    // Update cart with IMEI information
    const updatedCart = (cart || []).map(cartItem => {
      if (!cartItem) return cartItem
      const groupedItem = grouped[cartItem.cartId]
      if (groupedItem) {
        return {
          ...cartItem,
          imeiItems: groupedItem.items // Store all IMEIs for this cart item
        }
      }
      return cartItem
    })

    setCart(updatedCart)
  }

  const processPayment = async () => {
    // Always use both amounts - determine payment method from what was entered
    const cash = parseFloat(cashAmount) || 0
    const mobileMoney = parseFloat(mobileMoneyAmount) || 0
    const paidAmount = cash + mobileMoney
    let status = 'unpaid'
    
    // Determine payment method based on what was entered
    let finalPaymentMethod = 'Unpaid'
    if (cash > 0 && mobileMoney > 0) {
      finalPaymentMethod = 'Split Payment'
    } else if (mobileMoney > 0) {
      finalPaymentMethod = 'Mobile Money'
    } else if (cash > 0) {
      finalPaymentMethod = 'Cash'
    }

    if (paidAmount >= cartTotal) {
      status = 'paid'
      // Don't cap paidAmount to cartTotal - allow overpayment if confirmed
    } else if (paidAmount > 0) {
      status = 'partial'
    } else {
      status = 'unpaid'
      finalPaymentMethod = 'Unpaid'
    }

    // Expand items with imeiItems (multiple IMEIs for same item)
    const saleItems = []
    ;(cart || []).forEach(item => {
      if (!item) return
      if (item.imeiItems && item.imeiItems.length > 0) {
        // Item has multiple IMEIs (quantity > 1)
        item.imeiItems.forEach(imeiItem => {
          saleItems.push({
            id: item.id,
            name: item.name || `${item.model || ''} ${item.color || ''} ${item.storage || ''}`.trim(),
            quantity: 1,
            price: item.price || 0,
            imei1: imeiItem.imei1,
            imei2: imeiItem.imei2,
            serialNumber: imeiItem.serialNumber
          })
        })
      } else {
        // Single item
        saleItems.push({
          id: item.id,
          name: item.name || `${item.model || ''} ${item.color || ''} ${item.storage || ''}`.trim(),
          quantity: item.quantity || 1,
          price: item.price || 0,
          imei1: item.imei1,
          imei2: item.imei2,
          serialNumber: item.serialNumber
        })
      }
    })

    // Build sale object, excluding undefined values
    const sale = {
      items: saleItems,
      total: cartTotal,
      paidAmount,
      status,
      paymentMethod: finalPaymentMethod,
      cashAmount: parseFloat(cashAmount) || 0,
      mobileMoneyAmount: parseFloat(mobileMoneyAmount) || 0,
      buyerName: buyerName || 'Walk-in Customer',
      buyerPhone: buyerPhone || '',
      cashierName: currentUser?.name || 'Unknown',
      currency: currency || 'USD'
    }
    
    // Only include cashierId if it exists (Firestore doesn't accept undefined)
    if (currentUser?.uid) {
      sale.cashierId = currentUser.uid
    }

    try {
      const newSale = await addSale(sale)
      // Ensure all required fields are present
      if (newSale) {
        setLastSale({
          ...newSale,
          status: newSale.status || sale.status || 'unpaid',
          paymentMethod: newSale.paymentMethod || sale.paymentMethod || 'Unpaid',
          cashAmount: newSale.cashAmount ?? sale.cashAmount ?? 0,
          mobileMoneyAmount: newSale.mobileMoneyAmount ?? sale.mobileMoneyAmount ?? 0
        })
      } else {
        // Fallback: use the sale object directly if addSale returns null
        setLastSale({
          ...sale,
          id: sale.id || Date.now().toString(),
          status: sale.status || 'unpaid',
          paymentMethod: sale.paymentMethod || 'Unpaid',
          createdAt: sale.createdAt || new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error adding sale:', error)
      // Fallback: still show receipt even if save fails
      setLastSale({
        ...sale,
        id: sale.id || Date.now().toString(),
        status: sale.status || 'unpaid',
        paymentMethod: sale.paymentMethod || 'Unpaid',
        createdAt: sale.createdAt || new Date().toISOString()
      })
    }

    // Reset form regardless of success/failure
    setCart([])
    setBuyerName('')
    setBuyerPhone('')
    setCashAmount('')
    setMobileMoneyAmount('')
    setShowPaymentModal(false)
    
    // Show receipt modal
    setShowReceiptModal(true)
  }

  return (
    <Layout>
      {/* Low Stock Notifications */}
      {lowStockNotifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
          {lowStockNotifications.map(notification => (
            <div
              key={notification.id}
              className="backdrop-blur-xl bg-orange-100/60 border-l-4 border-orange-400/50 text-orange-700 p-4 rounded-xl shadow-lg"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-xl">⚠️</span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                </div>
                <button
                  onClick={() => setLowStockNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  className="ml-4 flex-shrink-0 text-orange-500 hover:text-orange-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Point of Sale</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Select items and process sales</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Inventory Selection */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search inventory or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowBarcodeScanner(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                title="Scan Barcode"
              >
                <ScanLine className="w-5 h-5" />
                <span className="hidden md:inline">Scan</span>
              </button>
            </div>

            {/* Inventory Grid */}
            <div className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/20 p-3 sm:p-4">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Available Items</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                {filteredInventory.map(item => {
                  if (!item) return null
                  const cartItem = (cart || []).find(c => c && c.id === item.id && !c.imei1)
                  const cartQuantity = cartItem?.quantity || 0
                  const availableStock = getAvailableStock(item)
                  const isLow = isLowStock(item)
                  
                  return (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-xl hover:shadow-lg transition-all backdrop-blur-sm ${
                        isLow 
                          ? 'border-orange-300/50 bg-orange-50/60 hover:bg-orange-100/70 hover:scale-105' 
                          : 'border-white/30 bg-white/50 hover:bg-white/70 hover:border-blue-400/50 hover:scale-105'
                      }`}
                    >
                      <div className="text-left mb-3">
                        <div className="font-semibold text-gray-900 mb-1">
                          {item.name || `${item.model || ''} ${item.color || ''} ${item.storage || ''}`.trim()}
                        </div>
                        
                        {/* Full Item Details */}
                        <div className="text-xs text-gray-600 space-y-0.5 mb-2">
                          {item.model && (
                            <div><span className="font-medium">Model:</span> {item.model}</div>
                          )}
                          {item.category && (
                            <div><span className="font-medium">Category:</span> {item.category}</div>
                          )}
                          {item.color && (
                            <div><span className="font-medium">Color:</span> {item.color}</div>
                          )}
                          {item.storage && (
                            <div><span className="font-medium">Storage:</span> {item.storage}</div>
                          )}
                          {item.condition && (
                            <div><span className="font-medium">Condition:</span> {item.condition}</div>
                          )}
                          {item.barcode && (
                            <div><span className="font-medium">Barcode:</span> {item.barcode}</div>
                          )}
                        </div>
                        
                        <div className={`text-sm mt-2 font-semibold ${
                          isLow 
                            ? 'text-orange-600' 
                            : availableStock <= 3 
                            ? 'text-yellow-600' 
                            : 'text-gray-500'
                        }`}>
                          {isLow && '⚠️ '}
                          Available: {availableStock} {cartQuantity > 0 && `(${item.stock || 0} - ${cartQuantity} in cart)`}
                        </div>
                        {isLow && (
                          <div className="text-xs text-orange-600 mt-1 font-medium">
                            Low Stock Alert!
                          </div>
                        )}
                        <div className="text-lg font-bold text-blue-600 mt-2">
                          {formatMoney(item.price)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between border-t pt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (cartQuantity > 0) {
                              updateQuantity(cartItem.cartId, -1)
                            }
                          }}
                          disabled={cartQuantity === 0}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg border backdrop-blur-sm transition-all ${
                            cartQuantity === 0
                              ? 'border-gray-300/50 text-gray-300 cursor-not-allowed bg-gray-50/30'
                              : 'border-white/30 bg-white/40 hover:bg-white/60 hover:scale-110 hover:shadow-md'
                          }`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
                          {cartQuantity}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // Only block if stock is exactly 0
                            if (availableStock <= 0) {
                              alert('Item is out of stock')
                              return
                            }
                            // Allow adding as long as stock > 0
                            addItemWithQuantity(item, 1)
                          }}
                          disabled={availableStock <= 0}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg border backdrop-blur-sm transition-all ${
                            availableStock <= 0
                              ? 'border-gray-300/50 text-gray-300 cursor-not-allowed bg-gray-50/30'
                              : 'border-blue-500/50 text-blue-600 bg-blue-50/40 hover:bg-blue-100/60 hover:scale-110 hover:shadow-md'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
                {filteredInventory.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No items found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="space-y-4">
            <div className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/20 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart ({(cart || []).length})</span>
                </h2>
              </div>

              {/* Buyer Info */}
              <div className="mb-4 space-y-2">
                <input
                  type="text"
                  placeholder="Buyer Name (optional)"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3 py-2 backdrop-blur-sm bg-white/60 border border-white/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 focus:bg-white/80 transition-all"
                />
                <input
                  type="text"
                  placeholder="Phone (optional)"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full px-3 py-2 backdrop-blur-sm bg-white/60 border border-white/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 focus:bg-white/80 transition-all"
                />
              </div>

              {/* Cart Items */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4">
                {(cart || []).map(item => {
                  if (!item) return null
                  return (
                  <div key={item.cartId} className="border border-white/30 backdrop-blur-sm bg-white/40 rounded-xl p-3 hover:bg-white/60 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900 truncate">
                          {item.name || `${item.model || ''} ${item.color || ''} ${item.storage || ''}`.trim()}
                        </div>
                        {item.imeiItems ? (
                          <div className="text-xs text-gray-500 mt-1 space-y-1">
                            {item.imeiItems.map((imeiItem, idx) => (
                              <div key={idx}>
                                {item.quantity > 1 && `Item ${idx + 1}: `}
                                IMEI1: {imeiItem.imei1}
                                {imeiItem.imei2 && `, IMEI2: ${imeiItem.imei2}`}
                                {imeiItem.serialNumber && `, Serial: ${imeiItem.serialNumber}`}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            {item.imei1 && (
                              <div className="text-xs text-gray-500 mt-1">
                                IMEI1: {item.imei1}
                              </div>
                            )}
                            {item.imei2 && (
                              <div className="text-xs text-gray-500">IMEI2: {item.imei2}</div>
                            )}
                            {item.serialNumber && (
                              <div className="text-xs text-gray-500">Serial: {item.serialNumber}</div>
                            )}
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.cartId, -1)}
                          className="w-6 h-6 flex items-center justify-center border rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => {
                            // No stock restrictions - just increase quantity
                            updateQuantity(item.cartId, 1)
                          }}
                          className="w-6 h-6 flex items-center justify-center border border-white/30 backdrop-blur-sm bg-white/40 rounded-lg hover:bg-white/60 transition-all hover:scale-110"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="font-semibold text-sm">
                        {formatMoney(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                  )
                })}
                {(!cart || cart.length === 0) && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Cart is empty
                  </div>
                )}
              </div>

              {/* Total */}
              {cart && cart.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-base sm:text-lg font-semibold">Total:</span>
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 truncate ml-2">
                      {formatMoney(cartTotal)}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all backdrop-blur-sm border border-white/20"
                  >
                    Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* IMEI Collection Modal (during checkout) */}
        {showIMeIModal && selectedCartItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-2xl border border-white/30 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Enter IMEI for Each Device</h3>
              
              {/* List of items needing IMEI */}
              <div className="mb-6 backdrop-blur-sm bg-white/40 rounded-xl p-4 border border-white/20">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Items Requiring IMEI ({expandedCartForIMEI.filter(item => !item.imei1 || item.imei1.length !== 15).length} remaining)
                </h4>
                <div ref={itemsListRef} className="space-y-2 max-h-40 overflow-y-auto">
                  {expandedCartForIMEI.map((item, idx) => {
                    const hasValidIMEI = item.imei1 && item.imei1.length === 15
                    const isCurrent = item.uniqueId === selectedCartItem.uniqueId
                    return (
                      <div
                        key={item.uniqueId}
                        ref={isCurrent ? currentItemRef : null}
                        className={`text-xs p-2 rounded ${
                          isCurrent
                            ? 'bg-blue-100 border-2 border-blue-500 shadow-md'
                            : hasValidIMEI
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {item.itemIndex && cart.find(c => c.id === item.id)?.quantity > 1 ? `#${item.itemIndex} - ` : ''}
                            {item.name || `${item.model || ''} ${item.color || ''} ${item.storage || ''}`.trim()}
                          </span>
                          <span className={hasValidIMEI ? 'text-green-600' : isCurrent ? 'text-blue-600 font-semibold' : 'text-gray-400'}>
                            {hasValidIMEI ? '✓' : isCurrent ? '→' : '○'}
                          </span>
                        </div>
                        {hasValidIMEI && (
                          <div className="text-gray-600 mt-1">
                            IMEI: {item.imei1}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Device {selectedCartItem.itemIndex && cart.find(c => c.id === selectedCartItem.id)?.quantity > 1 ? `#${selectedCartItem.itemIndex}` : ''}
                    </label>
                    <div className="p-2 backdrop-blur-sm bg-white/40 rounded-xl border border-white/20">
                      {selectedCartItem.name || `${selectedCartItem.model || ''} ${selectedCartItem.color || ''} ${selectedCartItem.storage || ''}`.trim()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IMEI 1 <span className="text-red-500">*</span> (15 digits)
                  </label>
                  <input
                    ref={imei1InputRef}
                    type="text"
                    value={imei1}
                    onChange={handleIMEI1Change}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && imei1.length === 15) {
                        e.preventDefault()
                        const isIPhone = IPHONE_MODELS.includes(selectedCartItem.model || '')
                        if (!isIPhone && imei2InputRef.current) {
                          imei2InputRef.current.focus()
                        } else {
                          saveIMEI()
                        }
                      }
                    }}
                    className={`w-full px-3 py-2 backdrop-blur-sm bg-white/60 border rounded-xl transition-all ${
                      imei1.length > 0 && imei1.length !== 15
                        ? 'border-red-400/50 bg-red-50/40'
                        : imei1.length === 15
                        ? 'border-green-400/50 bg-green-50/40'
                        : 'border-white/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50'
                    }`}
                    placeholder="Enter 15-digit IMEI 1"
                    maxLength={15}
                    inputMode="numeric"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {imei1.length}/15 digits {imei1.length === 15 && <span className="text-green-600">✓ Valid</span>}
                  </div>
                </div>

                {!IPHONE_MODELS.includes(selectedCartItem.model || '') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IMEI 2 (optional, 15 digits)
                      </label>
                      <input
                        ref={imei2InputRef}
                        type="text"
                        value={imei2}
                        onChange={handleIMEI2Change}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && imei1.length === 15) {
                            e.preventDefault()
                            saveIMEI()
                          }
                        }}
                        className={`w-full px-3 py-2 backdrop-blur-sm bg-white/60 border rounded-xl transition-all ${
                          imei2.length > 0 && imei2.length !== 15
                            ? 'border-red-400/50 bg-red-50/40'
                            : imei2.length === 15
                            ? 'border-green-400/50 bg-green-50/40'
                            : 'border-white/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50'
                        }`}
                        placeholder="Enter 15-digit IMEI 2"
                        maxLength={15}
                        inputMode="numeric"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {imei2.length > 0 && `${imei2.length}/15 digits`}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Serial Number (optional)
                      </label>
                      <input
                        type="text"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && imei1.length === 15) {
                            e.preventDefault()
                            saveIMEI()
                          }
                        }}
                        className="w-full px-3 py-2 backdrop-blur-sm bg-white/60 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 focus:bg-white/80 transition-all"
                        placeholder="Enter Serial Number"
                      />
                    </div>
                  </>
                )}

                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowIMeIModal(false)
                      setSelectedCartItem(null)
                      setExpandedCartForIMEI([])
                      setImei1('')
                      setImei2('')
                      setSerialNumber('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveIMEI}
                    disabled={imei1.length !== 15}
                    className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all ${
                      imei1.length === 15
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:scale-105 backdrop-blur-sm border border-white/20'
                        : 'bg-gray-300/50 text-gray-500 cursor-not-allowed backdrop-blur-sm'
                    }`}
                  >
                    Save & Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (() => {
          const totalPaid = (parseFloat(cashAmount) || 0) + (parseFloat(mobileMoneyAmount) || 0)
          const remaining = cartTotal - totalPaid
          const isOverpaid = totalPaid > cartTotal
          const isFullyPaid = totalPaid >= cartTotal
          const hasPayment = totalPaid > 0
          
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-white rounded-lg max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Process Payment</h3>
                <div className="space-y-4">
                  {/* Total Amount Display */}
                  <div className="p-3 backdrop-blur-sm bg-white/40 rounded-xl border border-white/20">
                    <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{formatMoney(cartTotal)}</div>
                  </div>

                  {/* Cash Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cash Amount
                    </label>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === '' || parseFloat(val) >= 0) {
                          setCashAmount(val)
                        }
                      }}
                      className={`w-full px-3 py-2 backdrop-blur-sm bg-white/60 border rounded-xl transition-all ${
                        isOverpaid && parseFloat(cashAmount || 0) > 0 
                          ? 'border-red-400/50 bg-red-50/40' 
                          : 'border-white/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50'
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      autoFocus
                    />
                  </div>

                  {/* Mobile Money Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Money Amount
                    </label>
                    <input
                      type="number"
                      value={mobileMoneyAmount}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === '' || parseFloat(val) >= 0) {
                          setMobileMoneyAmount(val)
                        }
                      }}
                      className={`w-full px-3 py-2 backdrop-blur-sm bg-white/60 border rounded-xl transition-all ${
                        isOverpaid && parseFloat(mobileMoneyAmount || 0) > 0 
                          ? 'border-red-400/50 bg-red-50/40' 
                          : 'border-white/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50'
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && hasPayment && !isOverpaid) {
                          processPayment()
                        }
                      }}
                    />
                  </div>

                  {/* Payment Summary */}
                  <div className={`p-3 rounded-xl border backdrop-blur-sm ${
                    isOverpaid 
                      ? 'bg-red-50/60 border-red-300/30' 
                      : isFullyPaid 
                      ? 'bg-green-50/60 border-green-300/30'
                      : 'bg-blue-50/60 border-blue-300/30'
                  }`}>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Cash:</span>
                        <span className="font-semibold">{formatMoney(parseFloat(cashAmount) || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Mobile Money:</span>
                        <span className="font-semibold">{formatMoney(parseFloat(mobileMoneyAmount) || 0)}</span>
                      </div>
                      <div className="border-t border-gray-300 pt-2 mt-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Total Paid:</span>
                          <span className={isOverpaid ? 'text-red-600' : isFullyPaid ? 'text-green-600' : 'text-blue-600'}>
                            {formatMoney(totalPaid)}
                          </span>
                        </div>
                        {!isFullyPaid && (
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-600">Remaining:</span>
                            <span className="font-semibold text-orange-600">
                              {formatMoney(remaining)}
                            </span>
                          </div>
                        )}
                        {isOverpaid && (
                          <div className="mt-2 text-xs text-red-600 font-semibold">
                            ⚠️ Overpayment: {formatMoney(totalPaid - cartTotal)} - Please adjust amount
                          </div>
                        )}
                        {isFullyPaid && !isOverpaid && (
                          <div className="mt-2 text-xs text-green-600 font-semibold">
                            ✓ Payment Complete
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => {
                        setShowPaymentModal(false)
                        setCashAmount('')
                        setMobileMoneyAmount('')
                      }}
                      className="flex-1 px-4 py-2 backdrop-blur-sm bg-white/40 border border-white/30 rounded-xl hover:bg-white/60 font-medium transition-all hover:scale-105"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (isOverpaid) {
                          if (!confirm(`Payment amount (${formatMoney(totalPaid)}) exceeds total (${formatMoney(cartTotal)}) by ${formatMoney(totalPaid - cartTotal)}. Do you want to proceed anyway?`)) {
                            return
                          }
                        }
                        // Allow completing with no payment - show confirmation popup
                        if (!hasPayment) {
                          setShowUnpaidConfirm(true)
                          return
                        }
                        processPayment()
                      }}
                      className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 ${
                        isOverpaid
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg backdrop-blur-sm border border-white/20'
                          : !hasPayment
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg backdrop-blur-sm border border-white/20'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg backdrop-blur-sm border border-white/20'
                      }`}
                    >
                      {isOverpaid ? 'Override & Process' : !hasPayment ? 'Complete Without Payment' : 'Process Payment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Unpaid Confirmation Modal */}
        {showUnpaidConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-2xl border border-white/30 max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Confirm Unpaid Order</h3>
              </div>
              
              <div className="space-y-4">
                <div className="backdrop-blur-sm bg-orange-50/60 border border-orange-300/30 rounded-xl p-4">
                  <p className="text-sm text-orange-800 font-medium mb-3">
                    ⚠️ WARNING: This order will be marked as UNPAID
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold text-gray-900">{formatMoney(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Received:</span>
                      <span className="font-semibold text-red-600">{formatMoney(0)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-orange-200">
                      <span className="text-gray-600 font-medium">Remaining Balance:</span>
                      <span className="font-bold text-orange-700">{formatMoney(cartTotal)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  The customer will be able to complete payment later from the Sales History page.
                </p>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setShowUnpaidConfirm(false)
                      // Return to payment page - keep payment modal open
                    }}
                    className="flex-1 px-4 py-2 backdrop-blur-sm bg-white/40 border-2 border-white/30 rounded-xl hover:bg-white/60 font-medium text-gray-700 transition-all hover:scale-105"
                  >
                    Return to Payment
                  </button>
                  <button
                    onClick={() => {
                      setShowUnpaidConfirm(false)
                      processPayment()
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg hover:scale-105 font-semibold transition-all backdrop-blur-sm border border-white/20"
                  >
                    Confirm Unpaid
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barcode Scanner */}
        {showBarcodeScanner && (
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onClose={() => setShowBarcodeScanner(false)}
          />
        )}

        {/* Receipt Modal */}
        {showReceiptModal && lastSale && lastSale.status && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-2xl border border-white/30 max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-semibold">Sale Completed!</h3>
                <button
                  onClick={() => {
                    setShowReceiptModal(false)
                    setLastSale(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <div className="text-lg font-semibold text-green-900">
                    Total: {formatMoney(lastSale.total)}
                  </div>
                  <div className="text-sm text-green-700">
                    Status: {(lastSale.status || 'pending').toUpperCase()}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                      onClick={async () => {
                        try {
                          const saleStore = stores.find(s => s.id === lastSale.storeId)
                          await printReceipt(lastSale, {
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
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                  >
                    <Printer className="w-5 h-5" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowReceiptModal(false)
                      setLastSale(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>

                {lastSale.buyerPhone && (
                  <div className="pt-4 border-t">
                    <button
                      onClick={() => {
                        const message = `Receipt for Sale ${lastSale.id}. Total: ${formatMoney(lastSale.total)}. Thank you for your purchase!`
                        const smsLink = `sms:${lastSale.buyerPhone}?body=${encodeURIComponent(message)}`
                        window.location.href = smsLink
                      }}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Send SMS Receipt
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default POS

