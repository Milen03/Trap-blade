const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { useTestDb } = require('../helpers/db');
const f = require('../helpers/fixtures');

useTestDb();

const updates = (agent, since) =>
    agent.get(`/api/appointments/updates${since ? `?since=${encodeURIComponent(since)}` : ''}`);

describe('Промени за панела (GET /api/appointments/updates)', () => {
    it('без since връща само началната точка', async () => {
        const barber = await f.loginAs(await f.createStaff('barber'));
        const res = await updates(barber).expect(200);
        assert.ok(!Number.isNaN(Date.parse(res.body.serverTime)));
        assert.deepEqual(res.body.appointments, []);
    });

    it('връща новите и отменените часове след since, но не по-старите', async () => {
        const barberUser = await f.createStaff('barber');
        await f.openDay(barberUser, f.tomorrow(), ['10:00', '10:30']);
        const barber = await f.loginAs(barberUser);
        const { agent: client, user } = await f.registerClient();

        const old = await f.insertAppointment(barberUser, user, { date: f.tomorrow(), time: '18:00' });
        const since = old.updatedAt.toISOString();

        const booked = await client
            .post('/api/appointments')
            .send({ barberId: barberUser._id, date: f.tomorrow(), time: '10:30', serviceId: 'hair' })
            .expect(201);

        let res = await updates(barber, since).expect(200);
        assert.deepEqual(res.body.appointments.map((a) => a._id), [booked.body._id]);
        assert.equal(res.body.appointments[0].status, 'booked');
        assert.equal(res.body.appointments[0].barber.firstName, barberUser.firstName);

        // Отмяната също е промяна.
        const before = res.body.appointments[0].updatedAt;
        await client.patch(`/api/appointments/${booked.body._id}/cancel`).expect(200);
        res = await updates(barber, before).expect(200);
        assert.equal(res.body.appointments.length, 1);
        assert.equal(res.body.appointments[0].status, 'cancelled');
        assert.equal(String(res.body.appointments[0].cancelledBy), String(user._id));
    });

    it('бръснарят вижда само своите, собственикът — на всички', async () => {
        const ownerUser = await f.createStaff('owner');
        const ivanUser = await f.createStaff('barber', 'Иван');
        const pavlinUser = await f.createStaff('barber', 'Павлин');
        const { user } = await f.registerClient();
        const since = new Date(Date.now() - 1000).toISOString();

        await f.insertAppointment(ivanUser, user, { date: f.tomorrow(), time: '10:00' });
        await f.insertAppointment(pavlinUser, user, { date: f.tomorrow(), time: '11:00' });

        const ivan = await updates(await f.loginAs(ivanUser), since).expect(200);
        assert.deepEqual(ivan.body.appointments.map((a) => a.time), ['10:00']);

        const owner = await updates(await f.loginAs(ownerUser), since).expect(200);
        assert.deepEqual(owner.body.appointments.map((a) => a.time).sort(), ['10:00', '11:00']);
    });

    it('клиент -> 403, гост -> 401, невалидна дата -> 400', async () => {
        const { agent: client } = await f.registerClient();
        await updates(client, new Date().toISOString()).expect(403);
        await updates(f.guest(), new Date().toISOString()).expect(401);

        const barber = await f.loginAs(await f.createStaff('barber'));
        await updates(barber, 'not-a-date').expect(400);
    });
});
