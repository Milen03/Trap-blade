import { useState } from 'react'
import { toggleSlot, updateDay } from '../../services/scheduleService.js'
import { cancel } from '../../services/appointmentService.js'
import { dayLabel } from '../../utils/dates.js'
import FormError from '../Auth/FormError.jsx'
import ManualBookingForm from './ManualBookingForm.jsx'
import {
  dangerButton,
  inputClass,
  labelClass,
  primaryButton,
  secondaryButton,
  sectionTitle,
  STEP_OPTIONS,
} from './ui.js'

const STATUS_LABELS = {
  cancelled: 'Отменен',
  completed: 'Дошъл',
  no_show: 'Не дошъл',
}

// Бързо задаване на работното време за деня (часовете се генерират наново).
function HoursForm({ day, busy, onSave }) {
  const slots = day?.slots || []
  const [values, setValues] = useState({
    from: slots[0] || '10:00',
    to: '21:00',
    step: 30,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(values)
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-3">
      <div>
        <label htmlFor="day-from" className={labelClass}>
          От
        </label>
        <input
          id="day-from"
          type="time"
          step="300"
          value={values.from}
          onChange={(e) => setValues((v) => ({ ...v, from: e.target.value }))}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label htmlFor="day-to" className={labelClass}>
          До
        </label>
        <input
          id="day-to"
          type="time"
          step="300"
          value={values.to}
          onChange={(e) => setValues((v) => ({ ...v, to: e.target.value }))}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label htmlFor="day-step" className={labelClass}>
          През
        </label>
        <select
          id="day-step"
          value={values.step}
          onChange={(e) => setValues((v) => ({ ...v, step: Number(e.target.value) }))}
          className={inputClass}
        >
          {STEP_OPTIONS.map((step) => (
            <option key={step} value={step}>
              {step} мин
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={busy} className={`${primaryButton} col-span-3`}>
        Запази работното време
      </button>
    </form>
  )
}

// Всичко за избрания ден: часовете, записаните клиенти и промени по графика.
// - isOwnSchedule: бръснарят гледа своя график (може да го променя);
// - собственикът, който гледа чужд график, може само да вписва и отменя клиенти.
function DayPanel({ date, day, appointments, today, now, isOwnSchedule, services, barberId, notice, onNotice, onChanged }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showHours, setShowHours] = useState(false)
  const [openTime, setOpenTime] = useState('')
  // Часът, на който е кликнато — попълва се във формата "Добави клиент".
  const [pickedTime, setPickedTime] = useState('')

  const isPast = date < today
  const canEditSchedule = isOwnSchedule && !isPast
  const canBook = !isPast

  const booked = appointments.filter((a) => a.status === 'booked')
  const bookedByTime = new Map(booked.map((a) => [a.time, a]))
  // Плочките: часовете от графика + записаните извън графика (вписани ръчно).
  const times = [...new Set([...(day && !day.dayOff ? day.slots : []), ...bookedByTime.keys()])].sort()

  // Изпълнява заявка към сървъра, показва грешката (ако има) и презарежда месеца.
  // Връща true при успех.
  async function run(action, message) {
    setError('')
    onNotice('')
    setBusy(true)
    try {
      await action()
      onChanged(message)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setBusy(false)
    }
  }

  const makeDayOff = () => {
    if (window.confirm('Да стане ли този ден почивен? Всички свободни часове ще се махнат.')) {
      run(() => updateDay(date, { dayOff: true }), 'Денят е почивен.')
    }
  }

  const saveHours = (values) =>
    run(() => updateDay(date, values), 'Работното време е запазено.').then((ok) => ok && setShowHours(false))

  const closeSlot = (time) => run(() => toggleSlot(date, time, false), `Часът ${time} е затворен.`)

  const openSlot = (e) => {
    e.preventDefault()
    if (openTime) run(() => toggleSlot(date, openTime, true), `Часът ${openTime} е отворен.`).then((ok) => ok && setOpenTime(''))
  }

  const cancelAppointment = (appointment) => {
    if (window.confirm(`Да отменя ли часа на ${appointment.clientName} в ${appointment.time}?`)) {
      run(() => cancel(appointment._id), `Часът на ${appointment.clientName} е отменен.`)
    }
  }

  const pickTime = (time) => {
    setPickedTime(time)
    document.getElementById('manual-booking')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  let dayStatus = 'Няма график'
  if (day?.dayOff) dayStatus = 'Почивен ден'
  else if (day) dayStatus = `${booked.length} записани · ${day.slots.length} часа`

  return (
    <section aria-labelledby="day-title" className="space-y-6">
      <header className="border-b border-line pb-4">
        <h2 id="day-title" className="text-3xl font-bold uppercase leading-tight first-letter:uppercase">
          {dayLabel(date)}
        </h2>
        <p className={`mt-1 text-sm uppercase tracking-[0.15em] ${day && !day.dayOff ? 'text-ice' : 'text-white/50'}`}>
          {dayStatus}
          {isPast && ' · минал ден'}
        </p>
      </header>

      <FormError message={error} />
      {notice && !error && (
        <p role="status" className="border border-ice/60 bg-ice/10 px-4 py-3 text-sm text-ice">
          {notice}
        </p>
      )}

      {/* Промени по графика за деня */}
      {canEditSchedule && (
        <div className="space-y-3">
          {day && !day.dayOff ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowHours((v) => !v)}
                className={`${secondaryButton} flex-1`}
                aria-expanded={showHours}
              >
                Работно време
              </button>
              <button type="button" onClick={makeDayOff} disabled={busy} className={`${secondaryButton} flex-1`}>
                Почивен ден
              </button>
            </div>
          ) : (
            <p className="text-sm text-white/60">
              {day?.dayOff ? 'Денят е почивен.' : 'Денят още не е в графика.'} Задай работно време, за да се отвори за
              записване.
            </p>
          )}
          {(showHours || !day || day.dayOff) && <HoursForm day={day} busy={busy} onSave={saveHours} />}
        </div>
      )}

      {/* Часовете за деня */}
      {times.length > 0 && (
        <div>
          <h3 className={`${sectionTitle} mb-3`}>Часове</h3>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {times.map((time) => {
              const appointment = bookedByTime.get(time)
              const started = isPast || (date === today && time <= now)

              if (appointment) {
                return (
                  <li key={time} className="border border-ice bg-ice/10 px-2 py-2">
                    <span className="block text-lg font-bold leading-none text-ice">{time}</span>
                    <span className="mt-1 block truncate text-xs text-white/80">{appointment.clientName}</span>
                  </li>
                )
              }

              return (
                <li key={time} className={`relative flex border border-line ${started ? 'opacity-40' : 'bg-coal'}`}>
                  <button
                    type="button"
                    onClick={() => pickTime(time)}
                    disabled={!canBook || started}
                    className="flex-1 px-2 py-2 text-left transition-colors enabled:hover:bg-white/5"
                    aria-label={`${time} — свободен. Добави клиент`}
                  >
                    <span className="block text-lg font-bold leading-none">{time}</span>
                    <span className="mt-1 block text-xs text-white/50">{started ? 'мина' : 'свободен'}</span>
                  </button>
                  {canEditSchedule && !started && (
                    <button
                      type="button"
                      onClick={() => closeSlot(time)}
                      disabled={busy}
                      className="absolute right-0 top-0 grid size-7 place-items-center text-white/50 transition-colors hover:text-red-300"
                      aria-label={`Затвори часа ${time}`}
                    >
                      ×
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
          {canBook && <p className="mt-2 text-xs text-white/50">Натисни свободен час, за да впишеш клиент. „×“ го затваря.</p>}
        </div>
      )}

      {canEditSchedule && day && !day.dayOff && (
        <form onSubmit={openSlot} className="flex items-end gap-3">
          <div className="flex-1">
            <label htmlFor="open-time" className={labelClass}>
              Отвори допълнителен час
            </label>
            <input
              id="open-time"
              type="time"
              step="300"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={busy || !openTime} className={secondaryButton}>
            Отвори
          </button>
        </form>
      )}

      {/* Записаните клиенти */}
      <div>
        <h3 className={`${sectionTitle} mb-3`}>Записани ({booked.length})</h3>
        {appointments.length === 0 ? (
          <p className="border border-dashed border-line px-4 py-6 text-center text-sm text-white/50">
            Няма записани клиенти за този ден.
          </p>
        ) : (
          <ul className="divide-y divide-line border border-line">
            {appointments.map((appointment) => {
              const active = appointment.status === 'booked'
              return (
                <li key={appointment._id} className={`flex items-start gap-4 px-4 py-3 ${active ? '' : 'opacity-50'}`}>
                  <span className={`text-2xl font-bold leading-none ${active ? 'text-ice' : 'line-through'}`}>
                    {appointment.time}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-bold uppercase ${active ? '' : 'line-through'}`}>
                      {appointment.clientName}
                    </p>
                    <p className="text-sm text-white/60">
                      {appointment.service ? `${appointment.service.name} · ${appointment.service.price} €` : 'без услуга'}
                      {!appointment.client && ' · вписан ръчно'}
                    </p>
                    {appointment.clientPhone && (
                      <a
                        href={`tel:${appointment.clientPhone.replace(/[^\d+]/g, '')}`}
                        className="text-sm text-white/80 underline underline-offset-4 hover:text-ice"
                      >
                        {appointment.clientPhone}
                      </a>
                    )}
                    {!active && (
                      <p className="text-xs uppercase tracking-[0.15em] text-white/60">{STATUS_LABELS[appointment.status]}</p>
                    )}
                  </div>
                  {active && !isPast && (
                    <button
                      type="button"
                      onClick={() => cancelAppointment(appointment)}
                      disabled={busy}
                      className={dangerButton}
                    >
                      Отмени
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {canBook && (
        <ManualBookingForm
          key={pickedTime}
          date={date}
          initialTime={pickedTime}
          services={services}
          barberId={barberId}
          onCreated={onChanged}
        />
      )}
    </section>
  )
}

export default DayPanel
