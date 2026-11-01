const router = require('express').Router();
const users = require('./users');
const schedule = require('./schedule');
const barbers = require('./barbers');
const appointments = require('./appointments');
const { authController, appointmentController } = require('../controllers');

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

// Записване на час.
// Публично: бръснарите с услугите им и свободните часове (виждат се и без вход).
router.use('/barbers', barbers);
router.get('/availability', appointmentController.getAvailability);
// Записване, "Моите часове", отмяна и (за бръснарите) вписване на клиенти — само с вход.
router.use('/appointments', appointments);

module.exports = router;
