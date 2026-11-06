// Ограничения на опитите (express-rate-limit) — защита от пробване на пароли,
// заливане на чужда поща с писма и масово записване на часове.
//
// Как се брои:
// - ОСНОВНИТЕ ограничения са по имейл (вход, забравена парола) и по профил (записване).
//   Те работят правилно, каквото и да е IP-то на заявката.
// - Ограниченията по IP са допълнителни и с висок праг. Заявките идват през Vercel и Railway,
//   затова IP-то на клиента е първият адрес в X-Forwarded-For. Ако някой го подправи, само
//   заобикаля IP ограничението — тези по имейл/профил остават.
//
// Броячите са в паметта на сървъра (един сървър в Railway) и се нулират при рестарт.
// В тестовете са изключени с RATE_LIMIT=off (виж tests/helpers/db.js), освен в rateLimit.test.js.
const { rateLimit, ipKeyGenerator, MINUTE, HOUR } = require('express-rate-limit');
const { cleanString } = require('./validators');

const STAFF_ROLES = ['barber', 'owner'];

// IP адресът на клиента: първият в X-Forwarded-For (сложен от Vercel/Railway), иначе прекият.
function clientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    const first = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '';
    // ipKeyGenerator групира IPv6 адресите по мрежа, за да не се заобикаля със смяна на адреса.
    return ipKeyGenerator(first || req.ip || 'unknown');
}

const emailOf = (req) => cleanString(req.body && req.body.email).toLowerCase();

// Общи настройки: 429 с { message } на български (клиентът го показва като грешка във формата).
function limiter({ name, windowMs, limit, key, message, skipSuccessfulRequests = false, skipIf = () => false }) {
    return rateLimit({
        windowMs,
        limit,
        skipSuccessfulRequests,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        // Ключът винаги започва с името на ограничението, за да не се смесват броячите.
        keyGenerator: (req) => `${name}:${key(req)}`,
        // Изключено в тестовете (освен ако тестът изрично не го включи).
        skip: (req) => process.env.RATE_LIMIT === 'off' || skipIf(req),
        handler: (req, res) => res.status(429).json({ message }),
        // Сами четем X-Forwarded-For (виж clientIp) — не искаме проверките на библиотеката за trust proxy.
        validate: { xForwardedForHeader: false, trustProxy: false },
    });
}

const minutes = (n) => `${n} минути`;

// ---------- Вход ----------

// Неуспешни опити за един имейл: 8 за 15 минути. Успешните входове не се броят.
const loginPerEmail = limiter({
    name: 'login-email',
    windowMs: 15 * MINUTE,
    limit: 8,
    skipSuccessfulRequests: true,
    key: emailOf,
    message: `Твърде много неуспешни опити за вход с този имейл. Опитай пак след ${minutes(15)} или се обади в салона.`,
});

// Всички опити от един IP адрес: 50 за 15 минути.
const loginPerIp = limiter({
    name: 'login-ip',
    windowMs: 15 * MINUTE,
    limit: 50,
    key: clientIp,
    message: `Твърде много опити за вход. Опитай пак след ${minutes(15)}.`,
});

// ---------- Регистрация ----------

const registerPerIp = limiter({
    name: 'register-ip',
    windowMs: HOUR,
    limit: 20,
    key: clientIp,
    message: 'Твърде много регистрации от това устройство. Опитай пак след час.',
});

// ---------- Забравена парола ----------
// (Освен това контролерът праща писмо до един имейл най-много веднъж на 2 минути.)

const forgotPerEmail = limiter({
    name: 'forgot-email',
    windowMs: HOUR,
    limit: 5,
    key: emailOf,
    message: 'Твърде много заявки за нова парола за този имейл. Опитай пак след час.',
});

const forgotPerIp = limiter({
    name: 'forgot-ip',
    windowMs: HOUR,
    limit: 20,
    key: clientIp,
    message: 'Твърде много заявки за нова парола. Опитай пак след час.',
});

const resetPerIp = limiter({
    name: 'reset-ip',
    windowMs: 15 * MINUTE,
    limit: 20,
    key: clientIp,
    message: `Твърде много опити. Опитай пак след ${minutes(15)}.`,
});

// ---------- Записване на час ----------
// Слага се СЛЕД auth(), за да брои по профила. (Освен това един клиент има най-много 2 предстоящи часа.)

const bookingPerUser = limiter({
    name: 'booking-user',
    windowMs: HOUR,
    limit: 10,
    key: (req) => (req.user ? String(req.user._id) : clientIp(req)),
    message: 'Твърде много опити за записване. Опитай пак след час или се обади в салона.',
});

const cancelPerUser = limiter({
    name: 'cancel-user',
    windowMs: HOUR,
    limit: 20,
    key: (req) => (req.user ? String(req.user._id) : clientIp(req)),
    // Бръснарите и главният не се ограничават — може да отменят целия си ден (например при болест).
    skipIf: (req) => Boolean(req.user) && STAFF_ROLES.includes(req.user.role),
    message: 'Твърде много отмени. Опитай пак след час или се обади в салона.',
});

module.exports = {
    clientIp,
    login: [loginPerIp, loginPerEmail],
    register: [registerPerIp],
    forgotPassword: [forgotPerIp, forgotPerEmail],
    resetPassword: [resetPerIp],
    booking: [bookingPerUser],
    cancel: [cancelPerUser],
};
