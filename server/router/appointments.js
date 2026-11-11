const express = require('express');
const router = express.Router();
const { appointmentController } = require('../controllers');
const { auth, requireRole } = require('../utils');
const limits = require('../utils/rateLimits');

// Записването изисква профил: auth() -> 401 за нелогнати.
router.use(auth());

// Клиент (всеки логнат потребител).
// limits.booking брои по профила (затова е след auth()).
router.post('/', limits.booking, appointmentController.create);
router.get('/mine', appointmentController.listMine);
// Отмяна: клиентът — своя час; бръснарят — своите; собственикът — всеки (проверките са в контролера).
router.patch('/:id/cancel', limits.cancel, appointmentController.cancel);

// Само бръснари и собственика: requireRole() -> 403 за клиенти.
router.get('/', requireRole('barber', 'owner'), appointmentController.listForBarber);
// Промени след дадена дата — панелът пита на всеки 15 s, за да показва новите часове без презареждане.
router.get('/updates', requireRole('barber', 'owner'), appointmentController.listUpdates);
router.post('/manual', requireRole('barber', 'owner'), appointmentController.createManual);

module.exports = router;
