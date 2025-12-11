import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore'
import { db, auth } from '../config/firebase'

// Helper to get current user ID
const getUserId = () => {
  // Try to get from Firebase Auth first
  if (auth.currentUser) {
    return auth.currentUser.uid
  }
  
  // Fallback to localStorage (for initial setup or anonymous users)
  // You can set this when user logs in
  let userId = localStorage.getItem('firebaseUserId')
  
  if (!userId) {
    // Create a temporary user ID for initial setup
    // This will be replaced with actual Firebase Auth user ID
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('firebaseUserId', userId)
  }
  
  return userId
}

// Stores Collection
export const storesService = {
  getAll: async () => {
    const userId = getUserId()
    const storesRef = collection(db, 'users', userId, 'stores')
    const snapshot = await getDocs(storesRef)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  get: async (id) => {
    const userId = getUserId()
    const storeRef = doc(db, 'users', userId, 'stores', id)
    const storeSnap = await getDoc(storeRef)
    return storeSnap.exists() ? { id: storeSnap.id, ...storeSnap.data() } : null
  },

  create: async (storeData) => {
    const userId = getUserId()
    const storesRef = collection(db, 'users', userId, 'stores')
    const docRef = await addDoc(storesRef, {
      ...storeData,
      createdAt: new Date().toISOString()
    })
    return { id: docRef.id, ...storeData }
  },

  update: async (id, updates) => {
    const userId = getUserId()
    const storeRef = doc(db, 'users', userId, 'stores', id)
    await updateDoc(storeRef, updates)
  },

  subscribe: (callback) => {
    const userId = getUserId()
    const storesRef = collection(db, 'users', userId, 'stores')
    return onSnapshot(storesRef, (snapshot) => {
      const stores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(stores)
    })
  }
}

// Inventory Collection (per store)
export const inventoryService = {
  getAll: async (storeId) => {
    const userId = getUserId()
    const inventoryRef = collection(db, 'users', userId, 'stores', storeId, 'inventory')
    const snapshot = await getDocs(inventoryRef)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  create: async (storeId, itemData) => {
    const userId = getUserId()
    const inventoryRef = collection(db, 'users', userId, 'stores', storeId, 'inventory')
    const docRef = await addDoc(inventoryRef, {
      ...itemData,
      createdAt: new Date().toISOString()
    })
    return { id: docRef.id, ...itemData }
  },

  update: async (storeId, itemId, updates) => {
    const userId = getUserId()
    const itemRef = doc(db, 'users', userId, 'stores', storeId, 'inventory', itemId)
    await updateDoc(itemRef, updates)
  },

  delete: async (storeId, itemId) => {
    const userId = getUserId()
    const itemRef = doc(db, 'users', userId, 'stores', storeId, 'inventory', itemId)
    await deleteDoc(itemRef)
  },

  subscribe: (storeId, callback) => {
    const userId = getUserId()
    const inventoryRef = collection(db, 'users', userId, 'stores', storeId, 'inventory')
    return onSnapshot(inventoryRef, (snapshot) => {
      const inventory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(inventory)
    })
  }
}

// Sales Collection (per store)
export const salesService = {
  getAll: async (storeId) => {
    const userId = getUserId()
    const salesRef = collection(db, 'users', userId, 'stores', storeId, 'sales')
    const snapshot = await getDocs(salesRef)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  create: async (storeId, saleData) => {
    const userId = getUserId()
    const salesRef = collection(db, 'users', userId, 'stores', storeId, 'sales')
    const docRef = await addDoc(salesRef, {
      ...saleData,
      createdAt: new Date().toISOString()
    })
    return { id: docRef.id, ...saleData }
  },

  update: async (storeId, saleId, updates) => {
    const userId = getUserId()
    const saleRef = doc(db, 'users', userId, 'stores', storeId, 'sales', saleId)
    await updateDoc(saleRef, updates)
  },

  delete: async (storeId, saleId) => {
    const userId = getUserId()
    const saleRef = doc(db, 'users', userId, 'stores', storeId, 'sales', saleId)
    await deleteDoc(saleRef)
  },

  subscribe: (storeId, callback) => {
    const userId = getUserId()
    const salesRef = collection(db, 'users', userId, 'stores', storeId, 'sales')
    return onSnapshot(salesRef, (snapshot) => {
      const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(sales)
    })
  }
}

// Customers Collection (per store)
export const customersService = {
  getAll: async (storeId) => {
    const userId = getUserId()
    const customersRef = collection(db, 'users', userId, 'stores', storeId, 'customers')
    const snapshot = await getDocs(customersRef)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  create: async (storeId, customerData) => {
    const userId = getUserId()
    const customersRef = collection(db, 'users', userId, 'stores', storeId, 'customers')
    const docRef = await addDoc(customersRef, {
      ...customerData,
      createdAt: new Date().toISOString()
    })
    return { id: docRef.id, ...customerData }
  },

  update: async (storeId, customerId, updates) => {
    const userId = getUserId()
    const customerRef = doc(db, 'users', userId, 'stores', storeId, 'customers', customerId)
    await updateDoc(customerRef, updates)
  },

  subscribe: (storeId, callback) => {
    const userId = getUserId()
    const customersRef = collection(db, 'users', userId, 'stores', storeId, 'customers')
    return onSnapshot(customersRef, (snapshot) => {
      const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(customers)
    })
  }
}

// Settings Collection (global per user)
export const settingsService = {
  get: async () => {
    const userId = getUserId()
    const settingsRef = doc(db, 'users', userId, 'settings', 'app')
    const settingsSnap = await getDoc(settingsRef)
    return settingsSnap.exists() ? settingsSnap.data() : { currency: 'USD', adminPassword: 'admin123' }
  },

  update: async (settings) => {
    const userId = getUserId()
    const settingsRef = doc(db, 'users', userId, 'settings', 'app')
    await setDoc(settingsRef, settings, { merge: true })
  },

  subscribe: (callback) => {
    const userId = getUserId()
    const settingsRef = doc(db, 'users', userId, 'settings', 'app')
    return onSnapshot(settingsRef, (doc) => {
      callback(doc.exists() ? doc.data() : { currency: 'USD', adminPassword: 'admin123' })
    })
  }
}

// Current Store ID (per user)
export const currentStoreService = {
  get: async () => {
    const userId = getUserId()
    const storeIdRef = doc(db, 'users', userId, 'settings', 'currentStore')
    const storeIdSnap = await getDoc(storeIdRef)
    return storeIdSnap.exists() ? storeIdSnap.data().storeId : null
  },

  set: async (storeId) => {
    const userId = getUserId()
    const storeIdRef = doc(db, 'users', userId, 'settings', 'currentStore')
    await setDoc(storeIdRef, { storeId })
  }
}

