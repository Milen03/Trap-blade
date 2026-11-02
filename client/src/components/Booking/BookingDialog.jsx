import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { getFreeDays, getFreeSlots } from '../../services/availabilityService.js'
import { create } from '../../services/appointmentService.js'
import {
  addMonths,
  calendarGrid,
  capitalize,
  dayLabel,
  monthLabel,
  monthOf,
  todayInSofia,
  WEEKDAYS_SHORT,
} from '../../utils/dates.js'
import { clearPendingBooking, savePendingBooking } from '../../utils/pendingBooking.js'
import FormError from '../Auth/FormError.jsx'
import { primaryButton, secondaryButton, sectionTitle } from '../Panel/ui.js'

// Грешки от сървъра, след които клиентът трябва да избере друг час.
const SLOT_GONE = /зает|не е свободен|мина/i

// Стъпките на записването: ден -> час -> потвърждение -> готово.
const STEPS = [
  { id: 'day', label: 'Ден' },
  { id: 'time', label: 'Час' },
  { id: 'confirm', label: 'Потвърди' },
]

function StepBar({ step }) {
  const current = STEPS.findIndex((s) => s.id === step)
  return (
    <ol className="grid grid-cols-3 gap-1" aria-label="Стъпки">
      {STEPS.map((s, i) => (
        <li
          key={s.id}
          aria-current={i === current ? 'step' : undefined}
          className={`border-t-2 pt-2 text-xs font-semibold uppercase tracking-[0.2em] ${
            i <= current ? 'border-ice text-ice' : 'border-line text-white/40'
          }`}
        >
          {String(i + 1).padStart(2, '0')} {s.label}
        </li>
      ))}
    </ol>
  )
}

