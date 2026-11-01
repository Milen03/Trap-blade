const express = require('express');
const router = express.Router();
const { barberController } = require('../controllers');

// Публично — списъкът с бръснарите и услугите им се вижда и без вход.
router.get('/', barberController.list);

module.exports = router;
