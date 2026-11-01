const { appointmentModel, workDayModel } = require('../models');
const { httpError, schedule, availability, validators } = require('../utils');
const { findBarber } = require('./barberController');

// Колко активни (предстоящи) часа може да има един клиент наведнъж.
// 2, за да може родител да запише себе си и детето си.
const MAX_ACTIVE_PER_CLIENT = 2;
// Клиентът може да отмени най-късно толкова часа преди часа си. След това — само по телефона.
const CANCEL_HOURS_BEFORE = 2;

const BARBER_FIELDS = 'firstName lastName title';

// "Сега" в София — за свободните часове днес.
function now() {
    return { date: schedule.today(), time: schedule.nowTime() };
}

// Часът вече е започнал (или е минал ден).
function hasStarted(date, time) {
    const current = now();
    return date < current.date || (date === current.date && time <= current.time);
}

// Връща записването с имената на бръснаря (за отговорите към клиента).
function withBarber(appointment) {
    return appointment.populate('barber', BARBER_FIELDS).execPopulate();
}

// Филтър по дата: ?date=YYYY-MM-DD или ?month=YYYY-MM (точно едно от двете).
function dateFilter({ date, month }) {
    if ((date === undefined) === (month === undefined)) {
        throw httpError(400, 'Подай или дата (date=YYYY-MM-DD), или месец (month=YYYY-MM)');
    }
    if (date !== undefined) {
        schedule.assertDate(date);
        return date;
    }
    schedule.assertMonth(month);
    const { first, last } = schedule.monthBounds(month);
    return { $gte: first, $lte: last };
}

// Намира услугата в списъка на бръснаря. Хвърля 400, ако я няма.
function findService(barber, serviceId) {
    const service = (barber.services || []).find((s) => s.id === serviceId);
    if (!service) {
        throw httpError(400, 'Бръснарят няма такава услуга');
    }
    return { id: service.id, name: service.name, price: service.price };
}

// ---------- Публично ----------

// GET /api/availability?barberId=...&date=YYYY-MM-DD
//   -> { date, slots: ["10:00", ...] } — свободните часове за деня.
// GET /api/availability?barberId=...&month=YYYY-MM
//   -> [{ date, free }] — дните от месеца, в които има поне един свободен час (за календара).
async function getAvailability(req, res, next) {
    const { barberId, date, month } = req.query;

    try {
        const barber = await findBarber(barberId);
        const dates = dateFilter({ date, month });

        const [workDays, booked] = await Promise.all([
            workDayModel.find({ barber: barber._id, date: dates }).select('date dayOff slots'),
            appointmentModel.find({ barber: barber._id, date: dates, status: 'booked' }).select('date time'),
        ]);

        if (date !== undefined) {
            const slots = availability.freeSlots(workDays[0] || null, booked.map((a) => a.time), now());
            return res.status(200).json({ date, slots });
        }

        res.status(200).json(availability.freeDays(workDays, booked, now()));
    } catch (err) {
        next(err);
    }
}

// ---------- Клиент ----------

// POST /api/appointments — тяло: { barberId, date, time, serviceId }
// Записва логнатия потребител за свободен час от графика на бръснаря. Потвърждава се веднага.
async function create(req, res, next) {
    const { barberId, date, time, serviceId } = req.body;
    const user = req.user;

    try {
        const barber = await findBarber(barberId);
        schedule.assertDate(date);
        schedule.assertTime(time);
        if (hasStarted(date, time)) {
            throw httpError(400, 'Този час вече мина. Избери друг.');
        }
        schedule.checkEditableDate(date);
        const service = findService(barber, serviceId);

        const workDay = await workDayModel.findOne({ barber: barber._id, date });
        if (!workDay || workDay.dayOff || !workDay.slots.includes(time)) {
            throw httpError(400, 'Този час не е свободен в графика на бръснаря. Избери друг.');
        }

        // Ограничение за брой предстоящи часове — да не може някой да запише целия ден.
        const active = await appointmentModel
            .find({ client: user._id, status: 'booked', date: { $gte: schedule.today() } })
            .select('date time');
        const upcoming = active.filter((a) => !hasStarted(a.date, a.time));
        if (upcoming.length >= MAX_ACTIVE_PER_CLIENT) {
            throw httpError(409, `Може да имаш най-много ${MAX_ACTIVE_PER_CLIENT} предстоящи часа. Отмени някой, за да запишеш нов.`);
        }

        // Ако някой друг е взел същия час междувременно, уникалният индекс връща грешка 11000
        // -> errorHandler отговаря с 409 "Този час току-що беше зает".
        const appointment = await appointmentModel.create({
            barber: barber._id,
            client: user._id,
            clientName: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
            clientPhone: user.phone,
            date,
            time,
            service,
            createdBy: user._id,
        });

        res.status(201).json(await withBarber(appointment));
    } catch (err) {
        next(err);
    }
}

// GET /api/appointments/mine — всички часове на логнатия потребител (подредени по дата и час).
async function listMine(req, res, next) {
    try {
        const appointments = await appointmentModel
            .find({ client: req.user._id })
            .sort({ date: 1, time: 1 })
            .populate('barber', BARBER_FIELDS);
        res.status(200).json(appointments);
    } catch (err) {
        next(err);
    }
}

