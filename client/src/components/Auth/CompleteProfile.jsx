import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { validateProfile } from '../../utils/validation.js'
import AuthLayout from './AuthLayout.jsx'
import AuthField from './AuthField.jsx'
import FormError from './FormError.jsx'

// "Довърши регистрацията" — показва се след първи вход с Google или Apple.
// Оттам получаваме само имейл (и понякога име, което не винаги е истинското),
// затова тук потребителят потвърждава/поправя името си и добавя телефон.
function CompleteProfile() {
  const { user, completeProfile, logout } = useAuth()
  const navigate = useNavigate()

  // Попълваме предварително каквото вече знаем от Google/Apple — потребителят може да го промени.
  const [values, setValues] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Профилът вече е завършен -> тук няма какво да се прави.
  if (user.profileComplete) {
    return <Navigate to="/" replace />
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateProfile(values)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      // PUT /api/users/profile -> сървърът записва данните и връща обновения потребител
      // (вече с profileComplete: true).
      await completeProfile(values)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // "Не си ти?" -> излизаме и се връщаме на началната страница.
  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <AuthLayout
      title="Welcome"
      subtitle="Остана една стъпка. Провери името си и добави телефон, за да можем да потвърждаваме часовете ти."
      footer={
        <p className="flex flex-wrap items-center gap-3">
          Влезе като <span className="font-semibold text-white">{user.email}</span>
          <button type="button" onClick={handleLogout} className="text-ice underline underline-offset-4 hover:text-white">
            Не си ти? Излез
          </button>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
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
          hint="На този номер ще потвърждаваме записаните часове."
          value={values.phone}
          onChange={handleChange}
          required
        />

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
