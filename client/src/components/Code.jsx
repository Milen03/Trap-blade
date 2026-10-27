import SectionTitle from './SectionTitle.jsx'
import { CODE_RULES, STUDIO } from '../data/studio.js'

function Code() {
  return (
    <section id="code" className="relative overflow-hidden py-28 sm:py-36">
      <span
        aria-hidden="true"
        className="text-outline pointer-events-none absolute -left-6 top-10 select-none font-brand text-[22vw] leading-none"
      >
        Respect
      </span>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle kicker="Street Rules">Кодексът</SectionTitle>

        <ol className="grid gap-10 md:grid-cols-3">
          {CODE_RULES.map((rule, i) => (
            <li key={rule.title} className="border-l-4 border-ice pl-6">
              <span className="font-display text-5xl text-white/10">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 font-display text-2xl uppercase">{rule.title}</h3>
              <p className="mt-3 text-lg text-white/60">{rule.text}</p>
            </li>
          ))}
        </ol>

        {/* Booking call-out */}
        <div className="mt-24 flex flex-col items-start justify-between gap-8 border-2 border-ice bg-ice/5 p-8 shadow-[10px_10px_0_#29b6f6] sm:p-12 lg:flex-row lg:items-center">
          <div>
            <p className="font-brand text-4xl text-ice sm:text-5xl">Your Chair Is Waiting</p>
            <p className="mt-3 font-display text-lg uppercase sm:text-2xl">Запази си стола, преди да е зает.</p>
          </div>
          <a
            href={STUDIO.phoneHref}
            className="-skew-x-12 shrink-0 border-2 border-ice bg-ice px-8 py-4 font-display text-sm text-ink shadow-[6px_6px_0_#fff] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_#fff]"
          >
            <span className="inline-block skew-x-12">{STUDIO.phone}</span>
          </a>
        </div>
      </div>
    </section>
  )
}

export default Code
