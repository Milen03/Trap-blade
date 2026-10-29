import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as authService from '../../services/authService.js'
import AuthLayout from './AuthLayout.jsx'
import AuthField from './AuthField.jsx'
import FormError from './FormError.jsx'

// Стъпка 1 от "Забравена парола": потребителят въвежда имейла си
// и сървърът му праща писмо с линк към /reset-password?token=...
function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  // Съобщението от сървъра след успешна заявка — тогава вместо формата показваме него.
  const [sentMessage, setSentMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const { message } = await authService.forgotPassword(email)
      setSentMessage(message)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot"
      subtitle="Забрави паролата си? Въведи имейла, с който си се регистрирал, и ще ти пратим линк за нова."
      footer={
        <p className="flex items-center gap-3">
          Спомни си я?
          <Link to="/login" className="font-brand text-3xl text-ice hover:text-white">
            Login
          </Link>
        </p>
      }
    >
      {sentMessage ? (
        // Сървърът казва едно и също, независимо дали имейлът съществува (за сигурност).
        <div className="mt-10 space-y-6">
          <p role="status" className="border border-ice/60 bg-ice/10 px-4 py-3 text-white/90">
            {sentMessage}
          </p>
          <button
            type="button"
            onClick={() => setSentMessage('')}
            className="text-white/70 underline underline-offset-4 hover:text-ice"
          >
            Не получи писмо? Опитай отново
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <AuthField
            id="email"
            label="Имейл"
            type="email"
            placeholder="ime@primer.bg"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <FormError message={error} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-16 w-full bg-ice font-brand text-4xl text-ink transition-colors hover:bg-white disabled:opacity-60"
          >
            Send link
          </button>
        </form>
      )}
    </AuthLayout>
  )
}

export default ForgotPassword
