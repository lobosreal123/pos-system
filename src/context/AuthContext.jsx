import { createContext, useContext, useState, useEffect } from 'react'

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
  const [users, setUsers] = useState([])

  // Load users and current session from localStorage
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('cashiers') || '[]')
    const storedSession = localStorage.getItem('currentSession')
    
    if (storedUsers.length === 0) {
      // Create default admin user
      const adminUser = {
        id: 'admin-1',
        username: 'admin',
        password: 'admin123',
        name: 'Admin',
        role: 'admin',
        createdAt: new Date().toISOString()
      }
      storedUsers.push(adminUser)
      localStorage.setItem('cashiers', JSON.stringify(storedUsers))
    }
    
    setUsers(storedUsers)
    
    if (storedSession) {
      const sessionData = JSON.parse(storedSession)
      const user = storedUsers.find(u => u.id === sessionData.userId)
      if (user) {
        setCurrentUser(user)
      }
    }
  }, [])

  const login = (username, password) => {
    const user = users.find(
      u => u.username === username && u.password === password
    )
    if (user) {
      setCurrentUser(user)
      localStorage.setItem('currentSession', JSON.stringify({
        userId: user.id,
        timestamp: new Date().toISOString()
      }))
      return { success: true, user }
    }
    return { success: false, error: 'Invalid username or password' }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentSession')
  }

  const addUser = (userData) => {
    if (users.length >= 20) {
      return { success: false, error: 'Maximum 20 users allowed' }
    }
    const newUser = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'cashier',
      createdAt: new Date().toISOString()
    }
    const updated = [...users, newUser]
    localStorage.setItem('cashiers', JSON.stringify(updated))
    setUsers(updated)
    return { success: true, user: newUser }
  }

  const updateUser = (id, updates) => {
    const updated = users.map(u =>
      u.id === id ? { ...u, ...updates } : u
    )
    localStorage.setItem('cashiers', JSON.stringify(updated))
    setUsers(updated)
    
    if (currentUser && currentUser.id === id) {
      setCurrentUser(updated.find(u => u.id === id))
    }
  }

  const deleteUser = (id) => {
    if (currentUser && currentUser.id === id) {
      return { success: false, error: 'Cannot delete current user' }
    }
    const updated = users.filter(u => u.id !== id)
    localStorage.setItem('cashiers', JSON.stringify(updated))
    setUsers(updated)
    return { success: true }
  }

  const value = {
    currentUser,
    users,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

