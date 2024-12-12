import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token and get user data
      api.getProfile()
        .then(response => {
          setUser(response.data)
        })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const response = await api.login({ email, password })
    const { access, refresh } = response.data
    localStorage.setItem('token', access)
    localStorage.setItem('refreshToken', refresh)
    
    // Get user data
    const userResponse = await api.getProfile()
    setUser(userResponse.data)
    return userResponse.data
  }

  const register = async (userData) => {
    const response = await api.register(userData)
    const { access, refresh, user: newUser } = response.data
    localStorage.setItem('token', access)
    localStorage.setItem('refreshToken', refresh)
    setUser(newUser)
    return newUser
  }

  const updateUser = async (userData) => {
    const response = await api.updateProfile(userData)
    setUser(response.data)
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  const resetPassword = async (email) => {
    await api.resetPassword(email)
  }

  const deleteAccount = async () => {
    await api.deleteAccount()
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    register,
    resetPassword,
    updateUser,
    deleteAccount,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
