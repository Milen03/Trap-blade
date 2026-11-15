import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/trapblade-logo.webp'

// Наклонената синя лента като на началната страница (Marquee.jsx), но с текст за 404.
// Двете копия правят безкрайно въртене с -50% (animate-marquee в index.css).
function Tape() {
  const items = Array.from({ length: 20 }, (_, i) => (i % 2 ? 'Страницата я няма' : '404'))
  return (
    <div aria-hidden="true" className="overflow-x-clip py-10">
      <div className="-mx-[5vw] rotate-2 overflow-hidden bg-ice py-2">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center">
              {items.map((word, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4 px-2 text-sm font-bold uppercase tracking-[0.25em] text-ink"
                >
                  {word}
                  <span className="text-base">×</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  )
}

// Страница за адрес, който не съществува (всички непознати пътища в App.jsx).
function NotFound() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })

    // Заглавие на таба + Google да не индексира грешни адреси.
    const previousTitle = document.title
    document.title = '404 · Страницата я няма · TrapBlade'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex'
    document.head.appendChild(robots)

    return () => {
      document.title = previousTitle
      robots.remove()
    }
  }, [])

  return (
    <div className="flex min-h-svh flex-col overflow-x-clip">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="" className="h-9 w-9" />
          <span className="font-brand text-2xl leading-none">TrapBlade</span>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-ice">
          <span className="h-px w-8 bg-ice" />
          Грешен адрес
        </p>

        {/* Pirata One (font-gothic) има цифри; шрифтът на логото (font-brand) — не. */}
        <h1 className="mt-4 font-gothic text-[9rem] leading-[0.85] sm:text-[13rem] lg:text-[16rem]">404</h1>

        <h2 className="mt-6 text-4xl font-bold uppercase leading-tight sm:text-5xl">Страницата я няма</h2>
        <p className="mt-4 max-w-md text-white/60">
          Май сме я подстригали твърде късо. Провери адреса или се върни към началото — столът те чака.
        </p>
        <p className="mt-3 max-w-md break-all font-mono text-sm text-white/35">{pathname}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="flex items-center gap-3 bg-ice px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] text-ink transition-colors hover:bg-white"
          >
            <span aria-hidden="true">←</span> Към началото
          </Link>
          {/* Обикновен линк: зарежда началната страница и браузърът сам скролва до #team. */}
          <a
            href="/#team"
            className="flex items-center gap-3 border border-white/30 px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] transition-colors hover:border-ice hover:text-ice"
          >
            Запази час <span aria-hidden="true">→</span>
          </a>
        </div>
      </main>

      <Tape />
    </div>
  )
}

export default NotFound
