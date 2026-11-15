const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { useTestDb } = require('../helpers/db');
const f = require('../helpers/fixtures');

useTestDb();

const NEW_PASSWORD = 'novaParola1';

describe('Настройки на профила', () => {
    describe('смяна на телефона', () => {
        it('валиден телефон -> 200 и се вижда в профила', async () => {
            const { agent } = await f.registerClient();
            const res = await agent.put('/api/users/phone').send({ phone: '+359 877 000 111' }).expect(200);
            assert.equal(res.body.phone, '+359 877 000 111');
            assert.equal(res.body.password, undefined);

            const profile = await agent.get('/api/users/profile').expect(200);
            assert.equal(profile.body.phone, '+359 877 000 111');
        });

        it('празен или невалиден -> 400; гост -> 401', async () => {
            const { agent } = await f.registerClient();
            await agent.put('/api/users/phone').send({ phone: '' }).expect(400);
            await agent.put('/api/users/phone').send({ phone: 'abc' }).expect(400);
            await f.guest().put('/api/users/phone').send({ phone: '0888 123 456' }).expect(401);
        });

        it('сменя само телефона, не името и имейла', async () => {
            const { agent, user } = await f.registerClient();
            const res = await agent
                .put('/api/users/phone')
                .send({ phone: '0899 999 999', firstName: 'Хакер', email: 'x@x.bg' })
                .expect(200);
            assert.equal(res.body.firstName, user.firstName);
            assert.equal(res.body.email, user.email);
        });
    });

    describe('смяна на паролата', () => {
        const change = (agent, body) => agent.put('/api/users/password').send(body);

        it('грешни данни -> 400 със съобщение', async () => {
            const { agent } = await f.registerClient();
            let res = await change(agent, { currentPassword: 'wrong-pass', password: NEW_PASSWORD, rePassword: NEW_PASSWORD }).expect(400);
            assert.match(res.body.message, /Текущата парола е грешна/);

            res = await change(agent, { currentPassword: f.PASSWORD, password: NEW_PASSWORD, rePassword: 'other123' }).expect(400);
            assert.match(res.body.message, /не съвпадат/);

            res = await change(agent, { currentPassword: f.PASSWORD, password: '123', rePassword: '123' }).expect(400);
            assert.match(res.body.message, /поне 6/);

            res = await change(agent, { currentPassword: f.PASSWORD, password: f.PASSWORD, rePassword: f.PASSWORD }).expect(400);
            assert.match(res.body.message, /различна/);

            await change(agent, { password: NEW_PASSWORD, rePassword: NEW_PASSWORD }).expect(400);
        });

        it('успех -> 200, остава влязъл; старата парола вече не работи, новата работи', async () => {
            const { agent, user } = await f.registerClient();
            await change(agent, { currentPassword: f.PASSWORD, password: NEW_PASSWORD, rePassword: NEW_PASSWORD }).expect(200);
            await agent.get('/api/users/profile').expect(200);

            await f.guest().post('/api/login').send({ email: user.email, password: f.PASSWORD }).expect(401);
            await f.guest().post('/api/login').send({ email: user.email, password: NEW_PASSWORD }).expect(200);
        });

        it('гост -> 401', async () => {
            await f.guest().put('/api/users/password').send({ currentPassword: 'x', password: NEW_PASSWORD, rePassword: NEW_PASSWORD }).expect(401);
        });
    });
});
