import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

// "Пазач" около почти целия сайт (виж App.jsx): логнат потребител без име/фамилия/телефон
// (например след първи вход с Google) се праща на "Довърши регистрацията", където и да отиде.
// Помни откъде е тръгнал, за да го върне там след това. Нелогнатите минават свободно.
function RequireCompleteProfile() {
  const { user } = useAuth()
  const location = useLocation()

  if (user && !user.profileComplete) {
    return <Navigate to="/complete-profile" replace state={{ from: location.pathname + location.hash }} />
  }
  return <Outlet />
}

export default RequireCompleteProfile
