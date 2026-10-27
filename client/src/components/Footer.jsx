import { STUDIO } from '../data/studio.js'

function FooterHeading({ children }) {
  return <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-ice">{children}</h3>
}

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="contact" className="scroll-mt-16 border-t border-line bg-coal">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <a href="#home" className="font-brand text-4xl">
            TrapBlade
          </a>
          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/50">Barber Studio</p>
        </div>

        <div>
          <FooterHeading>Адрес</FooterHeading>
          <a href={STUDIO.mapUrl} target="_blank" rel="noreferrer" className="font-semibold hover:text-ice">
            {STUDIO.address}
            <br />
            {STUDIO.city}
          </a>
        </div>

        <div>
          <FooterHeading>Телефон</FooterHeading>
          <a href={STUDIO.phoneHref} className="block font-semibold hover:text-ice">
            {STUDIO.phone}
          </a>
          <a
            href={STUDIO.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs uppercase tracking-[0.15em] text-white/60 underline underline-offset-4 hover:text-ice"
          >
            Instagram
          </a>
        </div>

        <div>
          <FooterHeading>Работно време</FooterHeading>
          <ul className="space-y-0.5 font-semibold">
            {STUDIO.hours.map((row) => (
              <li key={row.days}>
                {row.days} {row.time === 'почивен' ? `— ${row.time}` : row.time}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-6xl border-t border-line px-4 py-5 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">© {year} TrapBlade Studio</p>
      </div>
    </footer>
  )
}

export default Footer
