import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { MIN_PASSWORD_LENGTH } from '../utils/validation.js'
import AuthLayout from '../components/Auth/AuthLayout.jsx'
import AuthField from '../components/Auth/AuthField.jsx'
import FormError from '../components/Auth/FormError.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const INITIAL_VALUES = { currentPassword: '', password: '', rePassword: '' }

// Проверки преди изпращане (сървърът проверява същото). Връща текст на грешката или ''.
function validate({ currentPassword, password, rePassword }) {
  if (!currentPassword) return 'Въведи текущата си парола'
  if (password.length < MIN_PASSWORD_LENGTH) return `Новата парола трябва да е поне ${MIN_PASSWORD_LENGTH} символа`
  if (password !== rePassword) return 'Новите пароли не съвпадат'
  if (password === currentPassword) return 'Новата парола трябва да е различна от сегашната'
  return ''
}

// "Настройки на профила" -> "Смени паролата": текуща парола, нова, повтори новата.
// Преди запис — прозорец "Сигурен ли си?". След успех — обратно в настройките.
function ChangePassword() {
  const { changePassword } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState(INITIAL_VALUES)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  const askToSave = (e) => {
    e.preventDefault()
    const validationError = validate(values)
    setError(validationError)
    if (!validationError) setConfirming(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      await changePassword(values.currentPassword, values.password, values.rePassword)
      navigate('/settings', { replace: true, state: { notice: 'Паролата е сменена.' } })
    } catch (err) {
      setConfirming(false)
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <AuthLayout
      title="Password"
      subtitle="Смяна на паролата."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/settings" className="uppercase tracking-[0.15em] hover:text-ice">
            ← Настройки на профила
          </Link>
          <Link to="/forgot-password" className="underline underline-offset-4 hover:text-ice">
            Забравих текущата парола
          </Link>
        </div>
      }
    >
      <form onSubmit={askToSave} className="mt-10 space-y-8" noValidate>
        <AuthField
          id="currentPassword"
          label="Текуща парола"
          type="password"
          autoComplete="current-password"
          revealable
          value={values.currentPassword}
          onChange={handleChange}
          required
        />
        <AuthField
          id="password"
          label="Нова парола"
          type="password"
          autoComplete="new-password"
          hint={`Поне ${MIN_PASSWORD_LENGTH} символа.`}
          revealable
          value={values.password}
          onChange={handleChange}
          required
        />
        <AuthField
          id="rePassword"
          label="Повтори новата парола"
          type="password"
          autoComplete="new-password"
          revealable
          value={values.rePassword}
          onChange={handleChange}
          required
        />

        <FormError message={error} />

        <button
          type="submit"
          className="h-16 w-full bg-ice text-sm font-bold uppercase tracking-[0.25em] text-ink transition-colors hover:bg-white"
        >
          Смени паролата
        </button>
      </form>

      {confirming && (
        <ConfirmDialog
          title="Смяна на паролата"
          busy={saving}
          onConfirm={save}
          onCancel={() => setConfirming(false)}
        >
          Сигурен ли си, че искаш да смениш паролата си? След това ще влизаш само с новата парола.
        </ConfirmDialog>
      )}
    </AuthLayout>
  )
}

export default ChangePassword
