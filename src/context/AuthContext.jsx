import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('examUser')) } catch { return null }
  })

  const login = (userData, token) => {
    const u = { ...userData, token }
    setUser(u)
    localStorage.setItem('examUser', JSON.stringify(u))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('examUser')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)