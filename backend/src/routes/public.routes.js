const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const { validate } = require('../middleware/validator');
const { complaintValidation } = require('../utils/validators');

// Anonymous complaint
router.post(
    '/anonymous-complaint',
    uploadSingle,
    handleUploadError,
    complaintValidation,
    validate,
    publicController.submitAnonymousComplaint
);

// Public statistics
router.get('/statistics', publicController.getPublicStatistics);

// Track complaint
router.get('/track/:id', publicController.trackComplaint);

module.exports = router;
