// Готови потребители, дни от графика и дати за тестовете на API-то.
// db.js първо — задава тайните, преди да се зареди приложението.
require('./db');
const request = require('supertest');
const { DateTime } = require('luxon');
const createApp = require('../../app');
const { userModel, workDayModel, appointmentModel } = require('../../models');
const schedule = require('../../utils/schedule');

const app = createApp();
const PASSWORD = 'secret123';

const SERVICES = [
    { id: 'hair', name: 'Коса', price: 10 },
    { id: 'beard', name: 'Брада', price: 7 },
];

// Дати спрямо днес (в София), за да не зависят тестовете от деня, в който се пускат.
const sofiaNow = () => DateTime.now().setZone(schedule.ZONE);
const today = () => schedule.today();
const daysFromToday = (n) => sofiaNow().plus({ days: n }).toFormat('yyyy-MM-dd');
const tomorrow = () => daysFromToday(1);
const yesterday = () => daysFromToday(-1);

let counter = 0;
const uniqueEmail = (prefix) => `${prefix}${++counter}@test.bg`;

// supertest "агент" — пази бисквитката за вход между заявките, като браузър.
const agent = () => request.agent(app);
const guest = () => request(app);

// Бръснар или собственик — ролята не може да се даде през регистрация, затова го създаваме директно.
async function createStaff(role = 'barber', firstName = role === 'owner' ? 'Боян' : 'Иван') {
    return userModel.create({
        email: uniqueEmail(role),
        password: PASSWORD,
        firstName,
        lastName: 'Тестов',
        role,
        title: role === 'owner' ? 'Главен бръснар' : 'Бръснар',
        isLead: role === 'owner',
        services: SERVICES,
    });
}

// Влиза като дадения потребител и връща агент с бисквитката.
async function loginAs(user) {
    const a = agent();
    await a.post('/api/login').send({ email: user.email, password: PASSWORD }).expect(200);
    return a;
}

// Регистрира нов клиент през API-то (както на сайта). Връща { agent, user }.
async function registerClient(firstName = 'Георги') {
    const a = agent();
    const res = await a
        .post('/api/register')
        .send({
            firstName,
            lastName: 'Клиентов',
            phone: '0888 123 456',
            email: uniqueEmail('client'),
            password: PASSWORD,
            rePassword: PASSWORD,
        })
        .expect(200);
    return { agent: a, user: res.body };
}

// Работен ден в графика на бръснаря с дадените часове.
function openDay(barber, date, slots = ['10:00', '10:30', '11:00']) {
    return workDayModel.create({ barber: barber._id, date, slots, dayOff: false });
}

// Записан час директно в базата — за случаи, които API-то не позволява да се създадат
// (например час, който започва след по-малко от 2 часа).
function insertAppointment(barber, client, { date, time }) {
    return appointmentModel.create({
        barber: barber._id,
        client: client._id,
        clientName: 'Тест Клиент',
        date,
        time,
        service: SERVICES[0],
        createdBy: client._id,
    });
}

// Час след hours часа от сега: { date, time }.
function inHours(hours) {
    const at = sofiaNow().plus({ hours }).startOf('minute');
    return { date: at.toFormat('yyyy-MM-dd'), time: at.toFormat('HH:mm') };
}

module.exports = {
    app,
    PASSWORD,
    SERVICES,
    today,
    tomorrow,
    yesterday,
    daysFromToday,
    agent,
    guest,
    createStaff,
    loginAs,
    registerClient,
    openDay,
    insertAppointment,
    inHours,
};
