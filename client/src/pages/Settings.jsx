import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { STUDIO } from '../data/studio.js'
import { PHONE_REGEX } from '../utils/validation.js'
import FormError from '../components/Auth/FormError.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { inputClass, labelClass, primaryButton, secondaryButton, sectionTitle } from '../components/Panel/ui.js'

function Row({ label, children }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-xs uppercase tracking-[0.2em] text-white/50">{label}</dt>
      <dd className="break-all font-bold sm:text-right">{children}</dd>
    </div>
  )
}

// "Настройки на профила": данните на потребителя, смяна на телефона и линк към смяна на паролата.
// Името и имейла само се показват — сменят се през салона.
function Settings() {
  const { user, changePhone } = useAuth()
  const location = useLocation()

  // Съобщение, дошло от друга страница (например "Паролата е сменена" от ChangePassword.jsx).
  const [notice, setNotice] = useState(location.state?.notice || '')
  const [editingPhone, setEditingPhone] = useState(false)
  const [phone, setPhone] = useState(user.phone || '')
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const startEditing = () => {
    setPhone(user.phone || '')
    setError('')
    setNotice('')
    setEditingPhone(true)
  }

  // "Запази" -> проверка -> прозорец "Сигурен ли си?".
  const askToSave = (e) => {
    e.preventDefault()
    const value = phone.trim()
    if (!value) return setError('Въведи телефон')
    if (!PHONE_REGEX.test(value)) return setError('Невалиден телефонен номер')
    if (value === (user.phone || '')) return setError('Това е сегашният ти телефон')
    setError('')
    setConfirming(true)
  }

  const savePhone = async () => {
    setSaving(true)
    try {
      await changePhone(phone.trim())
      setConfirming(false)
      setEditingPhone(false)
      setNotice('Телефонът е сменен.')
    } catch (err) {
      setConfirming(false)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-svh px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-white/80 transition-colors hover:text-ice"
          >
            <span aria-hidden="true">←</span> Начало
          </Link>
          <Link to="/" className="font-brand text-3xl leading-none">
            TrapBlade
          </Link>
        </header>

        <main className="space-y-10 pb-16 pt-14 sm:pt-16">
          <div>
            <h1 className="font-brand text-6xl leading-none sm:text-7xl">Settings</h1>
            <p className="mt-4 text-white/60">Настройки на профила.</p>
          </div>

          {notice && (
            <p role="status" className="border border-ice/60 bg-ice/10 px-4 py-3 text-sm text-ice">
              {notice}
            </p>
          )}

          {/* ---------- Лични данни ---------- */}
          <section>
            <h2 className={`${sectionTitle} mb-3`}>Лични данни</h2>
            <dl className="divide-y divide-line border border-line bg-coal">
              <Row label="Име">{user.firstName}</Row>
              <Row label="Фамилия">{user.lastName}</Row>
              <Row label="Имейл">{user.email}</Row>
            </dl>
            <p className="mt-2 text-xs text-white/50">
              Името и имейлът не могат да се сменят оттук. Ако има грешка, обади се в салона:{' '}
              <a href={STUDIO.phoneHref} className="text-ice hover:text-white">
                {STUDIO.phone}
              </a>
              .
            </p>
          </section>

          {/* ---------- Телефон ---------- */}
          <section>
            <h2 className={`${sectionTitle} mb-3`}>Телефон</h2>
            {editingPhone ? (
              <form onSubmit={askToSave} className="space-y-4 border border-line bg-coal p-4">
                <div>
                  <label htmlFor="settings-phone" className={labelClass}>
                    Нов телефон
                  </label>
                  <input
                    id="settings-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0888 123 456"
                    className={inputClass}
                    autoFocus
                  />
                </div>
                <FormError message={error} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => setEditingPhone(false)} className={secondaryButton}>
                    Откажи
                  </button>
                  <button type="submit" className={primaryButton}>
                    Запази
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-4 border border-line bg-coal px-4 py-3">
                <span className="font-bold">{user.phone || '—'}</span>
                <button type="button" onClick={startEditing} className={secondaryButton}>
                  Промени
                </button>
              </div>
            )}
          </section>

          {/* ---------- Парола ---------- */}
          <section>
            <h2 className={`${sectionTitle} mb-3`}>Парола</h2>
            <div className="flex items-center justify-between gap-4 border border-line bg-coal px-4 py-3">
              <span aria-hidden="true" className="font-bold tracking-[0.3em]">
                ••••••••
              </span>
              <Link to="/settings/password" className={`${secondaryButton} inline-grid place-items-center`}>
                Смени паролата
              </Link>
            </div>
          </section>
        </main>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Смяна на телефона"
          busy={saving}
          onConfirm={savePhone}
          onCancel={() => setConfirming(false)}
        >
          Сигурен ли си, че искаш да смениш телефона си на <strong className="text-white">{phone.trim()}</strong>?
          Бръснарите ще ти звънят на този номер.
        </ConfirmDialog>
      )}
    </div>
  )
}

export default Settings
