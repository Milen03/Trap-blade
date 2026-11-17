import { useEffect, useEffectEvent, useRef } from 'react'
import { loadScript } from '../../utils/loadScript.js'

// Официалната библиотека на Google за вход ("Google Identity Services").
const GOOGLE_SCRIPT = 'https://accounts.google.com/gsi/client'

// Бутонът "Продължете с Google".
// Google сам рисува бутона и отваря прозореца за вход. След успешен вход ни дава
// "credential" (ID token), който подаваме нагоре с onCredential -> отива към нашия сървър.
function GoogleButton({ clientId, onCredential, onError }) {
  const containerRef = useRef(null)

  // useEffectEvent: функции, които ефектът вика, но не трябва да го пускат наново,
  // когато родителят подаде нова версия на onCredential/onError.
  const handleCredential = useEffectEvent((response) => onCredential(response.credential))
  const handleLoadError = useEffectEvent(() => onError('Неуспешно зареждане на Google. Провери връзката си.'))

  useEffect(() => {
    let cancelled = false

    loadScript(GOOGLE_SCRIPT)
      .then(() => {
        const container = containerRef.current
        if (cancelled || !container) return

        // 1) Казваме на Google кое е нашето приложение и какво да прави след вход.
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => handleCredential(response),
        })

        // 2) Google рисува бутона вътре в нашия <div>.
        window.google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text: 'continue_with',
          locale: 'bg',
          // Google приема ширина между 200 и 400 пиксела.
          width: Math.max(200, Math.min(container.offsetWidth, 400)),
        })
      })
      .catch(() => {
        if (!cancelled) handleLoadError()
      })

    return () => {
      cancelled = true
    }
  }, [clientId])

  return <div ref={containerRef} className="flex min-h-10 w-full justify-center" />
}

export default GoogleButton
