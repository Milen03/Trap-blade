import { useState } from 'react'
import { TEAM } from '../data/studio.js'

// Faint horizontal lines behind the card header.
const STRIPES = {
  backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 21px, rgba(255,255,255,0.035) 21px 22px)',
}

function RadioDot({ checked }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-[18px] shrink-0 place-items-center rounded-full transition-colors ${
        checked ? 'border-2 border-ice bg-ice/25' : 'bg-white'
      }`}
    >
      {checked && <span className="size-2.5 rounded-full bg-ice" />}
    </span>
  )
}

function BarberCard({ barber, selected, serviceId, onSelectBarber, onSelectService }) {
  const chosen = selected ? barber.services.find((s) => s.id === serviceId) : null

  return (
    <article
      className={`flex flex-col border transition-colors ${
        selected ? 'border-ice bg-[#0d1117]' : 'border-line bg-coal hover:border-white/25'
      }`}
    >
      {/* Header: id, badges, barber toggle, name */}
      <div className="border-b border-line px-6 pb-4 pt-6" style={STRIPES}>
        <div className="flex items-center gap-3">
          <span className="bg-white px-2.5 py-1 text-xs font-semibold tracking-[0.2em] text-ink">{barber.id}</span>
          {barber.lead && (
            <span className="border border-ice px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.2em] text-ice">
              Главен
            </span>
          )}

          <label className="ml-auto flex cursor-pointer items-center gap-3">
            <input
              type="radio"
              name="barber"
              value={barber.id}
              checked={selected}
              onChange={() => onSelectBarber(barber.id)}
              className="peer sr-only"
            />
            <span
              className={`text-xs font-semibold uppercase tracking-[0.25em] ${selected ? 'text-ice' : 'text-white/60'}`}
            >
              {selected ? 'Избран' : 'Избери'}
            </span>
            <span className="rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ice">
              <span
                aria-hidden="true"
                className={`grid size-6 place-items-center rounded-full transition-colors ${
                  selected ? 'border-2 border-ice bg-ice/25' : 'bg-white'
                }`}
              >
                {selected && <span className="size-3.5 rounded-full bg-ice" />}
              </span>
            </span>
          </label>
        </div>

        <p
          className={`mt-5 text-xs font-semibold uppercase tracking-[0.3em] ${barber.lead ? 'text-ice' : 'text-white/80'}`}
        >
          {barber.role}
        </p>
        <h3 className="mt-1 text-4xl font-bold uppercase leading-tight">{barber.name}</h3>
      </div>

      {/* Services */}
      <fieldset className="flex flex-1 flex-col px-6 pb-6 pt-8">
        <legend className="sr-only">Услуги при {barber.name}</legend>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
          {selected ? 'Избери услуга' : 'Услуги'}
        </p>

        <ul className="space-y-2.5">
          {barber.services.map((service) => {
            const checked = selected && service.id === serviceId
            return (
              <li key={service.id}>
                <label
                  className={`flex cursor-pointer items-center gap-3 border px-4 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ice ${
                    checked ? 'border-ice bg-ice/10' : 'border-line bg-ink hover:border-white/25'
                  }`}
                >
                  <input
                    type="radio"
                    name={`service-${barber.id}`}
                    value={service.id}
                    checked={checked}
                    onChange={() => onSelectService(barber.id, service.id)}
                    className="sr-only"
                  />
                  <RadioDot checked={checked} />
                  <span className="text-lg font-bold uppercase">{service.name}</span>
                  <span aria-hidden="true" className="mx-1 flex-1 border-b border-dotted border-white/20" />
                  <span className={`text-xl font-bold ${checked ? 'text-ice' : 'text-white'}`}>{service.price} €</span>
                </label>
              </li>
            )
          })}
        </ul>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between text-sm uppercase">
            <span className="text-white/60">Записваш се за</span>
            {chosen ? (
              <span className="font-bold">
                {chosen.name} · {chosen.price} €
              </span>
            ) : (
              <span className="text-white/40">—</span>
            )}
          </div>

          {/* Front-end only for now: the booking request is not sent anywhere yet. */}
          <button
            type="button"
            onClick={() => onSelectBarber(barber.id)}
            className={`mt-5 flex w-full items-center justify-center gap-3 border-2 py-4 text-sm font-bold uppercase tracking-[0.3em] transition-colors ${
              selected
                ? 'border-ice bg-ice text-ink hover:bg-white hover:border-white'
                : 'border-white/25 bg-transparent text-white hover:border-ice hover:text-ice'
            }`}
          >
            Запиши час
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </fieldset>
    </article>
  )
}

function Team() {
  // Only one barber can be selected at a time; picking another clears the previous choice.
  const [selection, setSelection] = useState({ barberId: TEAM[0].id, serviceId: TEAM[0].services[0].id })

  const selectBarber = (barberId) =>
    setSelection((prev) => (prev.barberId === barberId ? prev : { barberId, serviceId: null }))

  const selectService = (barberId, serviceId) => setSelection({ barberId, serviceId })

  return (
    <section id="team" className="scroll-mt-16 bg-ink py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.35em] text-ice">
              <span aria-hidden="true" className="h-px w-10 bg-ice" />
              Издирвани за добри прически
            </p>
            <h2 className="mt-4 text-7xl font-bold uppercase leading-none sm:text-8xl">Екипът</h2>
          </div>
          <p className="max-w-sm text-white/60 lg:mb-3">
            Избери бръснар, отбележи услугата и си запази час. Цените са в евро.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TEAM.map((barber) => (
            <BarberCard
              key={barber.id}
              barber={barber}
              selected={selection.barberId === barber.id}
              serviceId={selection.serviceId}
              onSelectBarber={selectBarber}
              onSelectService={selectService}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Team
