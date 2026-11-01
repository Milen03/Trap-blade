// Смятане на свободните часове: часовете от графика (WorkDay.slots) без вече заетите.
// Тук няма заявки към базата — само чисти функции, за да се тестват лесно (виж tests/).
const schedule = require('./schedule');

// workDay: документът от графика (или null, ако денят го няма).
// bookedTimes: часовете с активно записване за този ден, например ["10:00", "12:30"].
// now: { date, time } — "сега" в София; подава се отвън, за да може да се тества.
// Връща подреден списък със свободните часове.
function freeSlots(workDay, bookedTimes, now = { date: schedule.today(), time: schedule.nowTime() }) {
    if (!workDay || workDay.dayOff || !Array.isArray(workDay.slots)) {
        return [];
    }
    if (workDay.date < now.date) {
        return [];
    }

    const booked = new Set(bookedTimes);
    const isToday = workDay.date === now.date;

    return workDay.slots
        .filter((time) => !booked.has(time))
        // Днес не показваме часове, които вече са започнали.
        .filter((time) => !isToday || time > now.time)
        .sort();
}

// За календара: за всеки ден от графика колко свободни часа има.
// workDays: списък с дни от графика; appointments: активните записвания за същия период.
// Връща [{ date: "2026-11-05", free: 12 }, ...] само за дните, в които има поне един свободен час.
function freeDays(workDays, appointments, now) {
    const bookedByDate = new Map();
    appointments.forEach(({ date, time }) => {
        if (!bookedByDate.has(date)) {
            bookedByDate.set(date, []);
        }
        bookedByDate.get(date).push(time);
    });

    return workDays
        .map((day) => ({ date: day.date, free: freeSlots(day, bookedByDate.get(day.date) || [], now).length }))
        .filter((day) => day.free > 0)
        .sort((a, b) => a.date.localeCompare(b.date));
}

module.exports = {
    freeSlots,
    freeDays,
};
