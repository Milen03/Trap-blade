import SectionHeader from './SectionHeader.jsx'
import { TEAM } from '../data/studio.js'

function Team() {
  return (
    <section id="team" className="scroll-mt-16 border-y border-line bg-coal py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader title="Екипът" note="Издирвани за добри прически" />

        <div className="grid gap-6 md:grid-cols-3">
          {TEAM.map((barber) => (
            <article key={barber.id} className="border border-line bg-ink p-6">
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${barber.lead ? 'text-ice' : 'text-white/80'}`}
              >
                {barber.role}
              </p>
              <h3 className="mt-1 text-2xl font-bold uppercase">{barber.name}</h3>
              <p className="mt-1 text-sm text-white/60">{barber.bio}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Team
