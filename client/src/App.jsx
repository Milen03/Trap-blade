import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './components/Auth/Login.jsx'
import Register from './components/Auth/Register.jsx'
import ForgotPassword from './components/Auth/ForgotPassword.jsx'
import ResetPassword from './components/Auth/ResetPassword.jsx'
import GuestOnly from './components/Auth/GuestOnly.jsx'
import RequireRole from './components/Auth/RequireRole.jsx'
import RequireCompleteProfile from './components/Auth/RequireCompleteProfile.jsx'
import Panel from './pages/Panel.jsx'
import MyAppointments from './pages/MyAppointments.jsx'
import Settings from './pages/Settings.jsx'
import ChangePassword from './pages/ChangePassword.jsx'
import CompleteProfile from './pages/CompleteProfile.jsx'
import NotFound from './pages/NotFound.jsx'
import Terms from './pages/Terms.jsx'
import Privacy from './pages/Privacy.jsx'
import { STAFF_ROLES } from './utils/roles.js'

function App() {
  return (
    <Routes>
      {/* Общи условия и поверителност — публични, достъпни и преди "Довърши регистрацията". */}
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* Вход, регистрация и забравена парола — само за нелогнати
          (логнат с недовършен профил -> "Довърши регистрацията", виж GuestOnly.jsx). */}
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Забравена парола: искане на линк и страницата от линка в писмото. */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* "Довърши регистрацията" — след първи вход с Google (имена и телефон). */}
      <Route element={<RequireRole />}>
        <Route path="/complete-profile" element={<CompleteProfile />} />
      </Route>

      {/* Всичко останало изисква довършен профил, ако си логнат. */}
      <Route element={<RequireCompleteProfile />}>
        <Route path="/" element={<Home />} />

        {/* "Моите часове" и "Настройки на профила" — за всеки логнат потребител. */}
        <Route element={<RequireRole />}>
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/password" element={<ChangePassword />} />
        </Route>

        {/* Панел за бръснарите и собственика. */}
        <Route element={<RequireRole roles={STAFF_ROLES} />}>
          <Route path="/panel" element={<Panel />} />
        </Route>

        {/* Всеки друг адрес — страница 404. */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
