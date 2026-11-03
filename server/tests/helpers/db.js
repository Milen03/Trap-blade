// Временна MongoDB само за тестовете (mongodb-memory-server).
// Пуска се празна база преди тестовете във файла, чисти се преди всеки тест и се трие накрая.
// Твоята истинска база не се пипа.
const { before, beforeEach, after } = require('node:test');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Тайните трябва да са зададени, преди да заредим приложението (виж utils/secrets.js).
process.env.SECRET = process.env.SECRET || 'test-secret';
process.env.COOKIESECRET = process.env.COOKIESECRET || 'test-cookie-secret';

let server;

// Вика се най-горе във всеки файл с тестове на API-то.
function useTestDb() {
    before(async () => {
        server = await MongoMemoryServer.create();
        await mongoose.connect(server.getUri());
        // Същите индекси като на истинския сървър — включително уникалния срещу двойно записване.
        await require('../../models').initIndexes();
    });

    beforeEach(async () => {
        const collections = await mongoose.connection.db.collections();
        await Promise.all(collections.map((collection) => collection.deleteMany({})));
    });

    after(async () => {
        await mongoose.disconnect();
        if (server) await server.stop();
    });
}

module.exports = { useTestDb };
