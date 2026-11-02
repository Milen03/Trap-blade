import { useState } from 'react'
import { createManual } from '../../services/appointmentService.js'
import FormError from '../Auth/FormError.jsx'
import { inputClass, labelClass, primaryButton } from './ui.js'

// Бръснарят сам вписва клиент — например обадил се по телефона или дошъл без час.
// Часът може да е всеки (не е задължително да е от графика). Записът е готов веднага.
// barberId се подава само когато собственикът вписва клиент при друг бръснар.
function ManualBookingForm({ date, initialTime, services, barberId, onCreated }) {
  const [values, setValues] = useState({ time: initialTime || '', clientName: '', clientPhone: '', serviceId: '' })
  const [error, setError] = useState('')
  // Потвърждение под бутона — на телефон формата е далеч от горната част на деня.
  const [done, setDone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setDone('')
    setIsSubmitting(true)
    try {
      await createManual({
        date,
        time: values.time,
        clientName: values.clientName,
        clientPhone: values.clientPhone,
        serviceId: values.serviceId || undefined,
        barberId,
      })
      setValues({ time: '', clientName: '', clientPhone: '', serviceId: '' })
      const message = `${values.clientName} е записан(а) в ${values.time}.`
      setDone(message)
      onCreated(message)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form id="manual-booking" onSubmit={handleSubmit} className="space-y-4 border border-line bg-coal p-4 sm:p-5">
      <h3 className="text-lg font-bold uppercase">Добави клиент</h3>

      <div className="grid grid-cols-[7rem_1fr] gap-3">
        <div>
          <label htmlFor="mb-time" className={labelClass}>
            Час
          </label>
          <input
            id="mb-time"
            name="time"
            type="time"
            step="300"
            value={values.time}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="mb-name" className={labelClass}>
            Име
          </label>
          <input
            id="mb-name"
            name="clientName"
            value={values.clientName}
            onChange={handleChange}
            placeholder="Иван Иванов"
            maxLength={100}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="mb-phone" className={labelClass}>
            Телефон <span className="normal-case tracking-normal text-white/40">(по желание)</span>
          </label>
          <input
            id="mb-phone"
            name="clientPhone"
            type="tel"
            value={values.clientPhone}
            onChange={handleChange}
            placeholder="0888 123 456"
            autoComplete="off"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="mb-service" className={labelClass}>
            Услуга
          </label>
          <select id="mb-service" name="serviceId" value={values.serviceId} onChange={handleChange} className={inputClass}>
            <option value="">— без услуга —</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} · {service.price} €
              </option>
            ))}
          </select>
        </div>
      </div>

      <FormError message={error} />

      <button type="submit" disabled={isSubmitting} className={`${primaryButton} w-full`}>
        {isSubmitting ? 'Записвам…' : 'Запиши клиента'}
      </button>
      {done && (
        <p role="status" className="text-sm text-ice">
          ✓ {done}
        </p>
      )}
    </form>
  )
}

export default ManualBookingForm
