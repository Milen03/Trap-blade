import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './components/Auth/Login.jsx'
import Register from './components/Auth/Register.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