// PATCH /api/appointments/:id/cancel
// - клиентът: само свой час и най-късно CANCEL_HOURS_BEFORE часа преди него;
// - бръснарят: всеки свой час;
// - собственикът: всеки час.
async function cancel(req, res, next) {
    const { id } = req.params;
    const user = req.user;

    try {
        if (!validators.isObjectId(id)) {
            throw httpError(404, 'Няма такъв час');
        }
        const appointment = await appointmentModel.findById(id);

        const isOwner = user.role === 'owner';
        const isBarber = appointment && appointment.barber.equals(user._id);
        const isClient = appointment && appointment.client && appointment.client.equals(user._id);

        // На чужд час отговаряме с 404, а не 403 — да не се разбира, че такъв час съществува.
        if (!appointment || !(isOwner || isBarber || isClient)) {
            throw httpError(404, 'Няма такъв час');
        }
        if (appointment.status !== 'booked') {
            throw httpError(409, 'Този час вече не е активен');
        }

        if (!isOwner && !isBarber) {
            const start = schedule.toDateTime(appointment.date, appointment.time);
            const hoursLeft = start.diffNow('hours').hours;
            if (hoursLeft < CANCEL_HOURS_BEFORE) {
                throw httpError(400, `Час може да се отмени най-късно ${CANCEL_HOURS_BEFORE} часа преди него. Обади се в салона.`);
            }
        }

        // Атомарно: ако междувременно някой друг го е отменил, няма да го отменим втори път.
        const cancelled = await appointmentModel.findOneAndUpdate(
            { _id: appointment._id, status: 'booked' },
            { $set: { status: 'cancelled', cancelledBy: user._id, cancelledAt: new Date() } },
            { new: true }
        );
        if (!cancelled) {
            throw httpError(409, 'Този час вече не е активен');
        }

        res.status(200).json(await withBarber(cancelled));
    } catch (err) {
        next(err);
    }
}

// ---------- Бръснар / собственик ----------

// GET /api/appointments?date=YYYY-MM-DD | month=YYYY-MM [&barberId=...] [&status=booked]
// Бръснарят вижда само своите часове. Собственикът вижда всички (или на един бръснар с ?barberId=).
async function listForBarber(req, res, next) {
    const { date, month, barberId, status } = req.query;

    try {
        const filter = { date: dateFilter({ date, month }) };

        if (status !== undefined) {
            if (!appointmentModel.STATUSES.includes(status)) {
                throw httpError(400, `status трябва да е едно от: ${appointmentModel.STATUSES.join(', ')}`);
            }
            filter.status = status;
        }

        if (req.user.role === 'owner') {
            if (barberId !== undefined) {
                if (!validators.isObjectId(barberId)) {
                    throw httpError(400, 'Невалиден barberId');
                }
                filter.barber = barberId;
            }
        } else {
            filter.barber = req.user._id;
        }

        const appointments = await appointmentModel
            .find(filter)
            .sort({ date: 1, time: 1, barber: 1 })
            .populate('barber', BARBER_FIELDS);
        res.status(200).json(appointments);
    } catch (err) {
        next(err);
    }
}

// POST /api/appointments/manual — тяло: { date, time, clientName, clientPhone?, serviceId?, barberId? }
// Бръснарят сам вписва човек (например обадил се по телефона) в своя график.
// Часът може да е всеки валиден час от деня — не е задължително да е от слотовете.
// barberId може да подаде само собственикът (за да впише клиент при друг бръснар).
async function createManual(req, res, next) {
    const { date, time, serviceId, barberId } = req.body;
    const clientName = validators.cleanString(req.body.clientName);
    const clientPhone = validators.cleanString(req.body.clientPhone);

    try {
        let barber = req.user;
        if (barberId !== undefined && String(barberId) !== String(req.user._id)) {
            if (req.user.role !== 'owner') {
                throw httpError(403, 'Може да вписваш клиенти само в своя график.');
            }
            barber = await findBarber(barberId);
        }

        schedule.checkEditableDate(date);
        schedule.assertTime(time);
        if (!clientName) {
            throw httpError(400, 'Въведи името на клиента');
        }
        if (clientPhone && !validators.PHONE_REGEX.test(clientPhone)) {
            throw httpError(400, 'Невалиден телефонен номер');
        }
        const service = serviceId === undefined || serviceId === '' ? undefined : findService(barber, serviceId);

        const appointment = await appointmentModel.create({
            barber: barber._id,
            clientName,
            clientPhone: clientPhone || undefined,
            date,
            time,
            service,
            createdBy: req.user._id,
        });

        res.status(201).json(await withBarber(appointment));
    } catch (err) {
        next(err);
    }
}

module.exports = {
    MAX_ACTIVE_PER_CLIENT,
    CANCEL_HOURS_BEFORE,
    getAvailability,
    create,
    listMine,
    cancel,
    listForBarber,
    createManual,
};
