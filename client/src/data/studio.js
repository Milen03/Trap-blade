export const STUDIO = {
  name: 'TrapBlade Studio',
  instagram: 'trappblade_studio',
  instagramUrl: 'https://www.instagram.com/trappblade_studio/',
  phone: '0896 754 554',
  phoneHref: 'tel:+359896754554',
  address: 'ул. Ниш 1Б',
  city: 'Велико Търново',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=%D1%83%D0%BB.+%D0%9D%D0%B8%D1%88+1%D0%91%2C+%D0%92%D0%B5%D0%BB%D0%B8%D0%BA%D0%BE+%D0%A2%D1%8A%D1%80%D0%BD%D0%BE%D0%B2%D0%BE',
  hours: [
    { days: 'Пон – Пет', time: '10:00 - 19:30' },
    { days: 'Събота', time: '10:00 - 19:30' },
    { days: 'Неделя', time: 'почивен' },
  ],
}

export const NAV_LINKS = [
  { label: 'Екипът', href: '#team' },
  { label: 'Контакт', href: '#contact' },
]

export const MARQUEE_WORDS = ['Crop', 'Design', 'Beard', 'Buzz Cut', 'Fade']

// Prices are in euro and differ per barber.
const SERVICE_NAMES = {
  hair: 'Коса',
  'hair-beard': 'Коса + брада',
  beard: 'Брада',
  kids: 'Детско',
}

const priceList = (prices) =>
  Object.entries(prices).map(([id, price]) => ({ id, name: SERVICE_NAMES[id], price }))

export const TEAM = [
  {
    id: 'TB-001',
    role: 'Главен бръснар',
    name: 'Боян Попов',
    lead: true,
    services: priceList({ hair: 15, 'hair-beard': 20, beard: 12, kids: 12 }),
  },
  {
    id: 'TB-002',
    role: 'Бръснар',
    name: 'Иван Мешеков',
    services: priceList({ hair: 10, 'hair-beard': 14, beard: 7, kids: 8 }),
  },
  {
    id: 'TB-003',
    role: 'Бръснар',
    name: 'Павлин Пенчев',
    services: priceList({ hair: 10, 'hair-beard': 14, beard: 7, kids: 8 }),
  },
]
