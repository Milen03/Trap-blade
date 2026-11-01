const express = require('express');
const router = express.Router();
const { appointmentController } = require('../controllers');
const { auth, requireRole } = require('../utils');

// Записването изисква профил: auth() -> 401 за нелогнати.
router.use(auth());

// Клиент (всеки логнат потребител).
router.post('/', appointmentController.create);
router.get('/mine', appointmentController.listMine);
// Отмяна: клиентът — своя час; бръснарят — своите; собственикът — всеки (проверките са в контролера).
router.patch('/:id/cancel', appointmentController.cancel);

// Само бръснари и собственика: requireRole() -> 403 за клиенти.
router.get('/', requireRole('barber', 'owner'), appointmentController.listForBarber);
router.post('/manual', requireRole('barber', 'owner'), appointmentController.createManual);

module.exports = router;
