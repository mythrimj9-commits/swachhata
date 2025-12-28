const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadmin.controller');
const { auth } = require('../middleware/auth');
const { isSuperAdmin } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validator');
const { createAdminValidation, paginationValidation } = require('../utils/validators');

// Apply auth and superadmin role check to all routes
router.use(auth, isSuperAdmin);

// Admin management routes
router.post('/admins', createAdminValidation, validate, superadminController.createAdmin);
router.get('/admins', paginationValidation, validate, superadminController.getAllAdmins);
router.put('/admins/:id', superadminController.updateAdmin);
router.delete('/admins/:id', superadminController.deleteAdmin);
router.post('/admins/:id/resend-otp', superadminController.resendAdminOTP);

// Statistics
router.get('/statistics', superadminController.getSystemStatistics);

module.exports = router;
