// Самото Express приложение — без връзка с базата и без порт.
// index.js го пуска за истинския сървър, а тестовете (tests/api) — директно, без порт.
global.__basedir = global.__basedir || __dirname;

const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const apiRouter = require('./router');
const { errorHandler } = require('./utils');

function createApp() {
    const app = express();
    require('./config/express')(app);

    app.use(cors({
        origin: config.origin,
        credentials: true,
    }));

    app.use('/api', apiRouter);

    // Последен — тук стигат всички грешки, подадени с next(err).
    app.use(errorHandler);

    return app;
}

module.exports = createApp;
