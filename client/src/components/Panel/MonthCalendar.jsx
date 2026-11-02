import { calendarGrid, WEEKDAYS_SHORT } from '../../utils/dates.js'
import { freeTimes } from './ui.js'

// Диагонални линии за почивните дни.
const DAY_OFF_STRIPES = {
  backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 6px, rgba(255,255,255,0.05) 6px 7px)',
}

// Месечен календар (Пн–Нд). За всеки ден показва колко клиента има и колко свободни часа остават.
// daysByDate: { "2026-11-05": workDay }, bookedByDate: { "2026-11-05": ["10:00", ...] }
function MonthCalendar({ month, daysByDate, bookedByDate, selectedDate, today, now, onSelect }) {
  const weeks = calendarGrid(month)

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 pb-2" aria-hidden="true">
        {WEEKDAYS_SHORT.map((name) => (
          <span key={name} className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
            {name}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date, i) => {
          if (!date) return <span key={`empty-${i}`} />

          const day = daysByDate[date]
          const booked = bookedByDate[date] || []
          const free = freeTimes(day, booked, today, now).length
          const isPast = date < today
          const isToday = date === today
          const isSelected = date === selectedDate

          let status = '—'
          let label = 'няма график'
          if (day?.dayOff) {
            status = 'почивен'
            label = 'почивен ден'
          } else if (day) {
            status = isPast ? '' : `${free} св.`
            label = `${booked.length} записани, ${free} свободни`
          }

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              aria-pressed={isSelected}
              aria-label={`${Number(date.slice(8))}-ти: ${label}`}
              style={day?.dayOff && !isSelected ? DAY_OFF_STRIPES : undefined}
              className={`relative flex min-h-16 flex-col justify-between border p-1.5 text-left transition-colors sm:min-h-20 sm:p-2 ${
                isSelected
                  ? 'border-ice bg-ice text-ink'
                  : `${isToday ? 'border-ice' : 'border-line'} ${day && !day.dayOff ? 'bg-coal' : 'bg-ink'} hover:border-white/40`
              } ${isPast && !isSelected ? 'opacity-45' : ''}`}
            >
              <span className="text-lg font-bold leading-none sm:text-xl">{Number(date.slice(8))}</span>

              {booked.length > 0 && (
                <span
                  className={`absolute right-1 top-1 grid min-w-5 place-items-center rounded-full px-1 text-xs font-bold leading-5 ${
                    isSelected ? 'bg-ink text-ice' : 'bg-ice text-ink'
                  }`}
                >
                  {booked.length}
                </span>
              )}

              <span
                className={`truncate text-[10px] uppercase tracking-wide sm:text-xs ${
                  isSelected ? 'text-ink/80' : day && !day.dayOff ? 'text-white/60' : 'text-white/35'
                }`}
              >
                {status}
              </span>
            </button>
          )
        })}
      </div>

      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/50">
        <span className="flex items-center gap-2">
          <span className="grid size-4 place-items-center rounded-full bg-ice text-[10px] font-bold text-ink">2</span>
          записани клиенти
        </span>
        <span>„св.“ — свободни часове</span>
      </p>
    </div>
  )
}

export default MonthCalendar
