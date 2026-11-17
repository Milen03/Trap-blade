import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { homePath } from '../../utils/roles.js'
import GoogleButton from './GoogleButton.jsx'
import FormError from './FormError.jsx'

// Client ID от Google Cloud Console (публично е — не е тайна). Задава се във Vercel и в client/.env.local.
// Ако липсва, бутонът изобщо не се показва.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Разделител "или" + бутон "Продължи с Google" за страниците за вход и регистрация.
// След вход: нов профил (без телефон) -> "Довърши регистрацията"; иначе -> откъдето е дошъл.
function GoogleSignIn() {
  const { googleLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')

  if (!GOOGLE_CLIENT_ID) return null

  const handleCredential = async (credential) => {
    setError('')
    try {
      const user = await googleLogin(credential)
      const from = location.state?.from
      if (!user.profileComplete) {
        navigate('/complete-profile', { replace: true, state: { from } })
      } else {
        navigate(from || homePath(user), { replace: true })
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/40">
        <span className="h-px flex-1 bg-line" />
        или
        <span className="h-px flex-1 bg-line" />
      </div>
      <GoogleButton clientId={GOOGLE_CLIENT_ID} onCredential={handleCredential} onError={setError} />
      <FormError message={error} />
    </div>
  )
}

export default GoogleSignIn
