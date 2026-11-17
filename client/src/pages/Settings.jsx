import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { STUDIO } from '../data/studio.js'
import { EMAIL_REGEX, PHONE_REGEX } from '../utils/validation.js'
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

// Ред със стойност и бутон "Промени", който се превръща във форма с поле, "Откажи" и "Запази".
function EditableValue({ id, label, type, autoComplete, placeholder, value, editing, draft, error, onEdit, onDraft, onCancel, onSave }) {
  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-4 border border-line bg-coal px-4 py-3">
        <span className="min-w-0 break-all font-bold">{value || '—'}</span>
        <button type="button" onClick={onEdit} className={`${secondaryButton} shrink-0`}>
          Промени
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSave} className="space-y-4 border border-line bg-coal p-4" noValidate>
      <div>
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
          autoFocus
        />
      </div>
      <FormError message={error} />
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Откажи
        </button>
        <button type="submit" className={primaryButton}>
          Запази
        </button>
      </div>
    </form>
  )
}

// "Настройки на профила": данните на потребителя, смяна на телефона и имейла, линк към смяна на паролата.
// Името само се показва — сменя се през салона.
function Settings() {
  const { user, changePhone, changeEmail } = useAuth()
  const location = useLocation()

  // Съобщение, дошло от друга страница (например "Паролата е сменена" от ChangePassword.jsx).
  const [notice, setNotice] = useState(location.state?.notice || '')

  // ---------- Телефон ----------
  const [phone, setPhone] = useState({ editing: false, draft: '', error: '', confirming: false, saving: false })

  // ---------- Имейл (иска и текущата парола в прозореца за потвърждение) ----------
  const [email, setEmail] = useState({
    editing: false,
    draft: '',
    error: '',
    confirming: false,
    saving: false,
    password: '',
    dialogError: '',
  })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const askToSavePhone = (e) => {
    e.preventDefault()
    const value = phone.draft.trim()
    let error = ''
    if (!value) error = 'Въведи телефон'
    else if (!PHONE_REGEX.test(value)) error = 'Невалиден телефонен номер'
    else if (value === (user.phone || '')) error = 'Това е сегашният ти телефон'
    setPhone((s) => ({ ...s, error, confirming: !error }))
  }

  const savePhone = async () => {
    setPhone((s) => ({ ...s, saving: true }))
    try {
      await changePhone(phone.draft.trim())
      setPhone({ editing: false, draft: '', error: '', confirming: false, saving: false })
      setNotice('Телефонът е сменен.')
    } catch (err) {
      setPhone((s) => ({ ...s, confirming: false, saving: false, error: err.message }))
    }
  }

  const askToSaveEmail = (e) => {
    e.preventDefault()
    const value = email.draft.trim().toLowerCase()
    let error = ''
    if (!value) error = 'Въведи имейл'
    else if (!EMAIL_REGEX.test(value)) error = 'Невалиден имейл'
    else if (value === user.email) error = 'Това е сегашният ти имейл'
    setEmail((s) => ({ ...s, error, confirming: !error, password: '', dialogError: '' }))
  }

  const saveEmail = async () => {
    if (!email.password) {
      setEmail((s) => ({ ...s, dialogError: 'Въведи текущата си парола' }))
      return
    }
    setEmail((s) => ({ ...s, saving: true, dialogError: '' }))
    try {
      await changeEmail(email.draft.trim().toLowerCase(), email.password)
      setEmail({ editing: false, draft: '', error: '', confirming: false, saving: false, password: '', dialogError: '' })
      setNotice('Имейлът е сменен. Оттук нататък влизаш с новия имейл.')
    } catch (err) {
      // Грешна парола -> остава в прозореца, за да опита пак. Друго (например зает имейл) -> във формата.
      if (/парола/i.test(err.message)) {
        setEmail((s) => ({ ...s, saving: false, password: '', dialogError: err.message }))
      } else {
        setEmail((s) => ({ ...s, saving: false, confirming: false, error: err.message }))
      }
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
            </dl>
            <p className="mt-2 text-xs text-white/50">
              Името не може да се сменя оттук. Ако има грешка, обади се в салона:{' '}
              <a href={STUDIO.phoneHref} className="text-ice hover:text-white">
                {STUDIO.phone}
              </a>
              .
            </p>
          </section>

          {/* ---------- Имейл ---------- */}
          <section>
            <h2 className={`${sectionTitle} mb-3`}>Имейл</h2>
            {user.hasPassword ? (
            <EditableValue
              id="settings-email"
              label="Нов имейл"
              type="email"
              autoComplete="email"
              placeholder="ime@primer.bg"
              value={user.email}
              editing={email.editing}
              draft={email.draft}
              error={email.error}
              onEdit={() => {
                setNotice('')
                setEmail((s) => ({ ...s, editing: true, draft: user.email, error: '' }))
              }}
              onDraft={(draft) => setEmail((s) => ({ ...s, draft }))}
              onCancel={() => setEmail((s) => ({ ...s, editing: false, error: '' }))}
              onSave={askToSaveEmail}
            />
            ) : (
              // Профил само с Google: имейлът идва от Google и не се сменя, докато няма парола.
              <div className="border border-line bg-coal px-4 py-3">
                <span className="break-all font-bold">{user.email}</span>
              </div>
            )}
            <p className="mt-2 text-xs text-white/50">
              {user.hasPassword
                ? 'С имейла влизаш в профила и на него получаваш линка при забравена парола.'
                : 'Влизаш с Google — имейлът идва оттам. За да го смениш, първо си задай парола.'}
            </p>
          </section>

          {/* ---------- Телефон ---------- */}
          <section>
            <h2 className={`${sectionTitle} mb-3`}>Телефон</h2>
            <EditableValue
              id="settings-phone"
              label="Нов телефон"
              type="tel"
              autoComplete="tel"
              placeholder="0888 123 456"
              value={user.phone}
              editing={phone.editing}
              draft={phone.draft}
              error={phone.error}
              onEdit={() => {
                setNotice('')
                setPhone((s) => ({ ...s, editing: true, draft: user.phone || '', error: '' }))
              }}
              onDraft={(draft) => setPhone((s) => ({ ...s, draft }))}
              onCancel={() => setPhone((s) => ({ ...s, editing: false, error: '' }))}
              onSave={askToSavePhone}
            />
          </section>

          {/* ---------- Парола ---------- */}
          <section>
            <h2 className={`${sectionTitle} mb-3`}>Парола</h2>
            <div className="flex items-center justify-between gap-4 border border-line bg-coal px-4 py-3">
              {user.hasPassword ? (
                <span aria-hidden="true" className="font-bold tracking-[0.3em]">
                  ••••••••
                </span>
              ) : (
                <span className="text-sm text-white/70">Нямаш парола — влизаш с Google.</span>
              )}
              <Link to="/settings/password" className={`${secondaryButton} inline-grid shrink-0 place-items-center`}>
                {user.hasPassword ? 'Смени паролата' : 'Задай парола'}
              </Link>
            </div>
            {user.hasGoogle && user.hasPassword && (
              <p className="mt-2 text-xs text-white/50">Можеш да влизаш и с Google, и с имейл и парола.</p>
            )}
          </section>
        </main>
      </div>

      {phone.confirming && (
        <ConfirmDialog
          title="Смяна на телефона"
          busy={phone.saving}
          onConfirm={savePhone}
          onCancel={() => setPhone((s) => ({ ...s, confirming: false }))}
        >
          Сигурен ли си, че искаш да смениш телефона си на <strong className="text-white">{phone.draft.trim()}</strong>?
          Бръснарите ще ти звънят на този номер.
        </ConfirmDialog>
      )}

      {email.confirming && (
        <ConfirmDialog
          title="Смяна на имейла"
          busy={email.saving}
          onConfirm={saveEmail}
          onCancel={() => setEmail((s) => ({ ...s, confirming: false, password: '', dialogError: '' }))}
        >
          <p>
            Сигурен ли си, че искаш да смениш имейла си на{' '}
            <strong className="break-all text-white">{email.draft.trim().toLowerCase()}</strong>? Оттук нататък ще
            влизаш с него.
          </p>
          <div className="mt-4">
            <label htmlFor="confirm-email-password" className={labelClass}>
              Текуща парола
            </label>
            <input
              id="confirm-email-password"
              type="password"
              autoComplete="current-password"
              value={email.password}
              onChange={(e) => setEmail((s) => ({ ...s, password: e.target.value, dialogError: '' }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEmail()
              }}
              className={inputClass}
              autoFocus
            />
            <p className="mt-2 text-xs text-white/50">За сигурност — само ти можеш да смениш имейла си.</p>
          </div>
          <div className="mt-3">
            <FormError message={email.dialogError} />
          </div>
        </ConfirmDialog>
      )}
    </div>
  )
}

export default Settings
