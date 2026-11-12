import { capitalize, dayLabel } from '../../utils/dates.js'

// Известия в долния десен ъгъл за нови и отменени часове, дошли без презареждане (виж useLiveUpdates).
// Стоят фиксирани, за да се виждат, където и да е скролнал бръснарят.
// notices: [{ id, type: 'new' | 'cancelled', appointment }]
function LiveNotices({ notices, showBarber, onShow, onDismiss, onDismissAll }) {
  if (notices.length === 0) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-50 space-y-2 sm:left-auto sm:right-6 sm:w-96"
    >
      {notices.map(({ id, type, appointment: a }) => (
        <div
          key={id}
          className={`flex items-start gap-3 border bg-ink px-4 py-3 shadow-lg shadow-black/60 ${
            type === 'new' ? 'border-ice' : 'border-red-400/60'
          }`}
        >
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-bold uppercase tracking-[0.2em] ${type === 'new' ? 'text-ice' : 'text-red-300'}`}>
              {type === 'new' ? 'Нов час' : 'Отменен час'}
            </p>
            <p className="mt-1 truncate font-bold uppercase">{a.clientName}</p>
            <p className="text-sm text-white/70">
              {capitalize(dayLabel(a.date))} в {a.time}
              {a.service ? ` · ${a.service.name}` : ''}
              {showBarber && a.barber ? ` · при ${a.barber.firstName}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onShow(id)}
              className="border border-white/30 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.15em] transition-colors hover:border-ice hover:text-ice"
            >
              Покажи
            </button>
            <button
              type="button"
              onClick={() => onDismiss(id)}
              className="grid size-8 place-items-center text-lg text-white/60 transition-colors hover:text-white"
              aria-label="Затвори известието"
            >
              ×
            </button>
          </div>
        </div>
      ))}
      {notices.length > 1 && (
        <button
          type="button"
          onClick={onDismissAll}
          className="w-full border border-line bg-ink py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white"
        >
          Затвори всички
        </button>
      )}
    </div>
  )
}

export default LiveNotices
