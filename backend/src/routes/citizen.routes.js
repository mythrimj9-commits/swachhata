const express = require('express');
const router = express.Router();
const citizenController = require('../controllers/citizen.controller');
const { auth, optionalAuth } = require('../middleware/auth');
const { isCitizen } = require('../middleware/roleCheck');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const { validate } = require('../middleware/validator');
const { complaintValidation, paginationValidation } = require('../utils/validators');

// Complaint routes
router.post(
    '/complaints',
    auth,
    uploadSingle,
    handleUploadError,
    complaintValidation,
    validate,
    citizenController.createComplaint
);

router.get(
    '/complaints',
    auth,
    paginationValidation,
    validate,
    citizenController.getMyComplaints
);

router.get(
    '/complaints/:id',
    auth,
    citizenController.getComplaintById
);

// Fine routes
router.get(
    '/fines',
    auth,
    paginationValidation,
    validate,
    citizenController.getMyFines
);

router.post(
    '/fines/:id/pay',
    auth,
    citizenController.payFine
);

router.get(
    '/payment-history',
    auth,
    citizenController.getPaymentHistory
);

module.exports = router;
