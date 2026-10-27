import SectionHeader from './SectionHeader.jsx'
import { TEAM } from '../data/studio.js'

const HEIGHTS = [200, 190, 180, 170, 160]

// Mugshot-style height chart that frames each barber's photo.
function Mugshot({ id, photo, name }) {
  return (
    <div className="relative h-72 overflow-hidden bg-[#141414]">
      <ul className="absolute inset-0 flex flex-col justify-around py-4">
        {HEIGHTS.map((h) => (
          <li key={h} className="flex items-center gap-2 border-t border-white/10 pl-3 text-[10px] text-white/40">
            {h}
          </li>
        ))}
      </ul>
      <div className="absolute inset-y-6 left-[18%] right-[18%] border-x border-dashed border-white/20" />

      {photo ? (
        <img src={photo} alt={name} className="absolute inset-0 h-full w-full object-cover grayscale" />
      ) : (
        <p className="absolute inset-x-0 top-[42%] text-center text-[11px] uppercase tracking-[0.2em] text-white/40">
          [Снимка на
          <br />
          бръснаря]
        </p>
      )}

      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-3 py-1 text-xs font-bold tracking-[0.2em] text-ink">
        {id}
      </span>
    </div>
  )
}

function Team() {
  return (
    <section id="team" className="scroll-mt-16 border-y border-line bg-coal py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader title="Екипът" note="Издирвани за добри прически" />

        <div className="grid gap-6 md:grid-cols-3">
          {TEAM.map((barber) => (
            <article key={barber.id} className="border border-line bg-ink">
              <Mugshot {...barber} />
              <div className="p-4">
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${barber.lead ? 'text-ice' : 'text-white/80'}`}
                >
                  {barber.role}
                </p>
                <h3 className="mt-1 text-2xl font-bold uppercase">{barber.name}</h3>
                <p className="mt-1 text-sm text-white/60">{barber.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Team
