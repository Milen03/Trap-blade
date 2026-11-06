const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { useTestDb } = require('../helpers/db');
const f = require('../helpers/fixtures');

useTestDb();
// Във всички останали тестове ограниченията са изключени (виж helpers/db.js) — тук ги включваме.
delete process.env.RATE_LIMIT;

// Всеки тест е от различен IP адрес, за да не си пречат броячите по IP.
let ipCounter = 0;
const newIp = () => `203.0.113.${++ipCounter}`;

describe('Ограничения на опитите', () => {
    it('вход: 8 грешни пароли за един имейл -> 9-ият опит е 429, дори с вярната парола', async () => {
        const ip = newIp();
        const barber = await f.createStaff('barber');
        const login = (password) =>
            f.guest().post('/api/login').set('X-Forwarded-For', ip).send({ email: barber.email, password });

        for (let i = 0; i < 8; i += 1) {
            await login('wrong-pass').expect(401);
        }
        const blocked = await login(f.PASSWORD).expect(429);
        assert.match(blocked.body.message, /Твърде много/);

        // Друг имейл от същия IP не е блокиран.
        const other = await f.createStaff('owner');
        await f.guest().post('/api/login').set('X-Forwarded-For', ip).send({ email: other.email, password: f.PASSWORD }).expect(200);
    });

    it('вход: успешните входове не се броят', async () => {
        const ip = newIp();
        const barber = await f.createStaff('barber');
        for (let i = 0; i < 12; i += 1) {
            await f.guest().post('/api/login').set('X-Forwarded-For', ip).send({ email: barber.email, password: f.PASSWORD }).expect(200);
        }
    });

    it('вход: 50 опита от един IP -> 51-ият е 429; друг IP минава', async () => {
        const ip = newIp();
        const login = (n, from = ip) =>
            f.guest().post('/api/login').set('X-Forwarded-For', from).send({ email: `nobody${n}@test.bg`, password: 'x' });

        for (let i = 0; i < 50; i += 1) {
            await login(i).expect(401);
        }
        await login(50).expect(429);
        await login(51, newIp()).expect(401);
    });

    it('забравена парола: 5 заявки за един имейл на час -> 6-ата е 429', async () => {
        const ip = newIp();
        const forgot = () =>
            f.guest().post('/api/forgot-password').set('X-Forwarded-For', ip).send({ email: 'someone@test.bg' });
        for (let i = 0; i < 5; i += 1) {
            await forgot().expect(200);
        }
        await forgot().expect(429);
    });

    it('записване: 10 опита на час за един профил -> 11-ият е 429; друг клиент минава', async () => {
        const barber = await f.createStaff('barber');
        await f.openDay(barber, f.tomorrow());
        const first = await f.registerClient('Първи');
        const second = await f.registerClient('Втори');
        // Опити за час извън графика (400) — броят се като опити.
        const attempt = (agent) =>
            agent.post('/api/appointments').send({ barberId: barber._id, date: f.tomorrow(), time: '23:00', serviceId: 'hair' });

        for (let i = 0; i < 10; i += 1) {
            await attempt(first.agent).expect(400);
        }
        await attempt(first.agent).expect(429);
        await attempt(second.agent).expect(400);
    });

    it('отмяна: бръснарите не се ограничават', async () => {
        const barber = await f.loginAs(await f.createStaff('barber'));
        for (let i = 0; i < 25; i += 1) {
            await barber.patch('/api/appointments/000000000000000000000000/cancel').expect(404);
        }
    });
});
