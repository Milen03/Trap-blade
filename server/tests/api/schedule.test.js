const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { useTestDb } = require('../helpers/db');
const f = require('../helpers/fixtures');
const { workDayModel } = require('../../models');

useTestDb();

describe('График', () => {
    it('генериране на месец; второ генериране не пипа вече направените дни', async () => {
        const barber = await f.createStaff('barber');
        const agent = await f.loginAs(barber);
        const month = f.tomorrow().slice(0, 7);

        const first = await agent.post('/api/schedule/generate').send({ month }).expect(200);
        assert.ok(first.body.created > 0);

        // Утре става почивен ден, после генерираме пак.
        await agent.put(`/api/schedule/${f.tomorrow()}`).send({ dayOff: true }).expect(200);
        const second = await agent.post('/api/schedule/generate').send({ month }).expect(200);
        assert.equal(second.body.created, 0);

        const day = await workDayModel.findOne({ barber: barber._id, date: f.tomorrow() });
        assert.equal(day.dayOff, true, 'почивният ден трябва да остане почивен');
    });

    it('отваряне и затваряне на час', async () => {
        const barber = await f.createStaff('barber');
        await f.openDay(barber, f.tomorrow(), ['10:00']);
        const agent = await f.loginAs(barber);

        let res = await agent.patch(`/api/schedule/${f.tomorrow()}/slots`).send({ time: '12:30', open: true }).expect(200);
        assert.deepEqual(res.body.slots, ['10:00', '12:30']);

        res = await agent.patch(`/api/schedule/${f.tomorrow()}/slots`).send({ time: '10:00', open: false }).expect(200);
        assert.deepEqual(res.body.slots, ['12:30']);
    });

    describe('не позволява да се изтрие час със записан клиент', () => {
        async function setup() {
            const barber = await f.createStaff('barber');
            await f.openDay(barber, f.tomorrow(), ['10:00', '10:30', '11:00']);
            const { agent: client } = await f.registerClient();
            await client
                .post('/api/appointments')
                .send({ barberId: barber._id, date: f.tomorrow(), time: '10:30', serviceId: 'hair' })
                .expect(201);
            return f.loginAs(barber);
        }

        it('затваряне на заетия час -> 409', async () => {
            const agent = await setup();
            const res = await agent.patch(`/api/schedule/${f.tomorrow()}/slots`).send({ time: '10:30', open: false }).expect(409);
            assert.match(res.body.message, /10:30/);
        });

        it('почивен ден -> 409', async () => {
            const agent = await setup();
            await agent.put(`/api/schedule/${f.tomorrow()}`).send({ dayOff: true }).expect(409);
        });

        it('ново работно време без заетия час -> 409, със заетия -> 200', async () => {
            const agent = await setup();
            await agent.put(`/api/schedule/${f.tomorrow()}`).send({ from: '11:00', to: '13:00', step: 30 }).expect(409);
            await agent.put(`/api/schedule/${f.tomorrow()}`).send({ slots: ['10:30', '12:00'] }).expect(200);
        });
    });
});
