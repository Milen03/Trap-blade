import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LEGAL } from '../../data/studio.js'

// Общ шаблон за "Общи условия" и "Поверителност".
export function LegalSection({ title, children }) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold uppercase">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-white/75 [&_a]:text-ice [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-white [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  )
}

function LegalLayout({ title, children }) {
  // Идваме от средата на началната страница — започваме отгоре.
  useEffect(() => {
    // instant: сайтът има плавно скролване (index.css), а тук искаме веднага да сме горе.
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="min-h-svh px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
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

        <main className="pb-16 pt-14 sm:pt-16">
          <h1 className="text-5xl font-bold uppercase leading-none sm:text-6xl">{title}</h1>
          <p className="mt-4 text-sm uppercase tracking-[0.2em] text-white/50">Последна промяна: {LEGAL.updated}</p>

          {children}

          <nav className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6 text-sm uppercase tracking-[0.15em] text-white/60">
            <Link to="/terms" className="hover:text-ice">
              Общи условия
            </Link>
            <Link to="/privacy" className="hover:text-ice">
              Поверителност
            </Link>
            <a href="/#team" className="hover:text-ice">
              Запази час
            </a>
          </nav>
        </main>
      </div>
    </div>
  )
}

export default LegalLayout
