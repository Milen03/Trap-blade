const test = require('node:test');
const assert = require('node:assert/strict');
const schedule = require('../../utils/schedule');

test('buildTimes: от 10:00 до 21:00 през 30 мин — последният час свършва до 21:00', () => {
    const times = schedule.buildTimes('10:00', '21:00', 30);
    assert.equal(times[0], '10:00');
    assert.equal(times[times.length - 1], '20:30');
    assert.equal(times.length, 22);
});

test('buildTimes: грешен интервал или стъпка -> грешка 400', () => {
    assert.throws(() => schedule.buildTimes('12:00', '10:00', 30), { status: 400 });
    assert.throws(() => schedule.buildTimes('10:00', '12:00', 3), { status: 400 });
    assert.throws(() => schedule.buildTimes('10:00', '10:20', 30), { status: 400 });
    assert.throws(() => schedule.buildTimes('25:00', '26:00', 30), { status: 400 });
});

test('datesInMonth и monthBounds', () => {
    assert.equal(schedule.datesInMonth('2026-02').length, 28);
    assert.equal(schedule.datesInMonth('2028-02').length, 29);
    assert.deepEqual(schedule.monthBounds('2026-11'), { first: '2026-11-01', last: '2026-11-30' });
});

test('dayOfWeek: 0 = неделя', () => {
    assert.equal(schedule.dayOfWeek('2026-11-01'), 0);
    assert.equal(schedule.dayOfWeek('2026-11-02'), 1);
    assert.equal(schedule.dayOfWeek('2026-11-07'), 6);
});

test('isValidDate отказва несъществуващи дати', () => {
    assert.equal(schedule.isValidDate('2026-02-30'), false);
    assert.equal(schedule.isValidDate('2026-2-3'), false);
    assert.equal(schedule.isValidDate('2026-02-28'), true);
});

test('checkEditableDate: минал ден и твърде далеч напред -> 400', () => {
    assert.throws(() => schedule.checkEditableDate('2000-01-01'), { status: 400 });
    assert.throws(() => schedule.checkEditableDate('2999-01-01'), { status: 400 });
    assert.doesNotThrow(() => schedule.checkEditableDate(schedule.today()));
});
