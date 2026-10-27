import { MARQUEE_WORDS } from '../data/studio.js'

// Each track is rendered twice so the -50% loop is seamless.
function Track({ items, className, itemClassName, separatorClassName }) {
  return (
    <div className={`flex w-max ${className}`}>
      {[0, 1].map((copy) => (
        <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
          {items.map((word, i) => (
            <li key={i} className={`flex items-center uppercase ${itemClassName}`}>
              {word}
              <span className={separatorClassName}>×</span>
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}

function Marquee() {
  const tape = Array.from({ length: 6 }, (_, i) => (i % 2 ? 'Запази стол' : 'TrapBlade Studio'))
  const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS]

  return (
    <div aria-hidden="true" className="overflow-hidden pt-4">
      <div className="relative z-10 -mx-4 -rotate-2 overflow-hidden bg-ice py-2">
        <Track
          items={tape}
          className="animate-marquee"
          itemClassName="gap-4 px-2 text-sm font-bold tracking-[0.25em] text-ink"
          separatorClassName="text-base"
        />
      </div>

      <div className="mt-6 overflow-hidden border-y border-line py-5">
        <Track
          items={words}
          className="animate-marquee-slow"
          itemClassName="gap-10 px-5 text-3xl font-bold tracking-[0.08em] sm:text-4xl"
          separatorClassName="font-normal text-ice"
        />
      </div>
    </div>
  )
}

export default Marquee
