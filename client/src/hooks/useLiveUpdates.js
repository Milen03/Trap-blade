import { useEffect, useRef } from 'react'
import { listUpdates } from '../services/appointmentService.js'

// Колко често панелът пита сървъра за нови или отменени часове.
export const LIVE_UPDATES_INTERVAL_MS = 15000

// Пита сървъра на всеки 15 секунди дали има нови или отменени часове и вика onUpdates(списък).
// - Пита само докато табът е видим; като се върнеш в таба — пита веднага.
// - Сървърът връща малко застъпване във времето, затова тук махаме повторенията (по _id + updatedAt).
// - При грешка (например няма интернет) просто опитва пак след 15 секунди.
// Защо не WebSocket: заявките минават през Vercel към Railway, а там постоянните връзки не са надеждни.
export function useLiveUpdates(onUpdates, { enabled = true, intervalMs = LIVE_UPDATES_INTERVAL_MS } = {}) {
  // Винаги последната версия на onUpdates, без да рестартираме таймера при всяко рендериране.
  const onUpdatesRef = useRef(onUpdates)
  useEffect(() => {
    onUpdatesRef.current = onUpdates
  })

  useEffect(() => {
    if (!enabled) return undefined

    let since = null
    let stopped = false
    let inFlight = false
    const seen = new Set()

    async function check() {
      if (stopped || inFlight || document.visibilityState !== 'visible') return
      inFlight = true
      try {
        const { serverTime, appointments } = await listUpdates(since)
        if (stopped) return
        since = serverTime
        const fresh = appointments.filter((a) => {
          const key = `${a._id}:${a.updatedAt}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        if (seen.size > 500) seen.clear()
        if (fresh.length) onUpdatesRef.current(fresh)
      } catch {
        // Тихо — следващата проверка ще опита пак.
      } finally {
        inFlight = false
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }

    check()
    const timer = setInterval(check, intervalMs)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)

    return () => {
      stopped = true
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [enabled, intervalMs])
}
