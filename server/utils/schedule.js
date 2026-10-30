// Помощни функции за графика на бръснарите: часове, дати и проверки за формат.
// Всички "днес" / "този месец" се смятат в часовата зона на салона (София).
const { DateTime, Duration } = require('luxon');
const { httpError } = require('./errHandler');

const ZONE = 'Europe/Sofia';

// Стъпката между два часа (в минути) — от 5 минути до 4 часа.
const MIN_STEP = 5;
const MAX_STEP = 240;

// "HH:mm" от 00:00 до 23:59.
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_REGEX = /^\d{4}-\d{2}$/;

// ---------- Проверки за формат ----------

function isValidTime(value) {
    return typeof value === 'string' && TIME_REGEX.test(value);
}

// Освен формата проверяваме, че датата съществува (2026-02-30 не минава).
function isValidDate(value) {
    return typeof value === 'string'
        && DATE_REGEX.test(value)
        && DateTime.fromFormat(value, 'yyyy-MM-dd', { zone: ZONE }).isValid;
}

function isValidMonth(value) {
    return typeof value === 'string'
        && MONTH_REGEX.test(value)
        && DateTime.fromFormat(value, 'yyyy-MM', { zone: ZONE }).isValid;
}

function assertTime(value, label = 'Часът') {
    if (!isValidTime(value)) {
        throw httpError(400, `${label} трябва да е във формат HH:mm (например 10:30)`);
    }
}

function assertDate(value) {
    if (!isValidDate(value)) {
        throw httpError(400, 'Датата трябва да е във формат YYYY-MM-DD (например 2026-11-05)');
    }
}

function assertMonth(value) {
    if (!isValidMonth(value)) {
        throw httpError(400, 'Месецът трябва да е във формат YYYY-MM (например 2026-11)');
    }
}

// ---------- Часове ----------

// Списък с началните часове от from до to през step минути.
// "До 21:00" значи, че последният час трябва да СВЪРШВА до 21:00:
// buildTimes('10:00', '21:00', 30) -> ['10:00', '10:30', ..., '20:30']
function buildTimes(from, to, step) {
    assertTime(from, 'Началният час');
    assertTime(to, 'Крайният час');
    if (!Number.isInteger(step) || step < MIN_STEP || step > MAX_STEP) {
        throw httpError(400, `Стъпката трябва да е цяло число минути от ${MIN_STEP} до ${MAX_STEP}`);
    }

    // Duration, а не DateTime — така смяната на лятно/зимно време не мести часовете.
    const start = Duration.fromISOTime(from).as('minutes');
    const end = Duration.fromISOTime(to).as('minutes');
    if (start >= end) {
        throw httpError(400, 'Началният час трябва да е преди крайния');
    }

    const times = [];
    for (let minutes = start; minutes + step <= end; minutes += step) {
        times.push(Duration.fromObject({ minutes }).toFormat('hh:mm'));
    }

    if (times.length === 0) {
        throw httpError(400, 'Между началния и крайния час не се събира нито един час');
    }
    return times;
}

// ---------- Дати ----------

// Всички дати в месеца: datesInMonth('2026-11') -> ['2026-11-01', ..., '2026-11-30']
function datesInMonth(month) {
    assertMonth(month);
    const first = DateTime.fromFormat(month, 'yyyy-MM', { zone: ZONE });
    return Array.from({ length: first.daysInMonth }, (_, i) => first.plus({ days: i }).toFormat('yyyy-MM-dd'));
}

// Първата и последната дата в месеца — за търсене в базата ("2026-11-01" .. "2026-11-30").
function monthBounds(month) {
    const dates = datesInMonth(month);
    return { first: dates[0], last: dates[dates.length - 1] };
}

// Ден от седмицата като в JavaScript: 0 = неделя, 1 = понеделник, ... 6 = събота.
// (luxon брои 1 = понеделник ... 7 = неделя, затова % 7.)
function dayOfWeek(date) {
    assertDate(date);
    return DateTime.fromFormat(date, 'yyyy-MM-dd', { zone: ZONE }).weekday % 7;
}

// Днешната дата в София: "2026-10-30".
function today() {
    return DateTime.now().setZone(ZONE).toFormat('yyyy-MM-dd');
}

// Колко месеца напред е month спрямо текущия: този месец -> 0, следващия -> 1, миналия -> -1.
function monthsFromNow(month) {
    assertMonth(month);
    const current = DateTime.now().setZone(ZONE).startOf('month');
    const target = DateTime.fromFormat(month, 'yyyy-MM', { zone: ZONE });
    return Math.round(target.diff(current, 'months').months);
}

module.exports = {
    ZONE,
    isValidTime,
    isValidDate,
    isValidMonth,
    assertTime,
    assertDate,
    assertMonth,
    buildTimes,
    datesInMonth,
    monthBounds,
    dayOfWeek,
    today,
    monthsFromNow,
}
