import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './components/Auth/Login.jsx'
import Register from './components/Auth/Register.jsx'
import ForgotPassword from './components/Auth/ForgotPassword.jsx'
import ResetPassword from './components/Auth/ResetPassword.jsx'
import GuestOnly from './components/Auth/GuestOnly.jsx'
import RequireRole from './components/Auth/RequireRole.jsx'
import Panel from './pages/Panel.jsx'
import MyAppointments from './pages/MyAppointments.jsx'
import Terms from './pages/Terms.jsx'
import Privacy from './pages/Privacy.jsx'
import { STAFF_ROLES } from './utils/roles.js'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Общи условия и поверителност — публични. */}
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* Вход, регистрация и забравена парола — само за нелогнати. */}
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Забравена парола: искане на линк и страницата от линка в писмото. */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* "Моите часове" — за всеки логнат потребител. */}
      <Route element={<RequireRole />}>
        <Route path="/my-appointments" element={<MyAppointments />} />
      </Route>

      {/* Панел за бръснарите и собственика. */}
      <Route element={<RequireRole roles={STAFF_ROLES} />}>
        <Route path="/panel" element={<Panel />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
