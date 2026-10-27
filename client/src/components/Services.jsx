import SectionTitle from './SectionTitle.jsx'
import { SERVICES, STUDIO } from '../data/studio.js'

function Services() {
  return (
    <section id="services" className="relative bg-coal py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle kicker="The Menu">Услуги</SectionTitle>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <article
              key={service.id}
              className="group relative flex flex-col items-center border-2 border-steel bg-ink p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-ice hover:shadow-[8px_8px_0_#29b6f6]"
            >
              <span className="absolute left-4 top-3 font-display text-xs text-white/20 group-hover:text-ice">
                {service.tag}
              </span>

              {/* Same badge as the Instagram highlight circles */}
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-steel bg-black transition-colors group-hover:border-ice">
                <span className="-rotate-6 border-2 border-white px-1.5 py-0.5 font-display text-[10px] text-white">
                  TRAPBLADE
                </span>
              </div>

              <h3 className="mt-6 font-display text-xl uppercase">{service.name}</h3>
              <p className="mt-3 text-white/60">{service.text}</p>
            </article>
          ))}
        </div>

        <p className="mt-12 text-center text-white/50">
          Цени и свободни часове — на{' '}
          <a href={STUDIO.phoneHref} className="text-ice underline-offset-4 hover:underline">
            {STUDIO.phone}
          </a>{' '}
          или в{' '}
          <a href={STUDIO.instagramUrl} target="_blank" rel="noreferrer" className="text-ice underline-offset-4 hover:underline">
            Instagram
          </a>
          .
        </p>
      </div>
    </section>
  )
}

export default Services
