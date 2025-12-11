// Firebase-enabled DataContext
// Rename this file to DataContext.js after configuring Firebase
// OR use the useFirebase hook in the existing DataContext

import { createContext, useContext, useState, useEffect } from 'react'
import { formatCurrency, formatCurrencyGHS } from '../utils/currency'
import * as firebaseService from '../services/firebaseService'

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
  const [loading, setLoading] = useState(true)

  // Initialize and load data from Firebase
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        setLoading(true)
        
        // Load settings
        const appSettings = await firebaseService.settingsService.get()
        setSettings(appSettings)
        setCurrency(appSettings.currency || 'USD')

        // Load current store ID
        const storeId = await firebaseService.currentStoreService.get()
        
        // Load stores
        const allStores = await firebaseService.storesService.getAll()
        
        if (allStores.length === 0) {
          // Create default store
          const defaultStore = {
            name: 'Main Store',
            address: '',
            createdAt: new Date().toISOString()
          }
          const newStore = await firebaseService.storesService.create(defaultStore)
          setStores([newStore])
          setCurrentStoreId(newStore.id)
          await firebaseService.currentStoreService.set(newStore.id)
        } else {
          setStores(allStores)
          setCurrentStoreId(storeId || allStores[0].id)
        }

        // Set up real-time subscriptions
        firebaseService.storesService.subscribe((updatedStores) => {
          setStores(updatedStores)
        })

        firebaseService.settingsService.subscribe((updatedSettings) => {
          setSettings(updatedSettings)
          setCurrency(updatedSettings.currency || 'USD')
        })

        setLoading(false)
      } catch (error) {
        console.error('Firebase initialization error:', error)
        setLoading(false)
      }
    }

    initializeFirebase()
  }, [])

  // Load store-specific data when store changes
  useEffect(() => {
    if (!currentStoreId) return

    const loadStoreData = async () => {
      try {
        const [inventoryData, salesData, customersData] = await Promise.all([
          firebaseService.inventoryService.getAll(currentStoreId),
          firebaseService.salesService.getAll(currentStoreId),
          firebaseService.customersService.getAll(currentStoreId)
        ])

        setInventory(inventoryData)
        setSales(salesData)
        setCustomers(customersData)

        // Set up real-time subscriptions
        const unsubInventory = firebaseService.inventoryService.subscribe(
          currentStoreId,
          (updatedInventory) => setInventory(updatedInventory)
        )
        const unsubSales = firebaseService.salesService.subscribe(
          currentStoreId,
          (updatedSales) => setSales(updatedSales)
        )
        const unsubCustomers = firebaseService.customersService.subscribe(
          currentStoreId,
          (updatedCustomers) => setCustomers(updatedCustomers)
        )

        return () => {
          unsubInventory()
          unsubSales()
          unsubCustomers()
        }
      } catch (error) {
        console.error('Error loading store data:', error)
      }
    }

    loadStoreData()
  }, [currentStoreId])

  // Save inventory
  const saveInventory = async (items) => {
    if (!currentStoreId) return
    setInventory(items)
    // Note: For batch updates, you might want to optimize this
    // For now, we rely on real-time sync from individual create/update operations
  }

  // Save sales
  const saveSales = async (salesData) => {
    if (!currentStoreId) return
    setSales(salesData)
  }

  // Save customers
  const saveCustomers = async (customersData) => {
    if (!currentStoreId) return
    setCustomers(customersData)
  }

  // Save settings
  const saveSettings = async (newSettings) => {
    await firebaseService.settingsService.update(newSettings)
    setSettings(newSettings)
    setCurrency(newSettings.currency || 'USD')
  }

  // Add to inventory
  const addInventoryItem = async (item) => {
    if (!currentStoreId) return null
    const newItem = {
      ...item,
      createdAt: new Date().toISOString()
    }
    return await firebaseService.inventoryService.create(currentStoreId, newItem)
  }

  // Update inventory item
  const updateInventoryItem = async (id, updates) => {
    if (!currentStoreId) return
    await firebaseService.inventoryService.update(currentStoreId, id, updates)
  }

  // Delete inventory item
  const deleteInventoryItem = async (id) => {
    if (!currentStoreId) return
    await firebaseService.inventoryService.delete(currentStoreId, id)
  }

  // Add sale
  const addSale = async (sale) => {
    if (!currentStoreId) return null
    const newSale = {
      ...sale,
      storeId: currentStoreId,
      createdAt: new Date().toISOString()
    }
    
    const createdSale = await firebaseService.salesService.create(currentStoreId, newSale)
    
    // Update inventory stock
    const itemQuantities = {}
    sale.items.forEach(item => {
      if (item.id) {
        itemQuantities[item.id] = (itemQuantities[item.id] || 0) + (item.quantity || 1)
      }
    })
    
    for (const [itemId, quantity] of Object.entries(itemQuantities)) {
      const inventoryItem = inventory.find(inv => inv.id === itemId)
      if (inventoryItem) {
        await updateInventoryItem(itemId, {
          stock: Math.max(0, inventoryItem.stock - quantity)
        })
      }
    }
    
    return createdSale
  }

  // Update sale payment
  const updateSalePayment = async (saleId, paymentData) => {
    if (!currentStoreId) return
    const sale = sales.find(s => s.id === saleId)
    if (!sale) return

    const newPaidAmount = (sale.paidAmount || 0) + paymentData.amount
    let newStatus = 'partial'
    if (newPaidAmount >= sale.total) {
      newStatus = 'paid'
    } else if (newPaidAmount === 0) {
      newStatus = 'unpaid'
    }

    let finalPaymentMethod = sale.paymentMethod
    if (newPaidAmount >= sale.total || sale.status === 'unpaid') {
      finalPaymentMethod = paymentData.paymentMethod
    } else if (sale.paymentMethod !== paymentData.paymentMethod && sale.paymentMethod !== 'Split Payment') {
      finalPaymentMethod = 'Split Payment'
    }

    const existingCash = sale.cashAmount || 0
    const existingMobileMoney = sale.mobileMoneyAmount || 0
    const newCash = paymentData.cashAmount || 0
    const newMobileMoney = paymentData.mobileMoneyAmount || 0

    const updates = {
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

    await firebaseService.salesService.update(currentStoreId, saleId, updates)
  }

  // Delete sale
  const deleteSale = async (id) => {
    if (!currentStoreId) return
    const sale = sales.find(s => s.id === id)
    if (sale) {
      // Restore inventory
      for (const item of sale.items) {
        const inventoryItem = inventory.find(inv => inv.id === item.id)
        if (inventoryItem) {
          await updateInventoryItem(item.id, {
            stock: inventoryItem.stock + item.quantity
          })
        }
      }
    }
    await firebaseService.salesService.delete(currentStoreId, id)
  }

  // Add customer
  const addCustomer = async (customer) => {
    if (!currentStoreId) return null
    const existing = customers.find(c => c.phone === customer.phone)
    if (existing) {
      const updates = { ...customer }
      await firebaseService.customersService.update(currentStoreId, existing.id, updates)
      return { ...existing, ...updates }
    }
    const newCustomer = {
      ...customer,
      createdAt: new Date().toISOString()
    }
    return await firebaseService.customersService.create(currentStoreId, newCustomer)
  }

  // Update customer
  const updateCustomer = async (id, updates) => {
    if (!currentStoreId) return
    await firebaseService.customersService.update(currentStoreId, id, updates)
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
  const addStore = async (storeData) => {
    const newStore = {
      ...storeData,
      createdAt: new Date().toISOString()
    }
    return await firebaseService.storesService.create(newStore)
  }

  const updateStore = async (id, updates) => {
    await firebaseService.storesService.update(id, updates)
  }

  const changeStore = async (storeId) => {
    await firebaseService.currentStoreService.set(storeId)
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
    loading,
    
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading APPLE BAZAAR...</p>
        </div>
      </div>
    )
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

