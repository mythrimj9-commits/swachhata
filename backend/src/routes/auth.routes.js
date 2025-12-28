const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { registerValidation, loginValidation, otpValidation } = require('../utils/validators');

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/admin-register', registerValidation, validate, authController.adminRegister);
router.post('/login', loginValidation, validate, authController.login);
router.post('/verify-otp', otpValidation, validate, authController.verifyOTPHandler);
router.post('/resend-otp', authController.resendOTP);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.get('/me', auth, authController.getMe);
router.put('/update-profile', auth, authController.updateProfile);
router.post('/logout', auth, authController.logout);

module.exports = router;
