const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-reset-code', authController.sendResetCode);
router.post('/verify-reset-code', authController.verifyResetCode);
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;
