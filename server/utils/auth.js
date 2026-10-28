const jwt = require('./jwt');
const { authCookieName } = require('../app-config');
const { userModel } = require('../models');

// Грешки, при които просто казваме "не си логнат" (401), а не "сървърът гръмна" (500).
const UNAUTHORIZED_ERRORS = ['TokenExpiredError', 'JsonWebTokenError'];
const UNAUTHORIZED_MESSAGES = ['token revoked', 'user not found'];

// Middleware, което пази маршрутите, достъпни само за логнати потребители.
// Чете JWT от httpOnly бисквитката, проверява го и слага потребителя в req.user.
// auth(false) -> пуска и нелогнати потребители (тогава req.user липсва).
function auth(redirectUnauthenticated = true) {

    return function (req, res, next) {
        const token = req.cookies[authCookieName] || '';

        jwt.verifyToken(token)
            .then(data => Promise.all([data, userModel.findById(data.id)]))
            .then(([data, user]) => {
                // Токенът е валиден, но потребителят е изтрит от базата.
                if (!user) {
                    return Promise.reject(new Error('user not found'));
                }
                // Всеки токен носи версията (v), която потребителят е имал при входа.
                // При "Изход" версията в базата се увеличава -> всички стари токени
                // (на всички устройства) спират да работят.
                if ((data.v || 0) !== user.tokenVersion) {
                    return Promise.reject(new Error('token revoked'));
                }
                req.user = user;
                req.isLogged = true;
            })
            .then(() => next(), err => {
                if (!redirectUnauthenticated) {
                    next();
                    return;
                }
                if (UNAUTHORIZED_ERRORS.includes(err.name) || UNAUTHORIZED_MESSAGES.includes(err.message)) {
                    res
                        .status(401)
                        .send({ message: 'Не си влязъл в профила си или сесията е изтекла.' });
                    return;
                }
                next(err);
            });
    }
}

module.exports = auth;
