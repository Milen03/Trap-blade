const router = require('express').Router();
const users = require('./users');
const schedule = require('./schedule');
const barbers = require('./barbers');
const appointments = require('./appointments');
const { authController, appointmentController } = require('../controllers');
const limits = require('../utils/rateLimits');

// Всички пътища тук започват с /api (виж index.js).
// limits.* — ограничения на опитите (виж utils/rateLimits.js). При превишаване -> 429.
router.post('/register', limits.register, authController.register);
router.post('/login', limits.login, authController.login);
router.post('/logout', authController.logout);
// Забравена парола: 1) иска линк по имейл, 2) записва нова парола с кода от линка.
router.post('/forgot-password', limits.forgotPassword, authController.forgotPassword);
router.post('/reset-password', limits.resetPassword, authController.resetPassword);

router.use('/users', users);
// График на бръснарите — само за роли barber и owner.
router.use('/schedule', schedule);

// Записване на час.
// Публично: бръснарите с услугите им и свободните часове (виждат се и без вход).
router.use('/barbers', barbers);
router.get('/availability', appointmentController.getAvailability);
// Записване, "Моите часове", отмяна и (за бръснарите) вписване на клиенти — само с вход.
router.use('/appointments', appointments);

module.exports = router;
