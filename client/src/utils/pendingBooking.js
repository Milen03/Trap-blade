// Изборът на гост, който трябва да влезе, преди да потвърди часа.
// Пазим го в sessionStorage (само за този таб), за да отворим диалога наново след входа.
// Достъпът до storage може да гръмне (частен прозорец, блокирани данни) — тогава просто няма запис.
const KEY = 'pendingBooking'

export function savePendingBooking(booking) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(booking))
  } catch {
    // Няма storage — след входа клиентът ще избере часа отново.
  }
}

export function readPendingBooking() {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY))
    return value && value.barberId && value.date && value.time ? value : null
  } catch {
    return null
  }
}

export function clearPendingBooking() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // Нищо за триене.
  }
}
