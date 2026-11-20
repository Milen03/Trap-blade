const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { auth } = require('../utils');
const limits = require('../utils/rateLimits');

// auth() пуска само логнати потребители — иначе връща 401.
router.get('/profile', auth(), authController.getProfileInfo);
router.put('/profile', auth(), authController.editProfileInfo);

// "Настройки на профила": смяна на телефона и на паролата (изисква текущата парола).
router.put('/phone', auth(), authController.changePhone);
router.put('/name', auth(), authController.changeName);
// Имейлът се сменя с текущата парола; грешните опити се броят както при смяна на паролата.
router.put('/email', auth(), limits.changeEmail, authController.changeEmail);
// limits.changePassword е след auth(), за да брои по профила.
router.put('/password', auth(), limits.changePassword, authController.changePassword);

module.exports = router
