import Logo from './Logo.jsx'
import { NAV_LINKS, SERVICES, STUDIO } from '../data/studio.js'

function FooterHeading({ children }) {
  return <h3 className="mb-5 font-display text-xs tracking-widest text-ice">{children}</h3>
}

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="contact" className="relative border-t-4 border-ice bg-coal">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <a href="#home" className="flex items-center gap-3">
            <Logo className="h-16 w-16" />
            <span className="font-brand text-4xl">TrapBlade</span>
          </a>
          <p className="mt-5 font-display text-sm">TRAPBLADE STUDIO</p>
          <p className="mt-2 text-white/50">Бръснарница в сърцето на {STUDIO.city}.</p>
        </div>

        <div>
          <FooterHeading>Намери ни</FooterHeading>
          <ul className="space-y-3 text-white/70">
            <li>
              <a href={STUDIO.mapUrl} target="_blank" rel="noreferrer" className="hover:text-ice">
                📍 {STUDIO.address}, {STUDIO.city}
              </a>
            </li>
            <li>
              <a href={STUDIO.phoneHref} className="hover:text-ice">
                📞 {STUDIO.phone}
              </a>
            </li>
            <li>
              <a href={STUDIO.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-ice">
                📸 @{STUDIO.instagram}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <FooterHeading>Услуги</FooterHeading>
          <ul className="space-y-3 font-display text-sm text-white/70">
            {SERVICES.map((service) => (
              <li key={service.id}>
                <a href="#services" className="uppercase hover:text-ice">
                  {service.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <FooterHeading>Навигация</FooterHeading>
          <ul className="space-y-3 text-white/70">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="hover:text-ice">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={STUDIO.phoneHref}
            className="mt-6 inline-block -skew-x-12 bg-ice px-5 py-3 font-display text-xs text-ink transition-colors hover:bg-white"
          >
            <span className="inline-block skew-x-12">Book now</span>
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-white/40 sm:flex-row sm:px-6">
          <p>© {year} {STUDIO.name}. Всички права запазени.</p>
          <p className="font-brand text-lg text-white/60">Stay Sharp</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
