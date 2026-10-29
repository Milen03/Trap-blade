import SectionHeader from './SectionHeader.jsx'
import { SERVICES } from '../data/studio.js'

function Services() {
  return (
    <section id="services" className="scroll-mt-16 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader title="Услугите" />

        <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => (
            <article
              key={service.id}
              className="group flex flex-col bg-ink p-5 transition-colors hover:bg-coal"
            >
              <span className="text-xs font-semibold tracking-[0.2em] text-ice">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 text-3xl font-bold uppercase transition-colors group-hover:text-ice">
                {service.name}
              </h3>
              <p className="mt-2 text-sm text-white/60">{service.text}</p>

            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
