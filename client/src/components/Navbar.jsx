import { useState } from 'react'
import logo from '../assets/trapblade-logo.webp'
import { NAV_LINKS } from '../data/studio.js'

function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#home" onClick={close} className="flex items-center gap-3">
          <img src={logo} alt="" className="h-9 w-9" />
          <span className="font-brand text-2xl leading-none">TrapBlade</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
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
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label={open ? 'Затвори менюто' : 'Отвори менюто'}
          aria-expanded={open}
        >
          <span className={`h-0.5 w-6 bg-white transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 bg-white transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-white transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      {open && (
        <ul className="border-t border-line px-4 pb-6 md:hidden">
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
          <li className="pt-6">
            <a
              href="#booking"
              onClick={close}
              className="block bg-ice py-4 text-center text-sm font-bold uppercase tracking-[0.15em] text-ink"
            >
              Запази стол
            </a>
          </li>
        </ul>
      )}
    </header>
  )
}

export default Navbar
