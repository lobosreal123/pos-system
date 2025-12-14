import { createContext, useContext, useState, useEffect } from 'react'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, collection, getDocs, query, updateDoc, deleteDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingUsers, setPendingUsers] = useState([])

  // Register new user (with pending approval)
  const register = async (email, password, name) => {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update profile with display name
      await updateProfile(userCredential.user, { displayName: name })
      
      // Create user document in Firestore with pending status
      const userDoc = {
        email: email,
        name: name,
        role: 'cashier',
        status: 'pending', // pending, approved, rejected
        createdAt: new Date().toISOString(),
        stores: [],
        settings: {
          currency: 'USD',
          adminPassword: 'admin123'
        }
      }
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userDoc)
      
      // Sign out the user until approved
      await signOut(auth)
      
      return { 
        success: true, 
        message: 'Registration successful! Please wait for admin approval.'
      }
    } catch (error) {
      let errorMessage = 'Registration failed'
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already registered'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      }
      return { success: false, error: errorMessage }
    }
  }

  // Login with email and password
  const login = async (email, password) => {
    try {
      // Step 1: Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Step 2: Get user data from Firestore (with retry for fresh data)
      let userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
      
      if (!userDoc.exists()) {
        await signOut(auth)
        return { success: false, error: 'User data not found' }
      }
      
      let userData = userDoc.data()
      
      // Step 3: Auto-approve ONLY for the very first admin user (system initialization)
      // Check if this is the first user ever (no approved users exist)
      if (userData.role === 'admin' && userData.status !== 'approved') {
        const allUsers = await getAllUsers()
        const approvedCount = allUsers.filter(u => u.status === 'approved').length
        const adminExists = allUsers.some(u => u.role === 'admin' && u.status === 'approved')
        
        // Only auto-approve if absolutely no approved users exist
        if (approvedCount === 0 && !adminExists) {
          await updateDoc(doc(db, 'users', userCredential.user.uid), {
            status: 'approved'
          })
          // Refresh user data after update
          userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
          userData = userDoc.data()
        }
      }
      
      // Step 4: Check approval status
      if (userData.status !== 'approved') {
        await signOut(auth)
        if (userData.status === 'pending') {
          return { success: false, error: 'Your account is pending approval. Please wait for an admin to approve your account.' }
        } else if (userData.status === 'rejected') {
          return { success: false, error: 'Your account has been rejected. Please contact an administrator.' }
        }
        return { success: false, error: 'Your account is not approved yet.' }
      }

      // Step 4b: Check if account is expired
      if (userData.expirationDate) {
        const expirationDate = new Date(userData.expirationDate)
        if (expirationDate < new Date()) {
          await signOut(auth)
          return { success: false, error: 'Your account has expired. Please contact an administrator.' }
        }
      }
      
      // Step 5: Create user object and set current user immediately
      const user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName || userData?.name || 'User',
        role: userData?.role || 'cashier', // Preserve existing role from database
        status: userData?.status
      }
      
      // IMPORTANT: Set current user immediately after successful login
      setCurrentUser(user)
      
      return { success: true, user }
    } catch (error) {
      let errorMessage = 'Login failed'
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later'
      }
      return { success: false, error: errorMessage }
    }
  }

  // Logout
  const logout = async () => {
    try {
      await signOut(auth)
      setCurrentUser(null)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Update user profile
  const updateUser = async (updates) => {
    try {
      if (!currentUser) return { success: false, error: 'No user logged in' }
      
      await setDoc(doc(db, 'users', currentUser.uid), updates, { merge: true })
      setCurrentUser({ ...currentUser, ...updates })
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Admin: Get all pending users
  const getPendingUsers = async () => {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef)
      const snapshot = await getDocs(q)
      
      const users = []
      snapshot.forEach(doc => {
        const data = doc.data()
        if (data.status === 'pending' || data.status === 'rejected') {
          users.push({
            uid: doc.id,
            ...data
          })
        }
      })
      
      setPendingUsers(users)
      return users
    } catch (error) {
      console.error('Error fetching pending users:', error)
      return []
    }
  }

  // Admin: Get all users
  const getAllUsers = async () => {
    try {
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      
      const users = []
      snapshot.forEach(doc => {
        users.push({
          uid: doc.id,
          ...doc.data()
        })
      })
      
      return users
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  }

  // Admin: Approve user (keep existing role, don't make admin)
  const approveUser = async (userId) => {
    try {
      // Get user data first to preserve their role
      const userDoc = await getDoc(doc(db, 'users', userId))
      const userData = userDoc.data()
      
      // Get current role or default to cashier (never admin)
      const currentRole = userData?.role || 'cashier'
      
      // Only approve, explicitly keep as cashier (never make admin)
      // Use merge to preserve other fields
      await updateDoc(doc(db, 'users', userId), {
        status: 'approved',
        role: currentRole === 'admin' ? 'cashier' : currentRole, // If somehow admin, change to cashier
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser?.uid
      })
      await getPendingUsers() // Refresh list
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Admin: Reject user
  const rejectUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: currentUser?.uid
      })
      await getPendingUsers() // Refresh list
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Admin: Create user manually
  // Note: This creates both Firebase Auth user and Firestore document
  // The created user will be automatically signed out (they need to login themselves)
  const createUser = async (email, password, name, role = 'cashier', expirationDate = null) => {
    try {
      // Store current admin user email before creating new user
      const adminEmail = currentUser?.email
      const adminPassword = null // We can't store password, user needs to re-login if signed out
      
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update profile with display name
      await updateProfile(userCredential.user, { displayName: name })
      
      // Create user document in Firestore
      const userDoc = {
        email: email,
        name: name,
        role: role === 'admin' ? 'cashier' : role, // Never allow creating admin (only one admin)
        status: 'approved', // Auto-approve manually created users
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.uid,
        expirationDate: expirationDate || null, // Optional expiration date
        stores: [],
        settings: {
          currency: 'USD',
          adminPassword: 'admin123'
        }
      }
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userDoc)
      
      // Sign out the newly created user immediately (they need to login themselves)
      await signOut(auth)
      
      // Note: Admin will be signed out too
      // In production, use Firebase Admin SDK on backend to avoid this
      // For now, admin will need to login again after creating a user
      
      return { 
        success: true, 
        user: {
          uid: userCredential.user.uid,
          ...userDoc
        },
        message: 'User created successfully. Please login again to continue.'
      }
    } catch (error) {
      let errorMessage = 'User creation failed'
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already registered'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      }
      return { success: false, error: errorMessage }
    }
  }

  // Admin: Delete user (deletes Firestore document)
  // Note: To delete from Firebase Auth, you need Admin SDK on backend
  const deleteUser = async (userId) => {
    try {
      // Prevent deleting yourself
      if (userId === currentUser?.uid) {
        return { success: false, error: 'Cannot delete your own account' }
      }
      
      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', userId))
      
      // Note: The Firebase Auth user will still exist
      // To fully delete, you'd need Firebase Admin SDK on backend
      
      await getPendingUsers() // Refresh list
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Admin: Update user expiration date
  const updateUserExpiration = async (userId, expirationDate) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        expirationDate: expirationDate || null,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.uid
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Check if user account is expired
  const isUserExpired = (userData) => {
    if (!userData.expirationDate) return false
    const expiration = new Date(userData.expirationDate)
    return expiration < new Date()
  }

  // Listen to auth state changes (for page refresh, etc.)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get fresh user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          
          if (!userDoc.exists()) {
            setCurrentUser(null)
            setLoading(false)
            return
          }
          
          const userData = userDoc.data()
          
          // Auto-approve ONLY for the very first admin user (system initialization)
          if (userData.role === 'admin' && userData.status !== 'approved') {
            const allUsers = await getAllUsers()
            const approvedCount = allUsers.filter(u => u.status === 'approved').length
            const adminExists = allUsers.some(u => u.role === 'admin' && u.status === 'approved')
            
            // Only auto-approve if absolutely no approved users exist
            if (approvedCount === 0 && !adminExists) {
              await updateDoc(doc(db, 'users', firebaseUser.uid), {
                status: 'approved'
              })
              // Refresh user data
              const updatedDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
              userData = updatedDoc.data()
            }
          }
          
          // Check if account is expired
          if (userData.expirationDate) {
            const expirationDate = new Date(userData.expirationDate)
            if (expirationDate < new Date()) {
              // Account expired - sign them out
              await signOut(auth)
              setCurrentUser(null)
              setLoading(false)
              return
            }
          }

          // Only set current user if approved - NEVER change role
          if (userData.status === 'approved') {
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || userData?.name || 'User',
              role: userData?.role || 'cashier', // Preserve existing role from database
              status: userData?.status
            })
          } else {
            // User not approved - sign them out
            await signOut(auth)
            setCurrentUser(null)
          }
        } catch (error) {
          console.error('Error loading user data:', error)
          setCurrentUser(null)
        }
      } else {
        // No user authenticated
        setCurrentUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    loading,
    pendingUsers,
    register,
    login,
    logout,
    updateUser,
    getPendingUsers,
    getAllUsers,
    approveUser,
    rejectUser,
    createUser,
    deleteUser,
    updateUserExpiration,
    isUserExpired
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