// Диалог за записване на час при избрания бръснар за избраната услуга.
// barber: { id, name, services }, service: { id, name, price }
// initial: { date, time } — когато се връщаме след вход, отваряме направо потвърждението.
function BookingDialog({ barber, service, initial, onClose }) {
  const dialogRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const today = todayInSofia()

  const [step, setStep] = useState(initial ? 'confirm' : 'day')
  const [month, setMonth] = useState(initial ? monthOf(initial.date) : monthOf(today))
  const [date, setDate] = useState(initial?.date || '')
  const [time, setTime] = useState(initial?.time || '')
  // Увеличава се, когато трябва да заредим часовете наново (например някой е взел нашия час).
  const [slotsVersion, setSlotsVersion] = useState(0)
  const [freeDays, setFreeDays] = useState({ key: '', list: [], error: '' })
  const [freeSlots, setFreeSlots] = useState({ key: '', list: [], error: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [booked, setBooked] = useState(null)

  // Нативният <dialog>: showModal() държи фокуса вътре, а Esc го затваря.
  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    // Отворихме диалога — запазеният избор (ако е имало) вече не трябва.
    clearPendingBooking()
    return () => dialog.close()
  }, [])

  // Свободните дни за месеца.
  const daysKey = `${barber.id}|${month}`
  useEffect(() => {
    let ignore = false
    getFreeDays(barber.id, month)
      .then((list) => !ignore && setFreeDays({ key: daysKey, list, error: '' }))
      .catch((err) => !ignore && setFreeDays({ key: daysKey, list: [], error: err.message }))
    return () => {
      ignore = true
    }
  }, [barber.id, month, daysKey])

  // Свободните часове за избрания ден.
  const slotsKey = `${barber.id}|${date}|${slotsVersion}`
  useEffect(() => {
    if (!date) return undefined
    let ignore = false
    getFreeSlots(barber.id, date)
      .then((data) => !ignore && setFreeSlots({ key: slotsKey, list: data.slots, error: '' }))
      .catch((err) => !ignore && setFreeSlots({ key: slotsKey, list: [], error: err.message }))
    return () => {
      ignore = true
    }
  }, [barber.id, date, slotsKey])

  const freeByDate = new Map(freeDays.list.map((d) => [d.date, d.free]))
  const daysLoading = freeDays.key !== daysKey
  const slotsLoading = freeSlots.key !== slotsKey

  const pickDate = (value) => {
    setDate(value)
    setTime('')
    setError('')
    setStep('time')
  }

  const pickTime = (value) => {
    setTime(value)
    setError('')
    setStep('confirm')
  }

  // Гост: запазваме избора и го пращаме да влезе. След входа диалогът се отваря наново (виж Team.jsx).
  const goToAuth = (path) => {
    savePendingBooking({ barberId: barber.id, serviceId: service.id, date, time })
    navigate(path, { state: { from: '/' } })
  }

  const confirm = async () => {
    setError('')
    setIsSubmitting(true)
    try {
      const appointment = await create({ barberId: barber.id, date, time, serviceId: service.id })
      setBooked(appointment)
    } catch (err) {
      setError(err.message)
      // Часът вече не е свободен — връщаме към избора на час с обновен списък.
      if (SLOT_GONE.test(err.message)) {
        setTime('')
        setStep('time')
        setSlotsVersion((v) => v + 1)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const canGoBackMonth = month > monthOf(today)

  return (
    <dialog
      ref={dialogRef}
      // Esc: спираме вграденото затваряне и затваряме през onClose (родителят маха диалога).
      // Не слушаме събитието "close" — то идва и от dialog.close() при почистването на ефекта
      // (в development React пуска ефектите два пъти) и би затворило диалога веднага.
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      aria-labelledby="booking-title"
      className="m-0 h-svh max-h-none w-full max-w-none overflow-y-auto bg-ink p-0 text-white backdrop:bg-black/75 sm:m-auto sm:h-fit sm:max-h-[92svh] sm:max-w-lg sm:border sm:border-line"
    >
      <div className="space-y-6 p-5 sm:p-7">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className={sectionTitle}>Записване</p>
            <h2 id="booking-title" className="mt-1 text-3xl font-bold uppercase leading-tight">
              {barber.name}
            </h2>
            <p className="mt-1 text-ice">
              {service.name} · {service.price} €
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center border border-line text-2xl leading-none transition-colors hover:border-ice hover:text-ice"
            aria-label="Затвори"
          >
            ×
          </button>
        </header>

        {booked ? (
          // ---------- Готово ----------
          <div className="space-y-6">
            <div className="border border-ice bg-ice/10 p-5">
              <p className="font-brand text-5xl leading-none text-ice">Done</p>
              <p className="mt-3 text-2xl font-bold uppercase">Часът ти е записан!</p>
              <p className="mt-3 text-white/80">
                {capitalize(dayLabel(booked.date))} в <strong>{booked.time}</strong>
                <br />
                при {barber.name} · {service.name} · {service.price} €
              </p>
            </div>
            <p className="text-sm text-white/60">
              Ако не можеш да дойдеш, отмени часа от „Моите часове“ поне 2 часа преди него.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link to="/my-appointments" className={`${primaryButton} grid place-items-center`}>
                Моите часове
              </Link>
              <button type="button" onClick={onClose} className={secondaryButton}>
                Затвори
              </button>
            </div>
          </div>
        ) : (
          <>
            <StepBar step={step} />
            <FormError message={error} />

            {/* ---------- 1. Ден ---------- */}
            {step === 'day' && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setMonth((m) => addMonths(m, -1))}
                    disabled={!canGoBackMonth}
                    className="grid size-11 place-items-center border border-line text-xl transition-colors enabled:hover:border-ice enabled:hover:text-ice disabled:opacity-30"
                    aria-label="Предишен месец"
                  >
                    ‹
                  </button>
                  <h3 className="text-xl font-bold uppercase tracking-[0.1em]" aria-live="polite">
                    {monthLabel(month)}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setMonth((m) => addMonths(m, 1))}
                    className="grid size-11 place-items-center border border-line text-xl transition-colors hover:border-ice hover:text-ice"
                    aria-label="Следващ месец"
                  >
                    ›
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 pb-2" aria-hidden="true">
                  {WEEKDAYS_SHORT.map((name) => (
                    <span key={name} className="text-center text-xs font-semibold uppercase text-white/50">
                      {name}
                    </span>
                  ))}
                </div>
                <div className={`grid grid-cols-7 gap-1 ${daysLoading ? 'opacity-40' : ''}`}>
                  {calendarGrid(month)
                    .flat()
                    .map((value, i) => {
                      if (!value) return <span key={`empty-${i}`} />
                      const free = freeByDate.get(value) || 0
                      const selected = value === date
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => pickDate(value)}
                          disabled={!free || daysLoading}
                          aria-pressed={selected}
                          aria-label={`${capitalize(dayLabel(value))}${free ? `, ${free} свободни часа` : ', няма свободни часове'}`}
                          className={`flex min-h-14 flex-col items-center justify-center border transition-colors disabled:cursor-not-allowed ${
                            selected
                              ? 'border-ice bg-ice text-ink'
                              : free
                                ? 'border-line bg-coal hover:border-ice'
                                : 'border-transparent text-white/25'
                          }`}
                        >
                          <span className="text-lg font-bold leading-none">{Number(value.slice(8))}</span>
                          {free > 0 && (
                            <span className={`mt-1 text-[10px] uppercase ${selected ? 'text-ink/70' : 'text-ice'}`}>
                              {free} св.
                            </span>
                          )}
                        </button>
                      )
                    })}
                </div>

                {freeDays.error && <FormError message={freeDays.error} />}
                {!daysLoading && !freeDays.error && freeDays.list.length === 0 && (
                  <p className="mt-4 border border-dashed border-line px-4 py-4 text-center text-sm text-white/60">
                    Няма свободни часове през {monthLabel(month).toLowerCase()}. Виж следващия месец.
                  </p>
                )}
              </div>
            )}

            {/* ---------- 2. Час ---------- */}
            {step === 'time' && (
              <div>
                <button
                  type="button"
                  onClick={() => setStep('day')}
                  className="mb-4 text-sm uppercase tracking-[0.2em] text-white/70 hover:text-ice"
                >
                  ← {capitalize(dayLabel(date))}
                </button>

                {slotsLoading ? (
                  <p className="py-6 text-center text-white/50">Зареждам свободните часове…</p>
                ) : freeSlots.error ? (
                  <FormError message={freeSlots.error} />
                ) : freeSlots.list.length === 0 ? (
                  <p className="border border-dashed border-line px-4 py-6 text-center text-sm text-white/60">
                    Няма свободни часове за този ден — избери друг ден.
                  </p>
                ) : (
                  <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {freeSlots.list.map((value) => (
                      <li key={value}>
                        <button
                          type="button"
                          onClick={() => pickTime(value)}
                          aria-pressed={value === time}
                          className={`h-12 w-full border text-lg font-bold transition-colors ${
                            value === time ? 'border-ice bg-ice text-ink' : 'border-line bg-coal hover:border-ice hover:text-ice'
                          }`}
                        >
                          {value}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* ---------- 3. Потвърждение ---------- */}
            {step === 'confirm' && (
              <div className="space-y-5">
                <dl className="divide-y divide-line border border-line">
                  {[
                    ['Ден', capitalize(dayLabel(date))],
                    ['Час', time],
                    ['Бръснар', barber.name],
                    ['Услуга', `${service.name} · ${service.price} €`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-baseline justify-between gap-4 px-4 py-3">
                      <dt className="text-xs uppercase tracking-[0.2em] text-white/50">{label}</dt>
                      <dd className="text-right font-bold uppercase">{value}</dd>
                    </div>
                  ))}
                </dl>

                {user ? (
                  <>
                    <p className="text-sm text-white/60">
                      Записваш се като {user.firstName} {user.lastName}
                      {user.phone ? ` · ${user.phone}` : ''}. Часът е твой веднага след потвърждението.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
                      <button type="button" onClick={() => setStep('time')} className={secondaryButton}>
                        Назад
                      </button>
                      <button type="button" onClick={confirm} disabled={isSubmitting} className={primaryButton}>
                        {isSubmitting ? 'Записвам…' : 'Потвърди'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-white/70">
                      За да потвърдиш, влез в профила си. Изборът ти ще те чака след входа.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button type="button" onClick={() => goToAuth('/login')} className={primaryButton}>
                        Вход
                      </button>
                      <button type="button" onClick={() => goToAuth('/register')} className={secondaryButton}>
                        Регистрация
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('time')}
                      className="text-sm uppercase tracking-[0.2em] text-white/60 hover:text-ice"
                    >
                      ← Друг час
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </dialog>
  )
}

export default BookingDialog
