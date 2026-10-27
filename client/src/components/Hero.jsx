import Logo from './Logo.jsx'
import { STUDIO } from '../data/studio.js'

function Hero() {
  return (
    <section id="home" className="relative isolate flex min-h-svh items-center overflow-hidden bg-stripes pt-20">
      {/* Backdrop: cold blue glow + giant outlined monogram */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_40%,rgb(41_182_246/0.22),transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent" />
      <span
        aria-hidden="true"
        className="text-outline absolute -right-10 top-1/2 -z-10 -translate-y-1/2 select-none font-display text-[38vw] leading-none lg:text-[28vw]"
      >
        TB
      </span>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="mb-6 inline-block -skew-x-12 border-l-4 border-ice bg-white/5 px-4 py-2 font-display text-[10px] tracking-[0.3em] text-ice sm:text-xs">
            <span className="inline-block skew-x-12">Бръснар · {STUDIO.city}</span>
          </p>

          <h1 className="font-brand text-chrome text-7xl leading-[0.9] drop-shadow-[0_4px_0_rgb(41_182_246/0.35)] sm:text-8xl lg:text-[9rem]">
            TrapBlade
          </h1>
          <p className="mt-2 font-display text-2xl tracking-[0.5em] text-white sm:text-4xl">STUDIO</p>

          <p className="mt-8 max-w-xl text-lg text-white/70 sm:text-xl">
            Чист фейд. Остра линия. Без компромиси. Тук не просто се подстригваш —
            <span className="text-white"> тук си оправяш репутацията.</span>
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={STUDIO.phoneHref}
              className="-skew-x-12 border-2 border-ice bg-ice px-7 py-4 font-display text-sm text-ink shadow-[6px_6px_0_#fff] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_#fff]"
            >
              <span className="inline-block skew-x-12">Запази час</span>
            </a>
            <a
              href="#services"
              className="-skew-x-12 border-2 border-white px-7 py-4 font-display text-sm text-white transition-colors hover:border-ice hover:text-ice"
            >
              <span className="inline-block skew-x-12">Виж услугите</span>
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-64 sm:w-80 lg:w-full lg:max-w-md">
          <div className="absolute inset-6 rounded-full bg-ice/30 blur-3xl" />
          <Logo className="relative w-full drop-shadow-[0_0_30px_rgb(41_182_246/0.35)]" />
          <p className="font-brand text-glow absolute -bottom-4 left-1/2 -translate-x-1/2 -rotate-6 whitespace-nowrap text-4xl text-ice">
            Stay Sharp
          </p>
        </div>
      </div>
    </section>
  )
}

export default Hero
