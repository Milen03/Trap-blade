import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext.js'
import * as authService from '../services/authService.js'

// Обвива цялото приложение (виж main.jsx) и държи информацията кой е логнат.
function AuthProvider({ children }) {
  // null -> никой не е логнат; обект -> логнатият потребител.
  const [user, setUser] = useState(null)
  // true, докато питаме сървъра дали вече има активна сесия.
  const [isLoading, setIsLoading] = useState(true)

  // При първо зареждане на сайта: токенът е в httpOnly бисквитка, която JavaScript не може
  // да прочете. Затова питаме сървъра "кой съм аз?" — ако бисквитката е валидна, връща потребителя.
  useEffect(() => {
    let ignore = false

    authService
      .getProfile()
      .then((profile) => {
        if (!ignore) setUser(profile)
      })
      .catch(() => {
        // 401 тук е нормално — просто не си логнат.
        if (!ignore) setUser(null)
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })

    // В development React (StrictMode) пуска ефекта два пъти — пренебрегваме първия отговор.
    return () => {
      ignore = true
    }
  }, [])

  const value = useMemo(() => {
    // Изпълнява заявката и запомня потребителя, който сървърът върне.
    async function saveUser(promise) {
      const savedUser = await promise
      setUser(savedUser)
      return savedUser
    }

    return {
      user,
      isLoading,
      login: (email, password) => saveUser(authService.login(email, password)),
      register: (data) => saveUser(authService.register(data)),
      logout: async () => {
        try {
          await authService.logout()
        } finally {
          // Дори заявката да не успее, на клиента вече те смятаме за излязъл.
          setUser(null)
        }
      },
    }
  }, [user, isLoading])

  return <AuthContext value={value}>{children}</AuthContext>
}

export default AuthProvider
