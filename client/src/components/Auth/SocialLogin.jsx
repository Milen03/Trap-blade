import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import GoogleButton from './GoogleButton.jsx'
import AppleButton from './AppleButton.jsx'
import FormError from './FormError.jsx'

// Стойностите идват от client/.env.local (виж client/.env.example).
// Ако някоя липсва, съответният бутон просто не се показва.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID
const APPLE_REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI || window.location.origin

// Секцията "или продължи с Google / Apple" под формите за вход и регистрация.
function SocialLogin() {
  const { loginWithGoogle, loginWithApple } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  // След успешен вход: ако липсват име/фамилия/телефон -> към "Довърши регистрацията".
  const finishLogin = (user) => {
    navigate(user.profileComplete ? '/' : '/complete-profile')
  }

  const handleGoogle = async (credential) => {
    setError('')
    try {
      finishLogin(await loginWithGoogle(credential))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleApple = async (appleData) => {
    setError('')
    try {
      finishLogin(await loginWithApple(appleData))
    } catch (err) {
      setError(err.message)
    }
  }

  if (!GOOGLE_CLIENT_ID && !APPLE_CLIENT_ID) {
    // Подсказка само докато разработваш (npm run dev) — в production не се показва.
    return import.meta.env.DEV ? (
      <p className="mt-8 text-xs text-white/40">
        Входът с Google/Apple е изключен: добави VITE_GOOGLE_CLIENT_ID и/или VITE_APPLE_CLIENT_ID в
        client/.env.local.
      </p>
    ) : null
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
        <span className="h-px flex-1 bg-line" />
        или
        <span className="h-px flex-1 bg-line" />
      </div>

      {GOOGLE_CLIENT_ID && <GoogleButton clientId={GOOGLE_CLIENT_ID} onCredential={handleGoogle} onError={setError} />}
      {APPLE_CLIENT_ID && (
        <AppleButton
          clientId={APPLE_CLIENT_ID}
          redirectUri={APPLE_REDIRECT_URI}
          onSuccess={handleApple}
          onError={setError}
        />
      )}

      <FormError message={error} />
    </div>
  )
}

export default SocialLogin
