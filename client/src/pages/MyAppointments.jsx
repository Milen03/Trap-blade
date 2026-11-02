import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cancel, listMine } from '../services/appointmentService.js'
import { STUDIO } from '../data/studio.js'
import { capitalize, dayLabel, hoursUntil } from '../utils/dates.js'
import FormError from '../components/Auth/FormError.jsx'
import { dangerButton, primaryButton, sectionTitle } from '../components/Panel/ui.js'

// Като на сървъра (CANCEL_HOURS_BEFORE в appointmentController.js) — сървърът проверява пак.
const CANCEL_HOURS_BEFORE = 2

const STATUS_LABELS = {
  booked: 'Записан',
  cancelled: 'Отменен',
  completed: 'Дошъл',
  no_show: 'Не дошъл',
}

function AppointmentRow({ appointment, upcoming, busy, onCancel }) {
  const barber = appointment.barber ? `${appointment.barber.firstName} ${appointment.barber.lastName}` : 'Бръснар'
  const canCancel = upcoming && hoursUntil(appointment.date, appointment.time) >= CANCEL_HOURS_BEFORE

  return (
    <li className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center ${upcoming ? '' : 'opacity-50'}`}>
      <div className="flex items-baseline gap-4 sm:w-56">
        <span className={`text-3xl font-bold leading-none ${upcoming ? 'text-ice' : ''}`}>{appointment.time}</span>
        <span className="text-sm uppercase tracking-[0.1em] text-white/80">{capitalize(dayLabel(appointment.date))}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold uppercase">{barber}</p>
        <p className="text-sm text-white/60">
          {appointment.service ? `${appointment.service.name} · ${appointment.service.price} €` : 'Услуга по избор'}
          {' · '}
          <span className={appointment.status === 'booked' ? 'text-ice' : ''}>{STATUS_LABELS[appointment.status]}</span>
        </p>
      </div>
      {upcoming &&
        (canCancel ? (
          <button type="button" onClick={() => onCancel(appointment)} disabled={busy} className={dangerButton}>
            Отмени
          </button>
        ) : (
          <p className="text-xs text-white/60 sm:max-w-44 sm:text-right">
            Отмяна само по телефона:{' '}
            <a href={STUDIO.phoneHref} className="font-bold text-ice hover:text-white">
              {STUDIO.phone}
            </a>
          </p>
        ))}
    </li>
  )
}

// "Моите часове": предстоящите (с отмяна) и миналите/отменените часове на клиента.
function MyAppointments() {
  const [version, setVersion] = useState(0)
  const [data, setData] = useState({ version: -1, list: [], error: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let ignore = false
    listMine()
      .then((list) => !ignore && setData({ version, list, error: '' }))
      .catch((err) => !ignore && setData({ version, list: [], error: err.message }))
    return () => {
      ignore = true
    }
  }, [version])

  const isLoading = data.version !== version
  const upcoming = data.list.filter((a) => a.status === 'booked' && hoursUntil(a.date, a.time) > 0)
  const past = data.list.filter((a) => !upcoming.includes(a)).reverse()

  const cancelAppointment = async (appointment) => {
    if (!window.confirm(`Да отменя ли часа ти на ${dayLabel(appointment.date)} в ${appointment.time}?`)) return
    setError('')
    setNotice('')
    setBusy(true)
    try {
      await cancel(appointment._id)
      setNotice(`Часът в ${appointment.time} е отменен.`)
      setVersion((v) => v + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

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

        <main className="pt-14 sm:pt-16">
          <h1 className="font-brand text-6xl leading-none sm:text-7xl">My Bookings</h1>
          <p className="mt-4 text-white/60">Твоите часове. Можеш да отмениш час до {CANCEL_HOURS_BEFORE} часа преди него.</p>

          <div className="mt-10 space-y-4">
            <FormError message={data.error || error} />
            {notice && (
              <p role="status" className="border border-ice/60 bg-ice/10 px-4 py-3 text-sm text-ice">
                {notice}
              </p>
            )}
          </div>

          {isLoading ? (
            <p className="py-10 text-center text-white/50">Зареждам…</p>
          ) : (
            !data.error && (
              <>
                <section className="mt-6">
                  <h2 className={`${sectionTitle} mb-3`}>Предстоящи ({upcoming.length})</h2>
                  {upcoming.length === 0 ? (
                    <div className="border border-dashed border-line px-4 py-8 text-center">
                      <p className="text-white/60">Нямаш записани часове.</p>
                      {/* Обикновен линк: зарежда началната страница и браузърът сам скролва до #team. */}
                      <a href="/#team" className={`${primaryButton} mt-5 inline-grid place-items-center`}>
                        Запиши час
                      </a>
                    </div>
                  ) : (
                    <ul className="divide-y divide-line border border-line bg-coal">
                      {upcoming.map((a) => (
                        <AppointmentRow key={a._id} appointment={a} upcoming busy={busy} onCancel={cancelAppointment} />
                      ))}
                    </ul>
                  )}
                </section>

                {past.length > 0 && (
                  <section className="mt-10">
                    <h2 className={`${sectionTitle} mb-3`}>Минали и отменени</h2>
                    <ul className="divide-y divide-line border border-line">
                      {past.map((a) => (
                        <AppointmentRow key={a._id} appointment={a} upcoming={false} />
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )
          )}
        </main>
      </div>
    </div>
  )
}

export default MyAppointments
