const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validator');
const { fineValidation, paginationValidation } = require('../utils/validators');

// Apply auth and admin role check to all routes
router.use(auth, isAdmin);

// Complaint routes
router.get('/complaints', paginationValidation, validate, adminController.getAllComplaints);
router.get('/complaints/:id', adminController.getComplaintDetails);
router.put('/complaints/:id/verify', adminController.verifyVehicleNumber);
router.put('/complaints/:id/status', adminController.updateComplaintStatus);
router.delete('/complaints/:id', adminController.deleteComplaint);
router.post('/complaints/:id/fine', fineValidation, validate, adminController.issueFine);

// Fine routes
router.get('/fines', paginationValidation, validate, adminController.getAllFines);

// Statistics
router.get('/statistics', adminController.getStatistics);

module.exports = router;
