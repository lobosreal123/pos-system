import { createContext, useContext, useState, useEffect } from 'react'
import { formatCurrency, formatCurrencyGHS } from '../utils/currency'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [stores, setStores] = useState([])
  const [currentStoreId, setCurrentStoreId] = useState(null)
  const [inventory, setInventory] = useState([])
  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [currency, setCurrency] = useState('USD')
  const [settings, setSettings] = useState({
    currency: 'USD',
    adminPassword: 'admin123'
  })

  // Initialize default store if none exists
  useEffect(() => {
    const storedStores = JSON.parse(localStorage.getItem('stores') || '[]')
    const storedCurrentStoreId = localStorage.getItem('currentStoreId')
    
    if (storedStores.length === 0) {
      const defaultStore = {
        id: 'store-1',
        name: 'Main Store',
        address: '',
        createdAt: new Date().toISOString()
      }
      storedStores.push(defaultStore)
      localStorage.setItem('stores', JSON.stringify(storedStores))
      localStorage.setItem('currentStoreId', defaultStore.id)
      setStores([defaultStore])
      setCurrentStoreId(defaultStore.id)
    } else {
      setStores(storedStores)
      setCurrentStoreId(storedCurrentStoreId || storedStores[0].id)
    }
  }, [])

  // Load data from localStorage when store changes
  useEffect(() => {
    if (currentStoreId) {
      const storeInventory = JSON.parse(
        localStorage.getItem(`inventory-${currentStoreId}`) || '[]'
      )
      const storeSales = JSON.parse(
        localStorage.getItem(`sales-${currentStoreId}`) || '[]'
      )
      const storeCustomers = JSON.parse(
        localStorage.getItem(`customers-${currentStoreId}`) || '[]'
      )
      
      setInventory(storeInventory)
      setSales(storeSales)
      setCustomers(storeCustomers)
    }
  }, [currentStoreId])

  // Load settings
  useEffect(() => {
    const storedSettings = JSON.parse(localStorage.getItem('settings') || '{}')
    const mergedSettings = { ...settings, ...storedSettings }
    setSettings(mergedSettings)
    // Ensure currency is set from stored settings or default to USD
    if (mergedSettings.currency) {
      setCurrency(mergedSettings.currency)
    } else {
      setCurrency('USD')
    }
  }, [])

  // Save inventory
  const saveInventory = (items) => {
    if (currentStoreId) {
      localStorage.setItem(`inventory-${currentStoreId}`, JSON.stringify(items))
      setInventory(items)
    }
  }

  // Save sales
  const saveSales = (salesData) => {
    if (currentStoreId) {
      localStorage.setItem(`sales-${currentStoreId}`, JSON.stringify(salesData))
      setSales(salesData)
    }
  }

  // Save customers
  const saveCustomers = (customersData) => {
    if (currentStoreId) {
      localStorage.setItem(`customers-${currentStoreId}`, JSON.stringify(customersData))
      setCustomers(customersData)
    }
  }

  // Save settings
  const saveSettings = (newSettings) => {
    const updated = { ...settings, ...newSettings }
    localStorage.setItem('settings', JSON.stringify(updated))
    setSettings(updated)
    setCurrency(updated.currency || 'USD')
  }

  // Add to inventory
  const addInventoryItem = (item) => {
    const newItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    const updated = [...inventory, newItem]
    saveInventory(updated)
    return newItem
  }

  // Update inventory item
  const updateInventoryItem = (id, updates) => {
    const updated = inventory.map(item =>
      item.id === id ? { ...item, ...updates } : item
    )
    saveInventory(updated)
  }

  // Delete inventory item
  const deleteInventoryItem = (id) => {
    const updated = inventory.filter(item => item.id !== id)
    saveInventory(updated)
  }

  // Add sale
  const addSale = (sale) => {
    const newSale = {
      ...sale,
      id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      storeId: currentStoreId,
      createdAt: new Date().toISOString()
    }
    const updated = [...sales, newSale]
    saveSales(updated)
    
    // Update inventory stock - group by item id to handle expanded items (multiple IMEIs)
    const itemQuantities = {}
    sale.items.forEach(item => {
      if (item.id) {
        itemQuantities[item.id] = (itemQuantities[item.id] || 0) + (item.quantity || 1)
      }
    })
    
    // Deduct stock for each unique item
    Object.keys(itemQuantities).forEach(itemId => {
      const inventoryItem = inventory.find(inv => inv.id === itemId)
      if (inventoryItem) {
        updateInventoryItem(itemId, {
          stock: Math.max(0, inventoryItem.stock - itemQuantities[itemId])
        })
      }
    })
    
    return newSale
  }

  // Update sale payment
  const updateSalePayment = (saleId, paymentData) => {
    const updated = sales.map(sale => {
      if (sale.id === saleId) {
        const newPaidAmount = (sale.paidAmount || 0) + paymentData.amount
        let newStatus = 'partial'
        if (newPaidAmount >= sale.total) {
          newStatus = 'paid'
        } else if (newPaidAmount === 0) {
          newStatus = 'unpaid'
        }
        
        // Update payment method - if split payment, keep it or update based on what's being paid
        let finalPaymentMethod = sale.paymentMethod
        if (newPaidAmount >= sale.total || sale.status === 'unpaid') {
          // First payment or full payment - use the new method
          finalPaymentMethod = paymentData.paymentMethod
        } else if (sale.paymentMethod !== paymentData.paymentMethod && sale.paymentMethod !== 'Split Payment') {
          // Different method being used - mark as split
          finalPaymentMethod = 'Split Payment'
        }
        
        // Accumulate cash and mobile money amounts
        const existingCash = sale.cashAmount || 0
        const existingMobileMoney = sale.mobileMoneyAmount || 0
        const newCash = paymentData.cashAmount || 0
        const newMobileMoney = paymentData.mobileMoneyAmount || 0
        
        return {
          ...sale,
          paidAmount: newPaidAmount >= sale.total ? sale.total : newPaidAmount,
          status: newStatus,
          paymentMethod: finalPaymentMethod,
          cashAmount: existingCash + newCash,
          mobileMoneyAmount: existingMobileMoney + newMobileMoney,
          paymentHistory: [
            ...(sale.paymentHistory || []),
            {
              amount: paymentData.amount,
              method: paymentData.paymentMethod,
              cashAmount: newCash,
              mobileMoneyAmount: newMobileMoney,
              date: new Date().toISOString()
            }
          ]
        }
      }
      return sale
    })
    saveSales(updated)
  }

  // Delete sale
  const deleteSale = (id) => {
    const sale = sales.find(s => s.id === id)
    if (sale) {
      // Restore inventory
      sale.items.forEach(item => {
        const inventoryItem = inventory.find(inv => inv.id === item.id)
        if (inventoryItem) {
          updateInventoryItem(item.id, {
            stock: inventoryItem.stock + item.quantity
          })
        }
      })
    }
    const updated = sales.filter(s => s.id !== id)
    saveSales(updated)
  }

  // Add customer
  const addCustomer = (customer) => {
    const existing = customers.find(c => c.phone === customer.phone)
    if (existing) {
      const updated = customers.map(c =>
        c.id === existing.id ? { ...c, ...customer } : c
      )
      saveCustomers(updated)
      return existing
    }
    const newCustomer = {
      ...customer,
      id: `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    const updated = [...customers, newCustomer]
    saveCustomers(updated)
    return newCustomer
  }

  // Update customer
  const updateCustomer = (id, updates) => {
    const updated = customers.map(c =>
      c.id === id ? { ...c, ...updates } : c
    )
    saveCustomers(updated)
  }

  // Get inventory value
  const getInventoryValue = () => {
    return inventory.reduce((total, item) => {
      return total + (item.price * item.stock)
    }, 0)
  }

  // Get today's revenue
  const getTodaysRevenue = () => {
    const today = new Date().toISOString().split('T')[0]
    return sales
      .filter(sale => sale.createdAt.startsWith(today) && sale.status === 'paid')
      .reduce((total, sale) => total + sale.total, 0)
  }

  // Get total revenue
  const getTotalRevenue = () => {
    return sales
      .filter(sale => sale.status === 'paid')
      .reduce((total, sale) => total + sale.total, 0)
  }

  // Get unpaid orders
  const getUnpaidOrders = () => {
    return sales.filter(sale => sale.status !== 'paid')
  }

  // Format currency based on settings
  const formatMoney = (amount) => {
    return currency === 'GHS' ? formatCurrencyGHS(amount) : formatCurrency(amount)
  }

  // Store management
  const addStore = (storeData) => {
    const newStore = {
      ...storeData,
      id: `store-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    const updated = [...stores, newStore]
    localStorage.setItem('stores', JSON.stringify(updated))
    setStores(updated)
    return newStore
  }

  const updateStore = (id, updates) => {
    const updated = stores.map(s =>
      s.id === id ? { ...s, ...updates } : s
    )
    localStorage.setItem('stores', JSON.stringify(updated))
    setStores(updated)
  }

  const changeStore = (storeId) => {
    localStorage.setItem('currentStoreId', storeId)
    setCurrentStoreId(storeId)
  }

  const value = {
    // State
    stores,
    currentStoreId,
    inventory,
    sales,
    customers,
    currency,
    settings,
    
    // Actions
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addSale,
    updateSalePayment,
    deleteSale,
    addCustomer,
    updateCustomer,
    saveSettings,
    formatMoney,
    getInventoryValue,
    getTodaysRevenue,
    getTotalRevenue,
    getUnpaidOrders,
    addStore,
    updateStore,
    changeStore
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

