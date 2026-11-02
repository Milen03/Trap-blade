import { api } from './api.js'

// Графикът на бръснаря (само за роли barber и owner).
// Всички промени са върху графика на логнатия бръснар — сървърът не приема чужд barberId.

// Дните от графика за месеца. Собственикът може да подаде barberId, за да види чужд график.
export function getMonth(month, barberId) {
  const params = new URLSearchParams({ month })
  if (barberId) params.set('barberId', barberId)
  return api.get(`/schedule?${params}`)
}

// Създава графика за целия месец. Вече съществуващите дни не се пипат.
// data: { month, from, to, step, daysOff } -> { created, existing, message }
export function generateMonth(data) {
  return api.post('/schedule/generate', data)
}

// Променя един ден: { dayOff } или { from, to, step } или { slots } или { note }.
export function updateDay(date, data) {
  return api.put(`/schedule/${date}`, data)
}

// Отваря (open: true) или затваря (open: false) един час.
export function toggleSlot(date, time, open) {
  return api.patch(`/schedule/${date}/slots`, { time, open })
}
