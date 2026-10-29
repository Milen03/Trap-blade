import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { MIN_PASSWORD_LENGTH } from '../../utils/validation.js'
import AuthLayout from './AuthLayout.jsx'
import AuthField from './AuthField.jsx'
import FormError from './FormError.jsx'

// Стъпка 2 от "Забравена парола": тук води линкът от писмото (/reset-password?token=...).
// Потребителят избира нова парола; сървърът я записва и веднага го логва.
function ResetPassword() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  // Кодът от линка — взимаме го от адреса (?token=...).
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [values, setValues] = useState({ password: '', rePassword: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (values.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Паролата трябва да е поне ${MIN_PASSWORD_LENGTH} символа`)
      return
    }
    if (values.password !== values.rePassword) {
      setError('Паролите не съвпадат')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await resetPassword(token, values.password, values.rePassword)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Reset"
      subtitle="Избери нова парола за профила си."
      footer={
        <p className="flex flex-wrap items-center gap-3">
          Линкът не работи?
          <Link to="/forgot-password" className="text-ice underline underline-offset-4 hover:text-white">
            Поискай нов
          </Link>
        </p>
      }
    >
      {!token ? (
        // Отворена е страницата без код в адреса (например ръчно).
        <div className="mt-10">
          <FormError message="Липсва код за смяна на паролата. Отвори линка от писмото още веднъж." />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <AuthField
            id="password"
            label="Нова парола"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            hint={`Поне ${MIN_PASSWORD_LENGTH} символа`}
            revealable
            value={values.password}
            onChange={handleChange}
            required
          />
          <AuthField
            id="rePassword"
            label="Повтори паролата"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={values.rePassword}
            onChange={handleChange}
            required
          />

          <FormError message={error} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-16 w-full bg-ice font-brand text-4xl text-ink transition-colors hover:bg-white disabled:opacity-60"
          >
            Save
          </button>
        </form>
      )}
    </AuthLayout>
  )
}

export default ResetPassword
