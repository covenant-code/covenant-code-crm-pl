import { createContext, useState, useCallback, useEffect } from 'react'

export const AuthContext = createContext(null)

const STORAGE_KEY = 'crm_auth'

const DEV_USER = {
  token:     'dev-bypass-token',
  userId:    1,
  email:     'admin@dev.local',
  firstName: 'Dev',
  lastName:  'Admin',
  role:      'ADMIN',
}

const isBypassMode = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    if (isBypassMode) return DEV_USER
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = useCallback((authResponse) => {
    if (!isBypassMode) localStorage.setItem(STORAGE_KEY, JSON.stringify(authResponse))
    setAuth(authResponse)
  }, [])

  const logout = useCallback(() => {
    if (isBypassMode) return
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('token')
    setAuth(null)
  }, [])

  // Синхронизируем token отдельно для apiClient interceptor
  useEffect(() => {
    if (auth?.token) {
      localStorage.setItem('token', auth.token)
    } else {
      localStorage.removeItem('token')
    }
  }, [auth])

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
