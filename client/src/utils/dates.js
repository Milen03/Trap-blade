// Дати за графика. Сървърът пази датите като текст "YYYY-MM-DD" (денят в София),
// затова и тук работим с текст, а не с часови зони.

const ZONE = 'Europe/Sofia'

const pad = (n) => String(n).padStart(2, '0')

// Днешната дата в София: "2026-11-05".
export function todayInSofia() {
  // en-CA дава точно формат YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONE }).format(new Date())
}

// Сегашният час в София: "14:05".
export function nowTimeInSofia() {
  return new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(
    new Date(),
  )
}

// "2026-11-05" -> "2026-11"
export function monthOf(date) {
  return date.slice(0, 7)
}

// Дата по обед UTC — така денят не се мести, в която и часова зона да е браузърът.
function toUtcNoon(date) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12))
}

// addMonths("2026-11", 1) -> "2026-12"
export function addMonths(month, n) {
  const [y, m] = month.split('-').map(Number)
  const total = y * 12 + (m - 1) + n
  return `${Math.floor(total / 12)}-${pad((total % 12) + 1)}`
}

// "2026-11" -> "Ноември 2026"
export function monthLabel(month) {
  const text = new Intl.DateTimeFormat('bg', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    toUtcNoon(`${month}-01`),
  )
  // "ноември 2026 г." -> "Ноември 2026"
  const clean = text.replace(/\s*г\.$/, '')
  return clean.charAt(0).toUpperCase() + clean.slice(1)
}

// "2026-11-05" -> "четвъртък, 5 ноември"
export function dayLabel(date) {
  return new Intl.DateTimeFormat('bg', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    toUtcNoon(date),
  )
}

// Решетката на календара: седмици от понеделник до неделя.
// Празните места преди 1-во число и след последното са null.
export function calendarGrid(month) {
  const [y, m] = month.split('-').map(Number)
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  // getUTCDay: 0 = неделя. Превръщаме го в 0 = понеделник.
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7

  const cells = Array.from({ length: offset }, () => null)
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(`${month}-${pad(d)}`)
  }
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

// Колко часа остават до даден час от даден ден (в София). Отрицателно, ако е минал.
export function hoursUntil(date, time) {
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  const [ny, nmo, nd] = todayInSofia().split('-').map(Number)
  const [nh, nmi] = nowTimeInSofia().split(':').map(Number)
  // Сравняваме "стенни" часове в София, затова и двете страни са в UTC без отместване.
  const target = Date.UTC(y, mo - 1, d, h, mi)
  const now = Date.UTC(ny, nmo - 1, nd, nh, nmi)
  return (target - now) / 3600000
}

// "четвъртък, 5 ноември" -> "Четвъртък, 5 ноември"
export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
