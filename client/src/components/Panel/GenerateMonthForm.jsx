import { useState } from 'react'
import { generateMonth } from '../../services/scheduleService.js'
import { monthLabel } from '../../utils/dates.js'
import FormError from '../Auth/FormError.jsx'
import { inputClass, labelClass, primaryButton, secondaryButton, STEP_OPTIONS } from './ui.js'

// Дните от седмицата в реда Пн–Нд, със стойностите, които иска сървърът (0 = неделя).
const WEEKDAYS = [
  { value: 1, label: 'Пн' },
  { value: 2, label: 'Вт' },
  { value: 3, label: 'Ср' },
  { value: 4, label: 'Чт' },
  { value: 5, label: 'Пт' },
  { value: 6, label: 'Сб' },
  { value: 0, label: 'Нд' },
]

// Създава графика за целия месец наведнъж. Дни, които вече са в графика, не се пипат —
// така може да се пусне пак, за да се допълнят само липсващите дни.
function GenerateMonthForm({ month, defaultOpen, onGenerated }) {
  const [open, setOpen] = useState(defaultOpen)
  const [values, setValues] = useState({ from: '10:00', to: '21:00', step: 30, daysOff: [0] })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${secondaryButton} w-full`}>
        Генерирай / допълни месеца
      </button>
    )
  }

  const toggleDayOff = (value) =>
    setValues((current) => ({
      ...current,
      daysOff: current.daysOff.includes(value)
        ? current.daysOff.filter((d) => d !== value)
        : [...current.daysOff, value],
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const result = await generateMonth({ month, ...values })
      setOpen(false)
      onGenerated(result.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border border-ice/60 bg-coal p-4 sm:p-5">
      <div>
        <h3 className="text-xl font-bold uppercase">Графикът за {monthLabel(month)}</h3>
        <p className="mt-1 text-sm text-white/60">
          Създава работните дни за целия месец. Дни, които вече имаш в графика, остават както са.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="gen-from" className={labelClass}>
            От
          </label>
          <input
            id="gen-from"
            type="time"
            step="300"
            value={values.from}
            onChange={(e) => setValues((v) => ({ ...v, from: e.target.value }))}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="gen-to" className={labelClass}>
            До
          </label>
          <input
            id="gen-to"
            type="time"
            step="300"
            value={values.to}
            onChange={(e) => setValues((v) => ({ ...v, to: e.target.value }))}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="gen-step" className={labelClass}>
            През
          </label>
          <select
            id="gen-step"
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
      </div>

      <fieldset>
        <legend className={labelClass}>Почивни дни</legend>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => {
            const checked = values.daysOff.includes(day.value)
            return (
              <label
                key={day.value}
                className={`flex h-11 cursor-pointer items-center justify-center border text-sm font-bold uppercase transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ice ${
                  checked ? 'border-ice bg-ice/15 text-ice' : 'border-line text-white/70 hover:border-white/40'
                }`}
              >
                <input type="checkbox" checked={checked} onChange={() => toggleDayOff(day.value)} className="sr-only" />
                {day.label}
              </label>
            )
          })}
        </div>
      </fieldset>

      <FormError message={error} />

      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting} className={`${primaryButton} flex-1`}>
          {isSubmitting ? 'Създавам…' : 'Генерирай'}
        </button>
        {!defaultOpen && (
          <button type="button" onClick={() => setOpen(false)} className={secondaryButton}>
            Откажи
          </button>
        )}
      </div>
    </form>
  )
}

export default GenerateMonthForm
