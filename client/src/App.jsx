import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './components/Auth/Login.jsx'
import Register from './components/Auth/Register.jsx'
import CompleteProfile from './components/Auth/CompleteProfile.jsx'
import { GuestOnly, RequireAuth, RequireCompleteProfile } from './components/Auth/RouteGuards.jsx'

function App() {
  return (
    <Routes>
      {/* Логнат потребител с незавършен профил се връща към /complete-profile от всички тези страници. */}
      <Route element={<RequireCompleteProfile />}>
        <Route path="/" element={<Home />} />

        {/* Вход и регистрация — само за нелогнати. */}
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Route>

      {/* Довършване на регистрацията след вход с Google/Apple — само за логнати. */}
      <Route element={<RequireAuth />}>
        <Route path="/complete-profile" element={<CompleteProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
