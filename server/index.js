global.__basedir = __dirname;
require('dotenv').config();

const dbConnector = require('./config/db');
const { initIndexes } = require('./models');

dbConnector()
    // Индексите (включително този срещу двойно записване) трябва да са готови, преди да приемаме заявки.
    .then(() => initIndexes())
    .then(() => {
        // config и app се зареждат след dotenv, защото четат променливите от .env.
        const config = require('./config/config');
        const createApp = require('./app');

        createApp().listen(config.port, () => console.log(`Listening on port ${config.port}!`));
    })
    .catch((err) => {
        console.error(err);
        process.exitCode = 1;
    });
