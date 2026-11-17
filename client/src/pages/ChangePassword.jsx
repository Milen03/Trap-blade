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
// needsCurrent: false за профил само с Google (задава първа парола, текуща няма).
function validate({ currentPassword, password, rePassword }, needsCurrent) {
  if (needsCurrent && !currentPassword) return 'Въведи текущата си парола'
  if (password.length < MIN_PASSWORD_LENGTH) return `Новата парола трябва да е поне ${MIN_PASSWORD_LENGTH} символа`
  if (password !== rePassword) return 'Новите пароли не съвпадат'
  if (needsCurrent && password === currentPassword) return 'Новата парола трябва да е различна от сегашната'
  return ''
}

// "Настройки на профила" -> "Смени паролата": текуща парола, нова, повтори новата.
// Преди запис — прозорец "Сигурен ли си?". След успех — обратно в настройките.
function ChangePassword() {
  const { user, changePassword } = useAuth()
  // Профил само с Google: задава първа парола — без поле за текуща.
  const isFirstPassword = !user.hasPassword
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
    const validationError = validate(values, !isFirstPassword)
    setError(validationError)
    if (!validationError) setConfirming(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      await changePassword(isFirstPassword ? '' : values.currentPassword, values.password, values.rePassword)
      const notice = isFirstPassword
        ? 'Паролата е зададена. Вече можеш да влизаш и с имейл и парола.'
        : 'Паролата е сменена.'
      navigate('/settings', { replace: true, state: { notice } })
    } catch (err) {
      setConfirming(false)
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <AuthLayout
      title="Password"
      subtitle={isFirstPassword ? 'Задай парола, за да влизаш и с имейл, не само с Google.' : 'Смяна на паролата.'}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/settings" className="uppercase tracking-[0.15em] hover:text-ice">
            ← Настройки на профила
          </Link>
          {!isFirstPassword && (
            <Link to="/forgot-password" className="underline underline-offset-4 hover:text-ice">
              Забравих текущата парола
            </Link>
          )}
        </div>
      }
    >
      <form onSubmit={askToSave} className="mt-10 space-y-8" noValidate>
        {!isFirstPassword && (
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
        )}
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
          {isFirstPassword ? 'Задай парола' : 'Смени паролата'}
        </button>
      </form>

      {confirming && (
        <ConfirmDialog
          title={isFirstPassword ? 'Задаване на парола' : 'Смяна на паролата'}
          confirmLabel={isFirstPassword ? 'Да, задай' : 'Да, смени'}
          busy={saving}
          onConfirm={save}
          onCancel={() => setConfirming(false)}
        >
          {isFirstPassword
            ? 'Сигурен ли си, че искаш да зададеш тази парола? Ще можеш да влизаш и с Google, и с имейл и парола.'
            : 'Сигурен ли си, че искаш да смениш паролата си? След това ще влизаш само с новата парола.'}
        </ConfirmDialog>
      )}
    </AuthLayout>
  )
}

export default ChangePassword
