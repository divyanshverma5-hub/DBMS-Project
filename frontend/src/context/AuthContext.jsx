import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  // Restore authenticated session on page refresh
  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      const savedToken = localStorage.getItem('token')
      if (!savedToken) {
        if (isMounted) setLoading(false)
        return
      }

      try {
        const response = await authService.getMe()
        if (isMounted && response?.user) {
          setUser(response.user)
          setToken(savedToken)
        }
      } catch (err) {
        console.warn('Session restoration failed:', err.message)
        localStorage.removeItem('token')
        if (isMounted) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    restoreSession()

    // Listen for unauthorized 401 events from api.js
    const handleUnauthorized = () => {
      logout()
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      isMounted = false
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [logout])

  const login = async (loginIdentifier, password) => {
    const res = await authService.login({ login: loginIdentifier, password })
    if (res?.token && res?.user) {
      localStorage.setItem('token', res.token)
      setToken(res.token)
      setUser(res.user)
      return res.user
    }
    throw new Error('Invalid login response from server')
  }

  const register = async (userData) => {
    const res = await authService.register(userData)
    if (res?.token && res?.user) {
      localStorage.setItem('token', res.token)
      setToken(res.token)
      setUser(res.user)
      return res.user
    }
    throw new Error('Invalid registration response from server')
  }

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null))
  }

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
