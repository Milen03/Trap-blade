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

describe('Смяна на имейла', () => {
    const change = (agent, body) => agent.put('/api/users/email').send(body);

    it('с вярна парола -> 200; входът става с новия имейл, а старият вече не работи', async () => {
        const { agent, user } = await f.registerClient();
        const res = await change(agent, { email: '  Nov.Imeil@Test.bg ', currentPassword: f.PASSWORD }).expect(200);
        assert.equal(res.body.email, 'nov.imeil@test.bg');

        await f.guest().post('/api/login').send({ email: user.email, password: f.PASSWORD }).expect(401);
        await f.guest().post('/api/login').send({ email: 'nov.imeil@test.bg', password: f.PASSWORD }).expect(200);
    });

    it('грешни данни -> 400; зает имейл -> 409; гост -> 401', async () => {
        const { agent, user } = await f.registerClient('Първи');
        const { user: other } = await f.registerClient('Втори');

        let res = await change(agent, { email: 'nov@test.bg', currentPassword: 'wrong-pass' }).expect(400);
        assert.match(res.body.message, /Текущата парола е грешна/);
        await change(agent, { email: 'nov@test.bg' }).expect(400);
        await change(agent, { email: 'не-е-имейл', currentPassword: f.PASSWORD }).expect(400);
        res = await change(agent, { email: user.email, currentPassword: f.PASSWORD }).expect(400);
        assert.match(res.body.message, /сегашният/);

        res = await change(agent, { email: other.email, currentPassword: f.PASSWORD }).expect(409);
        assert.match(res.body.message, /вече е регистриран/);

        await f.guest().put('/api/users/email').send({ email: 'x@test.bg', currentPassword: 'x' }).expect(401);
    });
});

describe('Смяна на име и фамилия', () => {
    it('сменя само имената; телефонът и имейлът остават', async () => {
        const { agent, user } = await f.registerClient();
        const res = await agent.put('/api/users/name').send({ firstName: '  Петър ', lastName: 'Стоянов', phone: '0899 000 000', email: 'x@x.bg' }).expect(200);
        assert.equal(res.body.firstName, 'Петър');
        assert.equal(res.body.lastName, 'Стоянов');
        assert.equal(res.body.phone, user.phone);
        assert.equal(res.body.email, user.email);

        const profile = await agent.get('/api/users/profile').expect(200);
        assert.equal(profile.body.firstName, 'Петър');
    });

    it('празно или твърде дълго -> 400; гост -> 401', async () => {
        const { agent } = await f.registerClient();
        let res = await agent.put('/api/users/name').send({ firstName: '', lastName: 'Стоянов' }).expect(400);
        assert.match(res.body.message, /Въведи име/);
        res = await agent.put('/api/users/name').send({ firstName: 'Петър', lastName: ' ' }).expect(400);
        assert.match(res.body.message, /Въведи фамилия/);
        await agent.put('/api/users/name').send({ firstName: 'П'.repeat(51), lastName: 'Стоянов' }).expect(400);
        await f.guest().put('/api/users/name').send({ firstName: 'Петър', lastName: 'Стоянов' }).expect(401);
    });
});
