import { api } from './api.js'

// Свободните часове при бръснар — публично, вижда се и без вход.

// Дните от месеца с поне един свободен час: [{ date: "2026-11-05", free: 12 }, ...]
export function getFreeDays(barberId, month) {
  return api.get(`/availability?${new URLSearchParams({ barberId, month })}`)
}

// Свободните часове за един ден: { date, slots: ["10:00", "10:30", ...] }
export function getFreeSlots(barberId, date) {
  return api.get(`/availability?${new URLSearchParams({ barberId, date })}`)
}
