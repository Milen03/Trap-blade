import { useState } from 'react'

const inputClass =
  'h-13 w-full border border-line bg-[#121212] px-4 text-white placeholder:text-white/40 transition-colors focus:border-ice focus:outline-none'

function EyeIcon({ crossed }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {crossed && <path d="M3 3l18 18" />}
    </svg>
  )
}

// Labelled input; `revealable` adds the show/hide toggle used on password fields.
function AuthField({ id, label, hint, revealable = false, type = 'text', ...inputProps }) {
  const [visible, setVisible] = useState(false)
  const inputType = revealable && visible ? 'text' : type

  return (
    <div>
      <label htmlFor={id} className="mb-3 block text-xs font-bold uppercase tracking-[0.25em] text-white/80">
        {label}
      </label>
      <div className="relative">
        <input id={id} name={id} type={inputType} className={`${inputClass} ${revealable ? 'pr-12' : ''}`} {...inputProps} />
        {revealable && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/70 hover:text-ice"
            aria-label={visible ? 'Скрий паролата' : 'Покажи паролата'}
          >
            <EyeIcon crossed={visible} />
          </button>
        )}
      </div>
      {hint && <p className="mt-2 text-xs text-white/50">{hint}</p>}
    </div>
  )
}

export default AuthField
