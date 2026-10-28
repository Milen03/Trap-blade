import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import AuthLayout from './AuthLayout.jsx'
import AuthField from './AuthField.jsx'
import FormError from './FormError.jsx'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  // "Контролирана" форма: стойностите на полетата живеят в state.
  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Един общ handler за всички полета — разпознава полето по атрибута name.
  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // Сървърът проверява имейла и паролата и при успех слага бисквитката с токена.
      // Оставаш логнат, докато не натиснеш "Изход".
      await login(values.email, values.password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Login"
      subtitle="Влез в профила си и запази стол."
      footer={
        <p className="flex items-center gap-3">
          Нямаш профил?
          <Link to="/register" className="font-brand text-3xl text-ice hover:text-white">
            Register
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
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
          id="password"
          label="Парола"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          revealable
          value={values.password}
          onChange={handleChange}
          required
        />

        <div className="flex justify-end">
          <a href="#" className="text-white/70 underline underline-offset-4 hover:text-ice">
            Забравена парола?
          </a>
        </div>

        <FormError message={error} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-16 w-full bg-ice font-brand text-4xl text-ink transition-colors hover:bg-white disabled:opacity-60"
        >
          Login
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login
