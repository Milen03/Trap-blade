import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { MIN_PASSWORD_LENGTH, validateProfile } from '../../utils/validation.js'
import AuthLayout from './AuthLayout.jsx'
import AuthField from './AuthField.jsx'
import FormError from './FormError.jsx'

const INITIAL_VALUES = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  rePassword: '',
  terms: false,
}

// Проверки преди изпращане. Връща текст на грешката или '' ако всичко е наред.
function validate(values) {
  const profileError = validateProfile(values)
  if (profileError) return profileError
  if (values.password.length < MIN_PASSWORD_LENGTH) return `Паролата трябва да е поне ${MIN_PASSWORD_LENGTH} символа`
  if (values.password !== values.rePassword) return 'Паролите не съвпадат'
  if (!values.terms) return 'Трябва да се съгласиш с общите условия'
  return ''
}

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState(INITIAL_VALUES)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Един общ handler за всички полета — разпознава полето по атрибута name.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validate(values)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      // Пращаме всичко без "terms" — отметката е само за формата.
      const { firstName, lastName, email, phone, password, rePassword } = values
      // Сървърът създава профила и веднага те логва (слага бисквитката с токена).
      await register({ firstName, lastName, email, phone, password, rePassword })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Register"
      subtitle="Направи си профил в TrapBlade."
      width="max-w-xl"
      footer={
        <p className="flex items-center gap-3">
          Вече имаш профил?
          <Link to="/login" className="font-brand text-3xl text-ice hover:text-white">
            Login
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
          id="email"
          label="Имейл"
          type="email"
          placeholder="ime@primer.bg"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          required
        />
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
        <div className="grid gap-6 sm:grid-cols-2">
          <AuthField
            id="password"
            label="Парола"
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
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-white/80">
          <input
            type="checkbox"
            name="terms"
            checked={values.terms}
            onChange={handleChange}
            className="mt-0.5 h-5 w-5 shrink-0 accent-ice"
          />
          <span>
            Съгласен съм с{' '}
            <a href="#" className="font-semibold text-white underline underline-offset-4 hover:text-ice">
              общите условия
            </a>{' '}
            и с обработката на данните ми за записване на часове.
          </span>
        </label>

        <FormError message={error} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-16 w-full bg-ice font-brand text-4xl text-ink transition-colors hover:bg-white disabled:opacity-60"
        >
          Register
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register
