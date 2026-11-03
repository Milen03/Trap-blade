const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { useTestDb } = require('../helpers/db');
const f = require('../helpers/fixtures');

useTestDb();

const manual = (agent, body) =>
    agent.post('/api/appointments/manual').send({ date: f.tomorrow(), time: '12:15', clientName: 'Обадил се', ...body });

describe('Ръчно вписване от бръснаря', () => {
    it('бръснарят вписва клиент в час извън графика -> 201', async () => {
        const barber = await f.createStaff('barber');
        await f.openDay(barber, f.tomorrow(), ['10:00']);
        const agent = await f.loginAs(barber);

        const res = await manual(agent, { clientPhone: '0899 111 222', serviceId: 'beard' }).expect(201);
        assert.equal(res.body.client, undefined, 'вписаният ръчно няма профил');
        assert.equal(res.body.clientName, 'Обадил се');
        assert.equal(res.body.service.price, 7);
        assert.equal(String(res.body.barber._id), String(barber._id));

        // Същият час втори път -> 409 (уникалният индекс важи и за ръчните).
        await manual(agent, {}).expect(409);
    });

    it('без име -> 400; клиент -> 403', async () => {
        const barber = await f.createStaff('barber');
        await manual(await f.loginAs(barber), { clientName: '' }).expect(400);

        const { agent: client } = await f.registerClient();
        await manual(client, {}).expect(403);
    });

    it('бръснар не може при друг бръснар; собственикът може', async () => {
        const owner = await f.createStaff('owner');
        const barber = await f.createStaff('barber', 'Иван');
        const otherBarber = await f.createStaff('barber', 'Павлин');

        await manual(await f.loginAs(otherBarber), { barberId: String(barber._id) }).expect(403);

        const res = await manual(await f.loginAs(owner), { barberId: String(barber._id) }).expect(201);
        assert.equal(String(res.body.barber._id), String(barber._id));
        assert.equal(String(res.body.createdBy), String(owner._id));
    });
});
