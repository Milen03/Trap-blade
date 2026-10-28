import logo from '../assets/trapblade-logo.webp'
import { STUDIO } from '../data/studio.js'

function Hero() {
  return (
    <section id="home" className="pt-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-ice">
            <span className="h-px w-8 bg-ice" />
            Barber Studio · {STUDIO.city}
          </p>

          <h1 className="mt-4 font-brand text-7xl leading-[0.95] sm:text-8xl lg:text-[8.5rem]">TrapBlade</h1>



          <p className="mt-6 max-w-md text-white/60">
            Fade, crop, buzz cut. Избери бръснар, ден и час — записваш се за под минута.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#booking"
              className="flex items-center gap-3 bg-ice px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] text-ink transition-colors hover:bg-white"
            >
              Запази час <span aria-hidden="true">→</span>
            </a>
            <a
              href="#services"
              className="border border-white/80 px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] transition-colors hover:border-ice hover:text-ice"
            >
              Виж услугите
            </a>
          </div>
        </div>

        <div className="relative order-first mx-auto w-64 sm:w-72 lg:order-none lg:w-full lg:max-w-[340px]">
          <div className="rounded-full border border-line p-3">
            <img src={logo} alt="TrapBlade лого" className="w-full rounded-full" />
          </div>
          <span className="absolute -right-2 bottom-6 -rotate-6 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-ink sm:-right-6">
            Est. В. Търново
          </span>
        </div>
      </div>
    </section>
  )
}

export default Hero
