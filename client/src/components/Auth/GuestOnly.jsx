import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { homePath } from '../../utils/roles.js'

// "Пазач" за /login и /register (виж App.jsx): логнатият потребител няма какво да прави там,
// затова го връщаме там, откъдето е дошъл (виж RequireRole.jsx), или на "своята" начална страница:
// бръснарите — в панела, клиентите — на началната. Нелогнатият минава към страницата (<Outlet />).
// Докато isLoading е true, още не знаем дали има активна сесия — тогава не показваме нищо.
function GuestOnly() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null
  if (user) return <Navigate to={location.state?.from || homePath(user)} replace />
  return <Outlet />
}

export default GuestOnly
