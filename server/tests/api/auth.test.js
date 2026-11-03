const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { useTestDb } = require('../helpers/db');
const f = require('../helpers/fixtures');

useTestDb();

describe('Вход и права', () => {
    it('регистрация -> профил -> изход', async () => {
        const { agent, user } = await f.registerClient();
        assert.equal(user.role, 'client');
        assert.equal(user.password, undefined, 'паролата не бива да излиза навън');

        const profile = await agent.get('/api/users/profile').expect(200);
        assert.equal(profile.body.email, user.email);

        await agent.post('/api/logout').expect(204);
        await agent.get('/api/users/profile').expect(401);
    });

    it('вход с грешна парола -> 401', async () => {
        const { user } = await f.registerClient();
        await f.guest().post('/api/login').send({ email: user.email, password: 'wrong-pass' }).expect(401);
    });

    it('паролата се пази като bcrypt хеш', async () => {
        const barber = await f.createStaff('barber');
        assert.match(barber.password, /^\$2[aby]\$/);
        assert.equal(await barber.matchPassword(f.PASSWORD), true);
    });

    it('графикът е само за бръснари: гост -> 401, клиент -> 403, бръснар -> 200', async () => {
        const month = f.tomorrow().slice(0, 7);
        await f.guest().get(`/api/schedule?month=${month}`).expect(401);

        const { agent: client } = await f.registerClient();
        await client.get(`/api/schedule?month=${month}`).expect(403);

        const barber = await f.loginAs(await f.createStaff('barber'));
        await barber.get(`/api/schedule?month=${month}`).expect(200);
    });
});
