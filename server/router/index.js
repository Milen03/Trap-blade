const router = require('express').Router();
const users = require('./users');
const test = require('./test');
const { authController } = require('../controllers');

// Всички пътища тук започват с /api (виж index.js).
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/login/google', authController.googleLogin);
router.post('/login/apple', authController.appleLogin);
router.post('/logout', authController.logout);

router.use('/users', users);
router.use('/test', test);

module.exports = router;
