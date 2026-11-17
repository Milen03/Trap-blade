const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { useTestDb } = require('../helpers/db');
const f = require('../helpers/fixtures');
const oauth = require('../../utils/oauth');
const { userModel } = require('../../models');

useTestDb();

// Подменяме проверката на токена: "токенът" е JSON с данните, които Google би върнал.
// Истинската проверка (подпис, audience, срок) е в utils/oauth.js.
beforeEach(() => {
    oauth.verifyGoogleIdToken = async (credential) => {
        if (credential === 'bad') {
            const err = new Error('Входът с Google не успя. Опитай пак.');
            err.status = 401;
            throw err;
        }
        return JSON.parse(credential);
    };
});

const googleToken = (over = {}) =>
    JSON.stringify({ sub: 'g-123', email: 'ivan@gmail.com', email_verified: true, given_name: 'Иван', family_name: 'Петров', ...over });
const googleLogin = (agent, over) => agent.post('/api/login/google').send({ credential: googleToken(over) });

describe('Вход с Google', () => {
    it('нов потребител -> профил без телефон; довършване -> profileComplete', async () => {
        const agent = f.agent();
        const res = await googleLogin(agent).expect(200);
        assert.equal(res.body.email, 'ivan@gmail.com');
        assert.equal(res.body.firstName, 'Иван');
        assert.equal(res.body.profileComplete, false);
        assert.equal(res.body.hasPassword, false);
        assert.equal(res.body.hasGoogle, true);
        assert.equal(res.body.googleId, undefined, 'Google ID не излиза навън');

        const done = await agent
            .put('/api/users/profile')
            .send({ firstName: 'Иван', lastName: 'Петров', phone: '0888 123 456' })
            .expect(200);
        assert.equal(done.body.profileComplete, true);

        // Втори вход -> същият профил.
        const again = await googleLogin(f.agent()).expect(200);
        assert.equal(again.body._id, res.body._id);
        assert.equal(await userModel.countDocuments(), 1);
    });

    it('свързва Google към съществуващ профил с потвърден имейл', async () => {
        const { user } = await f.registerClient();
        const res = await googleLogin(f.agent(), { sub: 'g-777', email: user.email }).expect(200);
        assert.equal(res.body._id, user._id);
        assert.equal(res.body.hasPassword, true);
        assert.equal(res.body.profileComplete, true);
        // Паролата продължава да работи.
        await f.guest().post('/api/login').send({ email: user.email, password: f.PASSWORD }).expect(200);
    });

    it('непотвърден имейл, който вече е зает -> 409 (не свързваме)', async () => {
        const { user } = await f.registerClient();
        await googleLogin(f.agent(), { sub: 'g-888', email: user.email, email_verified: false }).expect(409);
    });

    it('невалиден токен -> 401; профил само с Google и вход с парола -> 401 с подсказка', async () => {
        await f.guest().post('/api/login/google').send({ credential: 'bad' }).expect(401);

        await googleLogin(f.agent()).expect(200);
        const res = await f.guest().post('/api/login').send({ email: 'ivan@gmail.com', password: 'whatever1' }).expect(401);
        assert.match(res.body.message, /създаден с Google/);
    });

    it('без телефон не може да запише час', async () => {
        const barber = await f.createStaff('barber');
        await f.openDay(barber, f.tomorrow());
        const agent = f.agent();
        await googleLogin(agent).expect(200);
        const res = await agent
            .post('/api/appointments')
            .send({ barberId: barber._id, date: f.tomorrow(), time: '10:00', serviceId: 'hair' })
            .expect(400);
        assert.match(res.body.message, /Довърши профила/);
    });

    it('профил само с Google: задава си парола без текуща; имейлът не се сменя', async () => {
        const agent = f.agent();
        await googleLogin(agent).expect(200);

        const email = await agent.put('/api/users/email').send({ email: 'drug@test.bg', currentPassword: 'x' }).expect(400);
        assert.match(email.body.message, /идва от Google/);

        const res = await agent.put('/api/users/password').send({ password: 'novaParola1', rePassword: 'novaParola1' }).expect(200);
        assert.equal(res.body.hasPassword, true);
        await f.guest().post('/api/login').send({ email: 'ivan@gmail.com', password: 'novaParola1' }).expect(200);

        // Вече има парола -> следващата смяна иска текущата.
        await agent.put('/api/users/password').send({ password: 'drugaParola2', rePassword: 'drugaParola2' }).expect(400);
    });
});

describe('Вход с Google без настройка', () => {
    it('без GOOGLE_CLIENT_ID истинската проверка връща 503', async () => {
        delete process.env.GOOGLE_CLIENT_ID;
        const real = require('../../utils/oauth');
        // Зареждаме наново модула, за да вземем истинската функция (горе е подменена).
        delete require.cache[require.resolve('../../utils/oauth')];
        const fresh = require('../../utils/oauth');
        await assert.rejects(fresh.verifyGoogleIdToken('x.y.z'), { status: 503 });
        require.cache[require.resolve('../../utils/oauth')].exports = real;
    });
});
