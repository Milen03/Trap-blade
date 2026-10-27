import { useEffect } from 'react'
import { Link } from 'react-router-dom'

function AuthLayout({ title, subtitle, width = 'max-w-md', children, footer }) {
  // Coming from a scrolled home page, start the form at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-svh px-4 py-8 sm:px-6">
      <div className={`mx-auto ${width}`}>
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

        <main className="pt-16 sm:pt-20">
          <h1 className="font-brand text-7xl leading-none sm:text-8xl">{title}</h1>
          <p className="mt-4 text-white/60">{subtitle}</p>

          {children}

          <div className="mt-8 border-t border-line pt-8 text-white/60">{footer}</div>
        </main>
      </div>
    </div>
  )
}

export default AuthLayout
