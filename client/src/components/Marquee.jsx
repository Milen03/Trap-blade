import { SERVICES } from '../data/studio.js'

const WORDS = [...SERVICES.map((s) => s.name), 'TrapBlade']

// Caution-tape strip; the word list is rendered twice so the -50% loop is seamless.
function Marquee() {
  return (
    <div className="relative z-10 -my-6 -rotate-2 overflow-hidden border-y-4 border-ink bg-ice py-3 shadow-[0_10px_40px_rgb(41_182_246/0.25)]">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {[...WORDS, ...WORDS].map((word, i) => (
              <li key={i} className="flex items-center gap-6 px-6 font-display text-xl uppercase text-ink sm:text-2xl">
                {word}
                <span className="text-base">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

export default Marquee
