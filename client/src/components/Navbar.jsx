import { useEffect, useState } from 'react'
import Logo from './Logo.jsx'
import { NAV_LINKS, STUDIO } from '../data/studio.js'

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = () => setOpen(false)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? 'border-b border-ice/30 bg-ink/90 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="#home" onClick={close} className="group flex items-center gap-3">
          <Logo className="h-12 w-12 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="font-brand text-3xl leading-none text-white">TrapBlade</span>
        </a>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="relative font-display text-xs tracking-wider text-white/80 transition-colors hover:text-ice after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-0 after:bg-ice after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={STUDIO.phoneHref}
          className="hidden -skew-x-12 border-2 border-ice bg-ice px-5 py-2.5 font-display text-xs text-ink shadow-[4px_4px_0_#fff] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#fff] lg:block"
        >
          <span className="inline-block skew-x-12">Запази час</span>
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 border-2 border-white/20 lg:hidden"
          aria-label={open ? 'Затвори менюто' : 'Отвори менюто'}
          aria-expanded={open}
        >
          <span className={`h-0.5 w-6 bg-white transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 bg-ice transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-white transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-ink lg:hidden">
          <ul className="flex flex-col px-4 py-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={close}
                  className="block border-b border-white/5 py-4 font-display text-lg text-white hover:text-ice"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-6">
              <a
                href={STUDIO.phoneHref}
                onClick={close}
                className="block bg-ice py-4 text-center font-display text-sm text-ink"
              >
                Запази час
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

export default Navbar
