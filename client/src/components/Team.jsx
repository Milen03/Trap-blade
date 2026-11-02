import { useEffect, useState } from 'react'
import { STUDIO, TEAM } from '../data/studio.js'
import { useAuth } from '../hooks/useAuth.js'
import { getBarbers } from '../services/barberService.js'
import { readPendingBooking } from '../utils/pendingBooking.js'
import BookingDialog from './Booking/BookingDialog.jsx'

// Статичният екип от studio.js — показва се, докато зареждаме бръснарите от сървъра
// или ако сървърът не отговаря (тогава онлайн записването е изключено).
const FALLBACK_TEAM = TEAM.map((barber) => ({ ...barber, code: barber.id }))

// Бръснар от API-то (GET /api/barbers) -> във вида, който ползва картата.
function toCard(barber, index) {
  return {
    id: barber._id,
    code: `TB-${String(index + 1).padStart(3, '0')}`,
    role: barber.title || 'Бръснар',
    name: `${barber.firstName} ${barber.lastName}`.trim(),
    lead: barber.isLead,
    services: barber.services || [],
  }
}

// Faint horizontal lines behind the card header.
const STRIPES = {
  backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 21px, rgba(255,255,255,0.035) 21px 22px)',
}

function RadioDot({ checked }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-[18px] shrink-0 place-items-center rounded-full transition-colors ${checked ? 'border-2 border-ice bg-ice/25' : 'bg-white'
        }`}
    >
      {checked && <span className="size-2.5 rounded-full bg-ice" />}
    </span>
  )
}

function BarberCard({ barber, selected, serviceId, canBook, onSelectBarber, onSelectService, onBook }) {
  const chosen = selected ? barber.services.find((s) => s.id === serviceId) : null

  return (
    <article
      className={`flex flex-col border transition-colors ${selected ? 'border-ice bg-[#0d1117]' : 'border-line bg-coal hover:border-white/25'
        }`}
    >
      {/* Header: id, badges, barber toggle, name */}
      <div className="border-b border-line px-6 pb-4 pt-6" style={STRIPES}>
        <div className="flex items-center gap-3">
          <span className="bg-white px-2.5 py-1 text-xs font-semibold tracking-[0.2em] text-ink">{barber.code}</span>
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
                className={`grid size-6 place-items-center rounded-full transition-colors ${selected ? 'border-2 border-ice bg-ice/25' : 'bg-white'
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
                  className={`flex cursor-pointer items-center gap-3 border px-4 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ice ${checked ? 'border-ice bg-ice/10' : 'border-line bg-ink hover:border-white/25'
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

          {/* Първото натискане избира бръснаря; после (с избрана услуга) отваря записването. */}
          <button
            type="button"
            onClick={() => (selected ? onBook(barber, chosen) : onSelectBarber(barber.id))}
            disabled={selected && (!chosen || !canBook)}
            className={`mt-5 flex w-full items-center justify-center gap-3 border-2 py-4 text-sm font-bold uppercase tracking-[0.3em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${selected
                ? 'border-ice bg-ice text-ink enabled:hover:bg-white enabled:hover:border-white'
                : 'border-white/25 bg-transparent text-white hover:border-ice hover:text-ice'
              }`}
          >
            {selected && !chosen ? 'Избери услуга' : 'Запиши час'}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </fieldset>
    </article>
  )
}

function Team() {
  const { user, isLoading: authLoading } = useAuth()
  // Бръснарите от сървъра: loading -> ok | error.
  const [team, setTeam] = useState({ status: 'loading', list: FALLBACK_TEAM })
  // Изборът на потребителя. Докато не е избрал нищо, е избран първият бръснар и първата му услуга.
  const [selection, setSelection] = useState(null)
  // Отвореният диалог за записване: { barber, service, initial? }.
  const [booking, setBooking] = useState(null)
  // Изборът на гост, който е отишъл да влезе (виж BookingDialog.jsx) — отваряме го наново след входа.
  const [pending, setPending] = useState(readPendingBooking)

  useEffect(() => {
    let ignore = false
    getBarbers()
      .then((barbers) => {
        if (!ignore && barbers.length) setTeam({ status: 'ok', list: barbers.map(toCard) })
        else if (!ignore) setTeam({ status: 'error', list: FALLBACK_TEAM })
      })
      .catch(() => {
        if (!ignore) setTeam({ status: 'error', list: FALLBACK_TEAM })
      })
    return () => {
      ignore = true
    }
  }, [])

  const canBook = team.status === 'ok'
  const first = team.list[0]
  const current =
    selection && team.list.some((b) => b.id === selection.barberId)
      ? selection
      : { barberId: first.id, serviceId: first.services[0]?.id ?? null }

  const selectBarber = (barberId) =>
    setSelection((prev) => (prev?.barberId === barberId ? prev : { barberId, serviceId: null }))

  const selectService = (barberId, serviceId) => setSelection({ barberId, serviceId })

  // След вход: ако госта го чака избран час, отваряме диалога направо на потвърждението.
  let restored = null
  if (!booking && pending && canBook && user && !authLoading) {
    const barber = team.list.find((b) => b.id === pending.barberId)
    const service = barber?.services.find((s) => s.id === pending.serviceId)
    if (barber && service) restored = { barber, service, initial: { date: pending.date, time: pending.time } }
  }
  const activeBooking = booking || restored

  const closeBooking = () => {
    setBooking(null)
    setPending(null)
  }

  return (
    <section id="team" className="scroll-mt-16 bg-ink py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="mt-4 text-7xl font-bold uppercase leading-none sm:text-8xl">Екипът</h2>
          </div>
          <p className="max-w-sm text-white/60 lg:mb-3">
            Избери бръснар, отбележи услугата и си запази час. Цените са в евро.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {team.list.map((barber) => (
            <BarberCard
              key={barber.id}
              barber={barber}
              selected={current.barberId === barber.id}
              serviceId={current.serviceId}
              canBook={canBook}
              onSelectBarber={selectBarber}
              onSelectService={selectService}
              onBook={(b, service) => setBooking({ barber: b, service })}
            />
          ))}
        </div>

        {team.status === 'error' && (
          <p role="status" className="mt-6 border border-line bg-coal px-4 py-3 text-white/70">
            Онлайн записването временно не работи — обади се на{' '}
            <a href={STUDIO.phoneHref} className="font-bold text-ice hover:text-white">
              {STUDIO.phone}
            </a>
            .
          </p>
        )}
      </div>

      {activeBooking && (
        <BookingDialog
          barber={activeBooking.barber}
          service={activeBooking.service}
          initial={activeBooking.initial}
          onClose={closeBooking}
        />
      )}
    </section>
  )
}

export default Team
