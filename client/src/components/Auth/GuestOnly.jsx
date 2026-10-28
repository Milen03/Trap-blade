import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

// "Пазач" за /login и /register (виж App.jsx): логнатият потребител няма какво да прави там,
// затова го връщаме на началната страница. Нелогнатият минава към страницата (<Outlet />).
// Докато isLoading е true, още не знаем дали има активна сесия — тогава не показваме нищо.
function GuestOnly() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}

export default GuestOnly
