import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

// "Пазач" за страници само за определени роли (виж App.jsx), например панела на бръснарите.
// - докато проверяваме сесията (isLoading) — не показваме нищо;
// - нелогнат -> към /login, като запомняме откъде е дошъл (след входа го връщаме тук);
// - логнат, но с друга роля -> към началната страница.
function RequireRole({ roles }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!roles.includes(user.role)) return <Navigate to="/" replace />
  return <Outlet />
}

export default RequireRole
