const { workDayModel } = require('../models');
const { httpError, schedule } = require('../utils');

// Работно време по подразбиране: 10:00–21:00 през 30 минути, почивка в неделя (0).
const DEFAULT_FROM = '10:00';
const DEFAULT_TO = '21:00';
const DEFAULT_STEP = 30;
const DEFAULT_DAYS_OFF = [0];
// Докъде напред може да се прави график.
const MAX_MONTHS_AHEAD = 12;

const OBJECT_ID_REGEX = /^[0-9a-f]{24}$/i;

// ВАЖНО: всички промени са върху графика на req.user (логнатия бръснар/собственик).
// Никъде не четем id на бръснар от тялото на заявката.

function checkMonthRange(month) {
    const diff = schedule.monthsFromNow(month);
    if (diff < 0) {
        throw httpError(400, 'Не може да правиш график за минал месец');
    }
    if (diff > MAX_MONTHS_AHEAD) {
        throw httpError(400, `Графикът може да е най-много ${MAX_MONTHS_AHEAD} месеца напред`);
    }
}

// Ден, който може да се променя: валидна дата, не е минала и не е твърде напред.
function checkEditableDate(date) {
    schedule.assertDate(date);
    if (date < schedule.today()) {
        throw httpError(400, 'Не може да променяш минал ден');
    }
    checkMonthRange(date.slice(0, 7));
}

// Точен списък с часове от клиента -> проверени, без повторения, подредени.
function normalizeSlots(slots) {
    if (!Array.isArray(slots)) {
        throw httpError(400, 'slots трябва да е списък с часове, например ["10:00", "10:30"]');
    }
    slots.forEach((time) => {
        if (!schedule.isValidTime(time)) {
            throw httpError(400, `Невалиден час "${time}". Използвай формат HH:mm (например 10:30)`);
        }
    });
    return [...new Set(slots)].sort();
}

// POST /api/schedule/generate — тяло: { month, from?, to?, step?, daysOff? }
// Създава графика на req.user за целия месец. Дни, които вече съществуват, НЕ се пипат.
// Минали дни (преди днес) се прескачат.
async function generateMonth(req, res, next) {
    const {
        month,
        from = DEFAULT_FROM,
        to = DEFAULT_TO,
        step = DEFAULT_STEP,
        daysOff = DEFAULT_DAYS_OFF,
    } = req.body;

    try {
        schedule.assertMonth(month);
        checkMonthRange(month);

        const validDaysOff = Array.isArray(daysOff)
            && daysOff.every((day) => Number.isInteger(day) && day >= 0 && day <= 6);
        if (!validDaysOff) {
            throw httpError(400, 'daysOff трябва да е списък с дни от 0 (неделя) до 6 (събота), например [0]');
        }

        const times = schedule.buildTimes(from, to, step);
        const today = schedule.today();
        const dates = schedule.datesInMonth(month).filter((date) => date >= today);

        // upsert + $setOnInsert: записва деня само ако го няма. Съществуващите остават както са.
        const operations = dates.map((date) => {
            const dayOff = daysOff.includes(schedule.dayOfWeek(date));
            return {
                updateOne: {
                    filter: { barber: req.user._id, date },
                    update: { $setOnInsert: { dayOff, slots: dayOff ? [] : times, note: '' } },
                    upsert: true,
                },
            };
        });

        const result = operations.length
            ? await workDayModel.bulkWrite(operations, { ordered: false })
            : null;
        const created = result ? result.upsertedCount : 0;
        const existing = dates.length - created;

        res.status(200).json({
            month,
            created,
            existing,
            message: `Създадени дни: ${created}. Вече съществуващи (не са променени): ${existing}.`,
        });
    } catch (err) {
        next(err);
    }
}

