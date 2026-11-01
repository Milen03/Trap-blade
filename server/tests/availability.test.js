const test = require('node:test');
const assert = require('node:assert/strict');
const { freeSlots, freeDays } = require('../utils/availability');

const NOW = { date: '2026-11-05', time: '12:10' };
const day = (date, slots, dayOff = false) => ({ date, slots, dayOff });

test('freeSlots: маха заетите часове', () => {
    const workDay = day('2026-11-06', ['10:00', '10:30', '11:00']);
    assert.deepEqual(freeSlots(workDay, ['10:30'], NOW), ['10:00', '11:00']);
});

test('freeSlots: днес не показва часове, които вече са започнали', () => {
    const workDay = day('2026-11-05', ['11:30', '12:00', '12:10', '12:30', '13:00']);
    assert.deepEqual(freeSlots(workDay, ['13:00'], NOW), ['12:30']);
});

test('freeSlots: минал ден, почивен ден или липсващ ден -> няма часове', () => {
    assert.deepEqual(freeSlots(day('2026-11-04', ['10:00']), [], NOW), []);
    assert.deepEqual(freeSlots(day('2026-11-06', [], true), [], NOW), []);
    assert.deepEqual(freeSlots(null, [], NOW), []);
});

test('freeDays: брои свободните часове по дни и пропуска пълните дни', () => {
    const workDays = [
        day('2026-11-07', ['10:00', '10:30']),
        day('2026-11-06', ['10:00']),
        day('2026-11-08', [], true),
    ];
    const booked = [{ date: '2026-11-06', time: '10:00' }, { date: '2026-11-07', time: '10:30' }];
    assert.deepEqual(freeDays(workDays, booked, NOW), [{ date: '2026-11-07', free: 1 }]);
});
