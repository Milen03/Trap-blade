const { rateLimit } = require('express-rate-limit');

// Ограничава колко пъти може да се опита едно действие от един IP адрес.
// Така никой не може да пробва хиляди пароли една след друга (brute force).
function limiter({ minutes, max, message }) {
    return rateLimit({
        windowMs: minutes * 60 * 1000,
        limit: max,
        // Изпраща стандартните заглавки RateLimit-*, за да знае клиентът колко опита остават.
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        // Отговорът е 429 Too Many Requests с { message } като всички други грешки.
        message: { message },
    });
}

// Вход: 10 опита на 15 минути от един IP.
const loginLimiter = limiter({
    minutes: 15,
    max: 10,
    message: 'Твърде много опити за вход. Опитай отново след 15 минути.',
});

// Регистрация: 10 нови профила на час от един IP.
const registerLimiter = limiter({
    minutes: 60,
    max: 10,
    message: 'Твърде много регистрации от този адрес. Опитай отново по-късно.',
});

module.exports = {
    loginLimiter,
    registerLimiter,
}
