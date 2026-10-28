import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext.js'

// Как се ползва във всеки компонент:
//   const { user, login, logout } = useAuth()
// user е null, ако никой не е логнат.
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth трябва да се ползва вътре в <AuthProvider>')
  }
  return context
}
