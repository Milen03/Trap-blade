const router = require('express').Router();
const users = require('./users');
const test = require('./test');
const schedule = require('./schedule');
const { authController } = require('../controllers');

// Всички пътища тук започват с /api (виж index.js).
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
// Забравена парола: 1) иска линк по имейл, 2) записва нова парола с кода от линка.
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.use('/users', users);
// График на бръснарите — само за роли barber и owner.
router.use('/schedule', schedule);
router.use('/test', test);

module.exports = router;