// PUT /api/schedule/:date — тяло (всичко е по желание):
// { dayOff, from, to, step, slots, note }
// - slots: точен списък с часове  ИЛИ  from + to (+ step): часовете се генерират.
// - dayOff: true -> почивен ден, часовете се изчистват.
// - Ако подадеш часове без dayOff, денят става работен.
// Ако денят още го няма в графика, се създава.
async function updateDay(req, res, next) {
    const { date } = req.params;
    const { dayOff, from, to, step, slots, note } = req.body;

    try {
        checkEditableDate(date);

        const update = {};

        if (dayOff !== undefined) {
            if (typeof dayOff !== 'boolean') {
                throw httpError(400, 'dayOff трябва да е true или false');
            }
            update.dayOff = dayOff;
        }

        const hasRange = from !== undefined || to !== undefined || step !== undefined;
        if (slots !== undefined && hasRange) {
            throw httpError(400, 'Подай или точен списък с часове (slots), или интервал (from и to) — не и двете');
        }
        if (slots !== undefined) {
            update.slots = normalizeSlots(slots);
        } else if (hasRange) {
            if (from === undefined || to === undefined) {
                throw httpError(400, 'Подай и начален (from), и краен (to) час');
            }
            update.slots = schedule.buildTimes(from, to, step === undefined ? DEFAULT_STEP : step);
        }

        if (update.dayOff === true) {
            if (update.slots && update.slots.length) {
                throw httpError(400, 'Почивен ден не може да има часове');
            }
            update.slots = [];
        } else if (update.dayOff === undefined && update.slots && update.slots.length) {
            update.dayOff = false;
        }

        if (note !== undefined) {
            if (typeof note !== 'string') {
                throw httpError(400, 'Бележката трябва да е текст');
            }
            update.note = note;
        }

        if (Object.keys(update).length === 0) {
            throw httpError(400, 'Няма какво да се промени. Подай dayOff, from/to, slots или note.');
        }

        const day = await workDayModel.findOneAndUpdate(
            { barber: req.user._id, date },
            { $set: update },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );
        res.status(200).json(day);
    } catch (err) {
        next(err);
    }
}

// PATCH /api/schedule/:date/slots — тяло: { time, open }
// open: true -> отваря часа (добавя го), open: false -> затваря го (маха го).
async function toggleSlot(req, res, next) {
    const { date } = req.params;
    const { time, open } = req.body;
    const barber = req.user._id;

    try {
        checkEditableDate(date);
        schedule.assertTime(time);
        if (typeof open !== 'boolean') {
            throw httpError(400, 'open трябва да е true (отвори часа) или false (затвори часа)');
        }

        // Атомарни операции — две заявки едновременно не могат да си изтрият промените.
        let day;
        if (open) {
            day = await workDayModel.findOneAndUpdate(
                { barber, date, dayOff: false, slots: { $ne: time } },
                { $push: { slots: { $each: [time], $sort: 1 } } },
                { new: true }
            );
        } else {
            day = await workDayModel.findOneAndUpdate(
                { barber, date },
                { $pull: { slots: time } },
                { new: true }
            );
        }

        // Нищо не е променено — разбираме защо.
        if (!day) {
            day = await workDayModel.findOne({ barber, date });
            if (!day) {
                throw httpError(404, 'Няма график за тази дата. Първо го генерирай или създай деня.');
            }
            if (day.dayOff) {
                throw httpError(400, 'Този ден е почивен. Първо го направи работен.');
            }
            // Иначе часът вече е бил отворен — връщаме деня както е.
        }

        res.status(200).json(day);
    } catch (err) {
        next(err);
    }
}

// GET /api/schedule?month=YYYY-MM[&barberId=...]
// Бръснар вижда само своя график. Собственик вижда всички (или един бръснар с ?barberId=).
async function getMonth(req, res, next) {
    const { month, barberId } = req.query;

    try {
        schedule.assertMonth(month);
        const { first, last } = schedule.monthBounds(month);
        const filter = { date: { $gte: first, $lte: last } };

        if (req.user.role === 'owner') {
            if (barberId !== undefined) {
                if (typeof barberId !== 'string' || !OBJECT_ID_REGEX.test(barberId)) {
                    throw httpError(400, 'Невалиден barberId');
                }
                filter.barber = barberId;
            }
        } else {
            filter.barber = req.user._id;
        }

        const days = await workDayModel
            .find(filter)
            .sort({ date: 1, barber: 1 })
            .populate('barber', 'firstName lastName');
        res.status(200).json(days);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    generateMonth,
    updateDay,
    toggleSlot,
    getMonth,
}
