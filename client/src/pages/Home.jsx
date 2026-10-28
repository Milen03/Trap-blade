import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import Marquee from '../components/Marquee.jsx'
import Services from '../components/Services.jsx'
import Team from '../components/Team.jsx'
import Booking from '../components/Booking.jsx'
import Footer from '../components/Footer.jsx'

function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Booking />
        <Services />
        <Team />
      </main>
      <Footer />
    </>
  )
}

export default Home
