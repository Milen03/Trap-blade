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
    { days: 'Пон – Пет', time: '[Часове]' },
    { days: 'Събота', time: '[Часове]' },
    { days: 'Неделя', time: 'почивен' },
  ],
}

export const NAV_LINKS = [
  { label: 'Услуги', href: '#services' },
  { label: 'Екипът', href: '#team' },
  { label: 'Контакт', href: '#contact' },
]

// Price and duration are placeholders until the studio confirms them.
export const SERVICES = [
  {
    id: 'buzz-cut',
    name: 'Buzz Cut',
    text: 'Машинка на една дължина. Чисто, остро, без излишни приказки.',

  },
  {
    id: 'fade',
    name: 'Fade',
    text: 'Плавен преход от кожа до коса. Ниско, средно или високо — ти казваш.',
   
  },
  {
    id: 'crop',
    name: 'Crop',
    text: 'Текстуриран връх с къси страни. Модерна класика за всеки ден.',
   
  },
  {
    id: 'design',
    name: 'Design',
    text: 'Линии и шарки с бръснач. Подпис, който се вижда отдалеч.',
   
  },
]

export const MARQUEE_WORDS = ['Crop', 'Design', 'Beard', 'Buzz Cut', 'Fade']

export const TEAM = [
  { id: 'TB-001', role: 'Главен бръснар', name: 'Боян Попов', bio: 'Основател на студиото.', lead: true },
  { id: 'TB-002', role: 'Бръснар', name: '[Име Фамилия]', },
  { id: 'TB-003', role: 'Бръснар', name: '[Име Фамилия]',  },
]

export const BOOKING_STEPS = [
  { title: 'Избери бръснар', text: 'Главният или някой от екипа' },
  { title: 'Ден и час', text: 'Свободните часове се виждат веднага' },
  { title: 'Имена и телефон', text: 'Потвърждаваш и си готов' },
]
