import { useEffect, useEffectEvent, useState } from 'react'
import { loadScript } from '../../utils/loadScript.js'

// Официалната библиотека на Apple за "Sign in with Apple" в браузъра.
const APPLE_SCRIPT = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'

// Грешки, които означават "потребителят затвори прозореца" — тях не ги показваме.
const CANCEL_ERRORS = ['popup_closed_by_user', 'user_cancelled_authorize']

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  )
}

// Бутонът "Продължете с Apple".
// Apple отваря свой прозорец (popup); след успешен вход връща id_token и — САМО при
// първия вход — името на потребителя. Подаваме ги нагоре с onSuccess -> към нашия сървър.
function AppleButton({ clientId, redirectUri, onSuccess, onError }) {
  const [isReady, setIsReady] = useState(false)

  const handleLoadError = useEffectEvent(() => onError('Неуспешно зареждане на Apple. Провери връзката си.'))

  // Зареждаме библиотеката предварително, за да се отвори прозорецът веднага при клик
  // (иначе браузърът може да блокира popup-а).
  useEffect(() => {
    let cancelled = false

    loadScript(APPLE_SCRIPT)
      .then(() => {
        if (cancelled) return
        window.AppleID.auth.init({
          clientId,
          scope: 'name email',
          // Трябва да е добавен като "Return URL" в Apple Developer.
          redirectURI: redirectUri,
          usePopup: true,
        })
        setIsReady(true)
      })
      .catch(() => {
        if (!cancelled) handleLoadError()
      })

    return () => {
      cancelled = true
    }
  }, [clientId, redirectUri])

  const handleClick = async () => {
    try {
      const data = await window.AppleID.auth.signIn()
      onSuccess({
        idToken: data.authorization.id_token,
        firstName: data.user?.name?.firstName,
        lastName: data.user?.name?.lastName,
      })
    } catch (err) {
      if (CANCEL_ERRORS.includes(err?.error)) return
      onError('Входът с Apple не успя. Опитай отново.')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isReady}
      className="mx-auto flex h-10 w-full max-w-[400px] items-center justify-center gap-2 rounded-[4px] bg-white font-sans text-sm font-medium text-black transition-opacity disabled:opacity-60"
    >
      <AppleLogo />
      Продължете с Apple
    </button>
  )
}

export default AppleButton
