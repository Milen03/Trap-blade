import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './components/Auth/Login.jsx'
import Register from './components/Auth/Register.jsx'
import GuestOnly from './components/Auth/GuestOnly.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Вход и регистрация — само за нелогнати. */}
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
