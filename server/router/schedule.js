const express = require('express');
const router = express.Router();
const { scheduleController } = require('../controllers');
const { auth, requireRole } = require('../utils');

// Графикът е само за бръснари и собственика: auth() -> 401 за нелогнати,
// requireRole() -> 403 за клиенти.
router.use(auth(), requireRole('barber', 'owner'));

router.get('/', scheduleController.getMonth);
router.post('/generate', scheduleController.generateMonth);
router.put('/:date', scheduleController.updateDay);
router.patch('/:date/slots', scheduleController.toggleSlot);

module.exports = router
