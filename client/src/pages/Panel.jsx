import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { getMonth } from '../services/scheduleService.js'
import { listForBarber } from '../services/appointmentService.js'
import { getBarbers } from '../services/barberService.js'
import { addMonths, monthLabel, monthOf, nowTimeInSofia, todayInSofia } from '../utils/dates.js'
import FormError from '../components/Auth/FormError.jsx'
import MonthCalendar from '../components/Panel/MonthCalendar.jsx'
import GenerateMonthForm from '../components/Panel/GenerateMonthForm.jsx'
import DayPanel from '../components/Panel/DayPanel.jsx'
import LiveNotices from '../components/Panel/LiveNotices.jsx'
import { useLiveUpdates } from '../hooks/useLiveUpdates.js'

// Най-много толкова известия едновременно (най-новите отгоре) — повече покриват екрана на телефон.
const MAX_LIVE_NOTICES = 3

// Панел за бръснарите и собственика: графикът за месеца, часовете за деня и записаните клиенти.
// Записването е без одобрение — клиентите, които се виждат тук, вече са записани.
function Panel() {
  const { user, logout } = useAuth()
  const isOwner = user.role === 'owner'
  const today = todayInSofia()
  const now = nowTimeInSofia()

  const [month, setMonth] = useState(monthOf(today))
  const [selectedDate, setSelectedDate] = useState(today)
  // Чий график гледаме. Бръснарят — винаги своя; собственикът може да превключва.
  const [barberId, setBarberId] = useState(user._id)
  const [barbers, setBarbers] = useState([])
  // Увеличава се след всяка промяна -> месецът се зарежда наново.
  const [version, setVersion] = useState(0)
  // Заредените данни + за кой месец/бръснар/версия са (за да знаем дали още зареждаме).
  const [data, setData] = useState({ key: '', days: [], appointments: [], error: '' })
  const [notice, setNotice] = useState('')
  // Тихо опресняване (нов или отменен час от клиент): презарежда месеца, без да сменя loadKey —
  // календарът не потъмнява, а отворената форма и избраният ден остават.
  const [refresh, setRefresh] = useState(0)
  // Известия за нови и отменени часове, дошли без презареждане.
  const [liveNotices, setLiveNotices] = useState([])

  const loadKey = `${month}|${barberId}|${version}`
  const isLoading = data.key !== loadKey
  const isOwnSchedule = barberId === user._id

  // Бръснарите с услугите им (за табовете на собственика и формата "Добави клиент").
  useEffect(() => {
    getBarbers()
      .then(setBarbers)
      .catch(() => setBarbers([]))
  }, [])

  // Графикът и записаните часове за целия месец — с две заявки едновременно.
  // Пуска се наново при смяна на месец/бръснар/версия и при тихо опресняване (refresh).
  // Ако междувременно тръгне нова заявка, отговорът на старата се игнорира (ignore).
  useEffect(() => {
    let ignore = false
    Promise.all([getMonth(month, barberId), listForBarber({ month, barberId })])
      .then(([days, appointments]) => {
        if (!ignore) setData({ key: loadKey, days, appointments, error: '' })
      })
      .catch((err) => {
        if (!ignore) setData({ key: loadKey, days: [], appointments: [], error: err.message })
      })
    return () => {
      ignore = true
    }
  }, [month, barberId, loadKey, refresh])

  // Нови и отменени часове без презареждане: проверка на всеки 15 секунди (виж useLiveUpdates).
  useLiveUpdates((appointments) => {
    const barberOf = (a) => String(a.barber?._id ?? a.barber)
    if (appointments.some((a) => barberOf(a) === String(barberId))) {
      setRefresh((r) => r + 1)
    }

    // Известия само за промени, които не е направил самият бръснар (своите ги вижда веднага).
    const fresh = appointments
      .map((a) => {
        if (a.status === 'booked' && String(a.createdBy) !== String(user._id)) return { type: 'new', appointment: a }
        if (a.status === 'cancelled' && String(a.cancelledBy) !== String(user._id)) {
          return { type: 'cancelled', appointment: a }
        }
        return null
      })
      .filter(Boolean)
      .map((n) => ({ ...n, id: `${n.appointment._id}:${n.appointment.updatedAt}` }))
      .reverse()
    if (fresh.length) {
      // За един и същ час пазим само последното известие (например "Нов час" -> "Отменен час").
      const changedIds = new Set(fresh.map((n) => n.appointment._id))
      setLiveNotices((prev) =>
        [...fresh, ...prev.filter((n) => !changedIds.has(n.appointment._id))].slice(0, MAX_LIVE_NOTICES),
      )
    }
  })

  // Докато има известия, заглавието на таба показва броя им: "(2) Панел · TrapBlade".
  useEffect(() => {
    const original = document.title
    if (liveNotices.length) document.title = `(${liveNotices.length}) Панел · TrapBlade`
    return () => {
      document.title = original
    }
  }, [liveNotices.length])

  // По дати: денят от графика, записаните часове (всички статуси) и заетите часове.
  const { daysByDate, appointmentsByDate, bookedByDate } = useMemo(() => {
    const days = {}
    const appts = {}
    const booked = {}
    data.days.forEach((day) => {
      days[day.date] = day
    })
    data.appointments.forEach((a) => {
      ;(appts[a.date] ||= []).push(a)
      if (a.status === 'booked') (booked[a.date] ||= []).push(a.time)
    })
    return { daysByDate: days, appointmentsByDate: appts, bookedByDate: booked }
  }, [data])

  const changeMonth = (delta) => {
    const next = addMonths(month, delta)
    setMonth(next)
    setSelectedDate(next === monthOf(today) ? today : `${next}-01`)
    setNotice('')
  }

  const changeBarber = (id) => {
    setBarberId(id)
    setNotice('')
  }

  const dismissNotice = (id) => setLiveNotices((list) => list.filter((n) => n.id !== id))

  // "Покажи": отваря месеца и деня на часа (а при собственика — и таба на бръснаря).
  const showNotice = (id) => {
    const found = liveNotices.find((n) => n.id === id)
    if (!found) return
    const { appointment: a } = found
    if (isOwner && a.barber?._id) setBarberId(String(a.barber._id))
    setMonth(monthOf(a.date))
    setSelectedDate(a.date)
    dismissNotice(id)
  }

  const reload = (message) => {
    setVersion((v) => v + 1)
    if (message) setNotice(message)
  }

  // Табовете за собственика: той самият първи, после останалите бръснари.
  const tabs = useMemo(() => {
    const others = barbers.filter((b) => b._id !== user._id)
    return [{ _id: user._id, firstName: 'Моят график' }, ...others]
  }, [barbers, user._id])

  const viewedBarber = barbers.find((b) => b._id === barberId)
  const services = viewedBarber?.services || []
  const canGenerate = isOwnSchedule && month >= monthOf(today)
  const hasAnyDay = data.days.length > 0

  return (
    <div className="min-h-svh px-4 pb-16 pt-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4 border-b border-line pb-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition-colors hover:text-ice"
          >
            <span aria-hidden="true">←</span> Начало
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm uppercase tracking-[0.15em] text-white/60 sm:inline">
              {user.firstName} {user.lastName}
            </span>
            <button
              type="button"
              onClick={logout}
              className="border border-white/60 px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-colors hover:border-ice hover:text-ice"
            >
              Изход
            </button>
          </div>
        </header>

        <div className="pt-8">
          <h1 className="font-brand text-6xl leading-none sm:text-7xl">Schedule</h1>
          <p className="mt-2 text-white/60">Графикът ти и записаните клиенти. Записванията са потвърдени веднага.</p>
        </div>

        {/* Собственикът превключва между бръснарите. */}
        {isOwner && tabs.length > 1 && (
          <div role="tablist" aria-label="Бръснар" className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {tabs.map((barber) => {
              const active = barber._id === barberId
              return (
                <button
                  key={barber._id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => changeBarber(barber._id)}
                  className={`shrink-0 border px-4 py-2.5 text-sm font-bold uppercase tracking-[0.15em] transition-colors ${
                    active ? 'border-ice bg-ice text-ink' : 'border-line text-white/70 hover:border-white/40'
                  }`}
                >
                  {barber.firstName}
                </button>
              )
            })}
          </div>
        )}

        {!isOwnSchedule && (
          <p className="mt-4 border border-line bg-coal px-4 py-3 text-sm text-white/70">
            Гледаш графика на {viewedBarber ? `${viewedBarber.firstName} ${viewedBarber.lastName}` : 'друг бръснар'}.
            Можеш да вписваш и отменяш клиенти; графика си го променя той.
          </p>
        )}

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="grid size-11 place-items-center border border-line text-xl transition-colors hover:border-ice hover:text-ice"
                aria-label="Предишен месец"
              >
                ‹
              </button>
              <h2 className="text-2xl font-bold uppercase tracking-[0.1em]" aria-live="polite">
                {monthLabel(month)}
              </h2>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="grid size-11 place-items-center border border-line text-xl transition-colors hover:border-ice hover:text-ice"
                aria-label="Следващ месец"
              >
                ›
              </button>
            </div>

            <FormError message={data.error} />

            <div className={isLoading ? 'pointer-events-none opacity-50 transition-opacity' : 'transition-opacity'}>
              <MonthCalendar
                month={month}
                daysByDate={daysByDate}
                bookedByDate={bookedByDate}
                selectedDate={selectedDate}
                today={today}
                now={now}
                onSelect={setSelectedDate}
              />
            </div>

            {canGenerate && !isLoading && !data.error && (
              <GenerateMonthForm
                key={`${month}-${hasAnyDay}`}
                month={month}
                defaultOpen={!hasAnyDay}
                onGenerated={reload}
              />
            )}
          </div>

          {!isLoading && !data.error && (
            <DayPanel
              key={`${barberId}-${selectedDate}`}
              date={selectedDate}
              day={daysByDate[selectedDate] || null}
              appointments={appointmentsByDate[selectedDate] || []}
              today={today}
              now={now}
              isOwnSchedule={isOwnSchedule}
              services={services}
              barberId={isOwnSchedule ? undefined : barberId}
              notice={notice}
              onNotice={setNotice}
              onChanged={reload}
            />
          )}
        </div>
      </div>

      <LiveNotices
        notices={liveNotices}
        showBarber={isOwner}
        onShow={showNotice}
        onDismiss={dismissNotice}
        onDismissAll={() => setLiveNotices([])}
      />
    </div>
  )
}

export default Panel
