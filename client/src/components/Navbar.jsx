import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/trapblade-logo.webp'
import { NAV_LINKS } from '../data/studio.js'
import { useAuth } from '../hooks/useAuth.js'

function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const { user, isLoading, logout } = useAuth()

  const handleLogout = () => {
    close()
    logout()
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#home" onClick={close} className="flex items-center gap-3">
          <img src={logo} alt="" className="h-9 w-9" />
          <span className="font-brand text-2xl leading-none">TrapBlade</span>
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-xs font-semibold uppercase tracking-[0.15em] text-white/80 transition-colors hover:text-ice"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          {/* Докато проверяваме сесията (isLoading), не показваме нищо, за да не "мига". */}
          {!isLoading && (
            <div className="flex items-center gap-5 border-l border-line pl-8">
              {user ? (
                <>
                  <span className="flex items-baseline gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/80">
                    <span className="font-gothic text-xl normal-case leading-none tracking-normal">Welcome</span>
                    <span className="text-xl leading-none text-ice">{user.firstName}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="border border-white/80 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-colors hover:border-ice hover:text-ice"
                  >
                    Изход
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-xs font-semibold uppercase tracking-[0.15em] text-white/80 transition-colors hover:text-ice"
                  >
                    Вход
                  </Link>
                  <Link
                    to="/register"
                    className="border border-white/80 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-colors hover:border-ice hover:text-ice"
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          )}
          <a
            href="#booking"
            className="bg-ice px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-ink transition-colors hover:bg-white"
          >
            Запази час
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          aria-label={open ? 'Затвори менюто' : 'Отвори менюто'}
          aria-expanded={open}
        >
          <span className={`h-0.5 w-6 bg-white transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 bg-white transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-white transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      {open && (
        <ul className="border-t border-line px-4 pb-6 lg:hidden">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={close}
                className="block border-b border-line py-4 text-lg font-semibold uppercase tracking-[0.15em] hover:text-ice"
              >
                {link.label}
              </a>
            </li>
          ))}
          {!isLoading &&
            (user ? (
              <li className="flex items-center justify-between gap-3 pt-6">
                <span className="flex items-baseline gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-white/80">
                  <span className="font-gothic text-2xl normal-case leading-none tracking-normal">Welcome</span>
                  <span className="text-2xl leading-none text-ice">{user.firstName}</span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="border border-white/80 px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] hover:border-ice hover:text-ice"
                >
                  Изход
                </button>
              </li>
            ) : (
              <li className="grid grid-cols-2 gap-3 pt-6">
                <Link
                  to="/login"
                  onClick={close}
                  className="border border-white/80 py-4 text-center text-sm font-bold uppercase tracking-[0.15em] hover:border-ice hover:text-ice"
                >
                  Вход
                </Link>
                <Link
                  to="/register"
                  onClick={close}
                  className="border border-white/80 py-4 text-center text-sm font-bold uppercase tracking-[0.15em] hover:border-ice hover:text-ice"
                >
                  Регистрация
                </Link>
              </li>
            ))}
          <li className="pt-3">
            <a
              href="#booking"
              onClick={close}
              className="block bg-ice py-4 text-center text-sm font-bold uppercase tracking-[0.15em] text-ink"
            >
              Запази час
            </a>
          </li>
        </ul>
      )}
    </header>
  )
}

export default Navbar
