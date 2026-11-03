const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { useTestDb } = require('../helpers/db');
const f = require('../helpers/fixtures');

useTestDb();

const cancel = (agent, appointment) => agent.patch(`/api/appointments/${appointment._id}/cancel`);

describe('Отмяна', () => {
    it('клиентът отменя свой час (поне 2 часа преди) -> 200, втори път -> 409', async () => {
        const barber = await f.createStaff('barber');
        const { agent, user } = await f.registerClient();
        const appointment = await f.insertAppointment(barber, user, { date: f.tomorrow(), time: '23:30' });

        const res = await cancel(agent, appointment).expect(200);
        assert.equal(res.body.status, 'cancelled');
        await cancel(agent, appointment).expect(409);
    });

    it('клиентът не може да отмени по-малко от 2 часа преди часа -> 400', async () => {
        const barber = await f.createStaff('barber');
        const { agent, user } = await f.registerClient();
        const appointment = await f.insertAppointment(barber, user, f.inHours(1));

        const res = await cancel(agent, appointment).expect(400);
        assert.match(res.body.message, /2 часа/);
    });

    it('чужд час -> 404', async () => {
        const barber = await f.createStaff('barber');
        const { user } = await f.registerClient('Първи');
        const { agent: other } = await f.registerClient('Втори');
        const appointment = await f.insertAppointment(barber, user, { date: f.tomorrow(), time: '12:00' });

        await cancel(other, appointment).expect(404);
        await cancel(other, { _id: 'not-an-id' }).expect(404);
    });

    it('бръснарят отменя свой час дори в последния момент; друг бръснар -> 404', async () => {
        const barber = await f.createStaff('barber', 'Иван');
        const otherBarber = await f.createStaff('barber', 'Павлин');
        const { user } = await f.registerClient();
        const appointment = await f.insertAppointment(barber, user, f.inHours(1));

        await cancel(await f.loginAs(otherBarber), appointment).expect(404);
        await cancel(await f.loginAs(barber), appointment).expect(200);
    });

    it('собственикът отменя час при всеки бръснар', async () => {
        const owner = await f.createStaff('owner');
        const barber = await f.createStaff('barber');
        const { user } = await f.registerClient();
        const appointment = await f.insertAppointment(barber, user, f.inHours(1));

        const res = await cancel(await f.loginAs(owner), appointment).expect(200);
        assert.equal(String(res.body.cancelledBy), String(owner._id));
    });
});
