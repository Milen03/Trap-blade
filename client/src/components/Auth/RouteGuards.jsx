import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

// "Пазачи" на маршрутите (виж App.jsx). Всеки пропуска към вложените страници (<Outlet />)
// или пренасочва другаде с <Navigate />.
// Докато isLoading е true, още не знаем дали има активна сесия — тогава не показваме нищо.

// Само за НЕлогнати: /login и /register. Логнатият няма какво да прави там.
export function GuestOnly() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (user) return <Navigate to={user.profileComplete ? '/' : '/complete-profile'} replace />
  return <Outlet />
}

// Само за логнати: /complete-profile.
export function RequireAuth() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

// Логнат, но без име/фамилия/телефон (вход с Google/Apple) -> връщаме го към довършването,
// където и да се опита да отиде. Нелогнатите минават свободно.
export function RequireCompleteProfile() {
  const { user } = useAuth()

  if (user && !user.profileComplete) return <Navigate to="/complete-profile" replace />
  return <Outlet />
}
