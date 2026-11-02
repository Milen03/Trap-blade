import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

// "Пазач" за страници само за логнати потребители (виж App.jsx).
// С roles пуска само тези роли — например панела на бръснарите.
// - докато проверяваме сесията (isLoading) — не показваме нищо;
// - нелогнат -> към /login, като запомняме откъде е дошъл (след входа го връщаме тук);
// - логнат, но с друга роля -> към началната страница.
function RequireRole({ roles }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  // Без roles -> пуска всеки логнат потребител (например "Моите часове").
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <Outlet />
}

export default RequireRole
