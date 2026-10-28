const jwt = require('./jwt');
const { authCookieName } = require('../app-config');
const {
    userModel,
    tokenBlacklistModel
} = require('../models');

// Грешки, при които просто казваме "не си логнат" (401), а не "сървърът гръмна" (500).
const UNAUTHORIZED_ERRORS = ['TokenExpiredError', 'JsonWebTokenError'];
const UNAUTHORIZED_MESSAGES = ['blacklisted token', 'user not found'];

// Middleware, което пази маршрутите, достъпни само за логнати потребители.
// Чете JWT от httpOnly бисквитката, проверява го и слага потребителя в req.user.
// auth(false) -> пуска и нелогнати потребители (тогава req.user липсва).
function auth(redirectUnauthenticated = true) {

    return function (req, res, next) {
        const token = req.cookies[authCookieName] || '';
        Promise.all([
            jwt.verifyToken(token),
            tokenBlacklistModel.findOne({ token })
        ])
            .then(([data, blacklistedToken]) => {
                // Токенът е от сесия, от която потребителят вече е излязъл (logout).
                if (blacklistedToken) {
                    return Promise.reject(new Error('blacklisted token'));
                }
                return userModel.findById(data.id);
            })
            .then(user => {
                // Токенът е валиден, но потребителят е изтрит от базата.
                if (!user) {
                    return Promise.reject(new Error('user not found'));
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
