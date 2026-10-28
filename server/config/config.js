const env = process.env.NODE_ENV || 'development';

// Адресите на клиента, от които сървърът приема заявки с бисквитки (CORS).
// В production ги задаваш в CLIENT_ORIGIN, разделени със запетая:
// CLIENT_ORIGIN=https://trapblade.vercel.app,https://www.trapblade.bg
const clientOrigins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const config = {
    development: {
        port: process.env.PORT || 3000,
        // Локалната база се казва "trapblade" (в Compass: Localhost -> trapblade).
        // Можеш да я смениш с DB_URL в server/.env.
        dbURL: process.env.DB_URL || 'mongodb://localhost:27017/trapblade',
        // 5173 е портът на Vite (npm run dev в client/).
        origin: ['http://localhost:5173', 'http://localhost:5555', 'http://localhost:4200', ...clientOrigins]
    },
    production: {
        port: process.env.PORT || 3000,
        dbURL: process.env.DB_URL_CREDENTIALS,
        origin: clientOrigins
    }
};

module.exports = config[env];
