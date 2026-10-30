const { httpError } = require('./errHandler');

// Middleware, което пуска само потребители с някоя от дадените роли.
// Слага се СЛЕД auth(), защото чете req.user.
// Пример: router.post('/x', auth(), requireRole('barber', 'owner'), controller.x);
function requireRole(...roles) {
    return function (req, res, next) {
        if (!req.user) {
            return next(httpError(401, 'Не си влязъл в профила си или сесията е изтекла.'));
        }
        if (!roles.includes(req.user.role)) {
            return next(httpError(403, 'Нямаш права за това действие.'));
        }
        next();
    };
}

module.exports = {
    requireRole,
}
