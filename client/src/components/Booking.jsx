import { BOOKING_STEPS, STUDIO } from '../data/studio.js'

function Booking() {
  return (
    <section id="booking" className="scroll-mt-16 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 border border-ice p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-6xl font-bold uppercase leading-[0.95] sm:text-7xl">
              Запази
              <br />
              си стола
            </h2>
            <p className="mt-4 text-white/60">Бързо и лесно — няколко клика и часът е твой.</p>
            {/* Until online booking exists, the call-to-action rings the studio. */}
            <a
              href={STUDIO.phoneHref}
              className="mt-6 inline-block bg-ice px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-white"
            >
              Започни записване
            </a>
          </div>

          <ol>
            {BOOKING_STEPS.map((step, i) => (
              <li key={step.title} className="flex items-center gap-5 border-b border-line py-4 last:border-b-0">
                <span className="text-4xl font-bold text-ice">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="text-lg font-bold uppercase">{step.title}</h3>
                  <p className="text-xs text-white/60">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export default Booking
