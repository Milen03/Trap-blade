import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { validateProfile } from '../utils/validation.js'
import { homePath } from '../utils/roles.js'
import AuthLayout from '../components/Auth/AuthLayout.jsx'
import AuthField from '../components/Auth/AuthField.jsx'
import FormError from '../components/Auth/FormError.jsx'

// "Довърши регистрацията" — след първи вход с Google.
// От Google имаме имейл и (обикновено) име, но не и телефон. Тук потребителят потвърждава
// или поправя имената си, добавя телефон и се съгласява с условията (при Google няма регистрационна форма).
function CompleteProfile() {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Откъде е тръгнал (например записване на час) — връщаме го там след това.
  const from = location.state?.from

  const [values, setValues] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    terms: false,
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Профилът вече е довършен -> тук няма какво да се прави.
  if (user.profileComplete && !isSubmitting) {
    return <Navigate to={from || homePath(user)} replace />
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validateProfile(values) || (values.terms ? '' : 'Трябва да се съгласиш с общите условия')
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      const saved = await updateProfile({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone.trim(),
      })
      navigate(from || homePath(saved), { replace: true })
    } catch (err) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  // "Не си ти?" -> излизаме и се връщаме на началната страница.
  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <AuthLayout
      title="Welcome"
      subtitle="Остана една стъпка: провери името си и добави телефон — на него бръснарите ще ти звънят при нужда."
      width="max-w-xl"
      footer={
        <p className="flex flex-wrap items-center gap-3">
          Влезе като <span className="break-all font-semibold text-white">{user.email}</span>
          <button type="button" onClick={handleLogout} className="text-ice underline underline-offset-4 hover:text-white">
            Не си ти? Излез
          </button>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="mt-10 space-y-8" noValidate>
        <div className="grid gap-6 sm:grid-cols-2">
          <AuthField
            id="firstName"
            label="Име"
            placeholder="Иван"
            autoComplete="given-name"
            value={values.firstName}
            onChange={handleChange}
            required
          />
          <AuthField
            id="lastName"
            label="Фамилия"
            placeholder="Петров"
            autoComplete="family-name"
            value={values.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <AuthField
          id="phone"
          label="Телефон"
          type="tel"
          placeholder="0888 123 456"
          autoComplete="tel"
          value={values.phone}
          onChange={handleChange}
          required
        />

        <label className="flex cursor-pointer items-start gap-3 text-white/80">
          <input
            type="checkbox"
            name="terms"
            checked={values.terms}
            onChange={handleChange}
            className="mt-0.5 h-5 w-5 shrink-0 accent-ice"
          />
          <span>
            {/* Отварят се в нов раздел, за да не се загуби попълнената форма. */}
            Съгласен съм с{' '}
            <a href="/terms" target="_blank" rel="noreferrer" className="font-semibold text-white underline underline-offset-4 hover:text-ice">
              общите условия
            </a>{' '}
            и с обработката на данните ми според{' '}
            <a href="/privacy" target="_blank" rel="noreferrer" className="font-semibold text-white underline underline-offset-4 hover:text-ice">
              политиката за поверителност
            </a>
            .
          </span>
        </label>

        <FormError message={error} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-16 w-full bg-ice font-brand text-4xl text-ink transition-colors hover:bg-white disabled:opacity-60"
        >
          Done
        </button>
      </form>
    </AuthLayout>
  )
}

export default CompleteProfile
