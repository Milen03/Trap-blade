const router = require('express').Router();
const users = require('./users');
const test = require('./test');
const { authController } = require('../controllers');
const { auth } = require('../utils');
const { loginLimiter, registerLimiter } = require('../utils/rateLimit');

// Всички пътища тук започват с /api (виж index.js).
router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
// auth(false): ако има валидна сесия, logout знае кой е потребителят (req.user).
router.post('/logout', auth(false), authController.logout);

router.use('/users', users);
router.use('/test', test);

module.exports = router;
