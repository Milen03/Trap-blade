// Общи класове за формите и бутоните в панела (същият стил като AuthField.jsx).
export const inputClass =
  'h-12 w-full border border-line bg-[#121212] px-3 text-white placeholder:text-white/40 transition-colors focus:border-ice focus:outline-none disabled:opacity-50 [color-scheme:dark]'

export const labelClass = 'mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/70'

export const primaryButton =
  'h-12 bg-ice px-5 text-sm font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-white disabled:opacity-50'

export const secondaryButton =
  'h-12 border border-white/30 px-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition-colors hover:border-ice hover:text-ice disabled:opacity-50'

export const dangerButton =
  'border border-red-400/50 px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-red-300 transition-colors hover:border-red-300 hover:bg-red-500/10 disabled:opacity-50'

export const sectionTitle = 'text-xs font-semibold uppercase tracking-[0.3em] text-white/60'

// Стъпки между часовете (в минути), от които бръснарят избира.
export const STEP_OPTIONS = [15, 20, 30, 45, 60]

// Колко свободни часа има в деня: часовете от графика без заетите и (днес) без вече започналите.
// Същата логика като server/utils/availability.js.
export function freeTimes(day, bookedTimes, today, now) {
  if (!day || day.dayOff || day.date < today) return []
  const booked = new Set(bookedTimes)
  return day.slots.filter((time) => !booked.has(time) && (day.date > today || time > now))
}
