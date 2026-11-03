const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { useTestDb } = require('../helpers/db');
const f = require('../helpers/fixtures');

useTestDb();

const book = (agent, barber, time, extra = {}) =>
    agent.post('/api/appointments').send({ barberId: barber._id, date: f.tomorrow(), time, serviceId: 'hair', ...extra });

describe('Записване на час', () => {
    it('/barbers е публичен и без имейли и пароли', async () => {
        await f.createStaff('owner');
        await f.createStaff('barber');
        const res = await f.guest().get('/api/barbers').expect(200);
        assert.equal(res.body.length, 2);
        assert.equal(res.body[0].isLead, true, 'главният е пръв');
        assert.deepEqual(res.body[0].services.map((s) => s.id), ['hair', 'beard']);
        for (const barber of res.body) {
            assert.equal(barber.email, undefined);
            assert.equal(barber.password, undefined);
        }
    });

    it('записване -> 201, потвърдено веднага, и часът изчезва от свободните', async () => {
        const barber = await f.createStaff('barber');
        await f.openDay(barber, f.tomorrow());
        const { agent, user } = await f.registerClient();

        const res = await book(agent, barber, '10:30').expect(201);
        assert.equal(res.body.status, 'booked');
        assert.equal(res.body.clientName, `${user.firstName} ${user.lastName}`);
        assert.deepEqual(res.body.service, { id: 'hair', name: 'Коса', price: 10 });

        const day = await f.guest().get(`/api/availability?barberId=${barber._id}&date=${f.tomorrow()}`).expect(200);
        assert.deepEqual(day.body.slots, ['10:00', '11:00']);

        const month = await f.guest().get(`/api/availability?barberId=${barber._id}&month=${f.tomorrow().slice(0, 7)}`).expect(200);
        assert.deepEqual(month.body, [{ date: f.tomorrow(), free: 2 }]);

        const mine = await agent.get('/api/appointments/mine').expect(200);
        assert.equal(mine.body.length, 1);
        assert.equal(mine.body[0].barber.firstName, barber.firstName);
    });

    it('двама клиенти едновременно за един час -> точно един успява', async () => {
        const barber = await f.createStaff('barber');
        await f.openDay(barber, f.tomorrow());
        const clients = await Promise.all([f.registerClient('Първи'), f.registerClient('Втори')]);

        const results = await Promise.all(clients.map(({ agent }) => book(agent, barber, '10:00')));
        const statuses = results.map((r) => r.status).sort();
        assert.deepEqual(statuses, [201, 409]);
        const loser = results.find((r) => r.status === 409);
        assert.match(loser.body.message, /зает/);
    });

    it('неправилни заявки -> 400', async () => {
        const barber = await f.createStaff('barber');
        await f.openDay(barber, f.tomorrow());
        const { agent } = await f.registerClient();

        await book(agent, barber, '12:00').expect(400); // няма го в графика
        await book(agent, barber, '10:00', { serviceId: 'nails' }).expect(400); // непозната услуга
        await book(agent, barber, '10:00', { date: f.yesterday() }).expect(400); // минал ден
        await book(agent, barber, '10:00', { barberId: 'not-an-id' }).expect(400);
        await f.guest().post('/api/appointments').send({ barberId: barber._id, date: f.tomorrow(), time: '10:00', serviceId: 'hair' }).expect(401);
    });

    it('най-много 2 предстоящи часа на клиент', async () => {
        const barber = await f.createStaff('barber');
        await f.openDay(barber, f.tomorrow());
        const { agent } = await f.registerClient();

        await book(agent, barber, '10:00').expect(201);
        await book(agent, barber, '10:30').expect(201);
        const res = await book(agent, barber, '11:00').expect(409);
        assert.match(res.body.message, /най-много 2/);
    });

    it('отменен час може да се запише отново', async () => {
        const barber = await f.createStaff('barber');
        await f.openDay(barber, f.tomorrow());
        const first = await f.registerClient('Първи');
        const second = await f.registerClient('Втори');

        const booked = await book(first.agent, barber, '10:00').expect(201);
        await book(second.agent, barber, '10:00').expect(409);
        await first.agent.patch(`/api/appointments/${booked.body._id}/cancel`).expect(200);
        await book(second.agent, barber, '10:00').expect(201);
    });
});
