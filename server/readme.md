# TrapBlade API

Express + MongoDB (mongoose) бекенд за записване на часове при бръснарите на TrapBlade.

## Пускане

Създай `server/.env` (не се качва в git) с поне `SECRET` и `COOKIESECRET` (дълги случайни низове),
`DB_URL` (по подразбиране `mongodb://localhost:27017/trapblade`) и `SEED_OWNER_*`, `SEED_BARBER1_*`,
`SEED_BARBER2_*` (`_EMAIL`, `_PASSWORD`) за акаунтите на бръснарите.

```bash
npm install
npm run seed           # създава собственика и бръснарите (роли, титли, услуги и цени)
npm start              # http://localhost:3000/api
npm test               # unit тестове (node --test)
```

В production (`NODE_ENV=production`) сървърът не тръгва без `SECRET` и `COOKIESECRET`.

## Роли

| Роля | Кой | Какво може |
|---|---|---|
| `client` | всеки регистриран | записва, гледа и отменя своите часове |
| `barber` | бръснар | прави своя график, вижда своите часове, вписва клиенти, отменя |
| `owner` | главният бръснар | като `barber` + вижда графика и часовете на всички |

Ролите се дават само от `npm run seed`. При регистрация винаги е `client`.

Всички дати са `YYYY-MM-DD`, часовете са `HH:mm`, а месеците `YYYY-MM`. Часовата зона е Europe/Sofia.
Грешките винаги идват като `{ "message": "..." }` (на български).

## Вход и профил

| Метод | Път | Тяло / бележки |
|---|---|---|
| POST | `/register` | `{ email, password, rePassword, firstName, lastName, phone }` |
| POST | `/login` | `{ email, password }` |
| POST | `/logout` | — |
| POST | `/forgot-password` | `{ email }`: праща линк по имейл |
| POST | `/reset-password` | `{ token, password, rePassword }` |
| GET | `/users/profile` | логнатият потребител (подновява сесията) |
| PUT | `/users/profile` | `{ firstName, lastName, phone }` |

Сесията е JWT в httpOnly бисквитка (`auth-cookie`).

## Бръснари и свободни часове (публично)

| Метод | Път | Отговор |
|---|---|---|
| GET | `/barbers` | `[{ _id, firstName, lastName, title, isLead, services: [{ id, name, price }] }]` |
| GET | `/availability?barberId=&date=` | `{ date, slots: ["10:00", ...] }`: свободните часове за деня (без заетите и без вече започналите днес) |
| GET | `/availability?barberId=&month=` | `[{ date, free }]`: дните с поне един свободен час (за календар) |

## Записване (с вход)

| Метод | Път | Кой | Бележки |
|---|---|---|---|
| POST | `/appointments` | логнат | `{ barberId, date, time, serviceId }`. Часът трябва да е от графика и свободен. Най-много 2 предстоящи часа на клиент. Двойно записване → 409. |
| GET | `/appointments/mine` | логнат | всички мои часове |
| PATCH | `/appointments/:id/cancel` | клиент / бръснар / owner | клиентът може да отмени най-късно 2 часа преди часа |
| GET | `/appointments?date=` или `?month=` `[&barberId=][&status=]` | barber, owner | barber вижда своите, owner вижда всички |
| POST | `/appointments/manual` | barber, owner | `{ date, time, clientName, clientPhone?, serviceId?, barberId? }`: бръснарят вписва клиент (часът може да е извън слотовете); `barberId` е само за owner |

Статуси на час: `booked`, `cancelled`, `completed`, `no_show`.

## График (barber, owner)

| Метод | Път | Тяло |
|---|---|---|
| GET | `/schedule?month=[&barberId=]` | дните от графика (owner вижда всички) |
| POST | `/schedule/generate` | `{ month, from?, to?, step?, daysOff? }`. По подразбиране 10:00–21:00 през 30 мин, почивка в неделя. Съществуващите дни не се пипат. |
| PUT | `/schedule/:date` | `{ dayOff?, slots? \| from+to(+step), note? }` |
| PATCH | `/schedule/:date/slots` | `{ time, open }`: отваря или затваря един час |

Ако промяна в графика би махнала час, в който има записан клиент, сървърът връща **409** и списък с часовете. Първо се отменя записването, после се сменя графикът.
