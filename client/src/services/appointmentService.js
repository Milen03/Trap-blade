import { api } from './api.js'

// Записаните часове.

// За бръснаря: часовете за деня ({ date }) или месеца ({ month }).
// Собственикът може да подаде barberId, за да види часовете на друг бръснар.
export function listForBarber({ date, month, barberId }) {
  const params = new URLSearchParams()
  if (date) params.set('date', date)
  if (month) params.set('month', month)
  if (barberId) params.set('barberId', barberId)
  return api.get(`/appointments?${params}`)
}

// Бръснарят сам вписва клиент: { date, time, clientName, clientPhone?, serviceId?, barberId? }.
export function createManual(data) {
  return api.post('/appointments/manual', data)
}

// Отменя час (клиентът — свой; бръснарят — свой; собственикът — всеки).
export function cancel(id) {
  return api.patch(`/appointments/${id}/cancel`)
}
