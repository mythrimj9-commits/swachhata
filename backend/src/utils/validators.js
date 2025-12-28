const { body, param, query } = require('express-validator');

// Common validation rules
const emailRule = body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email');

const passwordRule = body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number');

const strongPasswordRule = body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&#]/)
    .withMessage('Password must contain at least one special character');

const mongoIdRule = (fieldName) => param(fieldName)
    .isMongoId()
    .withMessage(`Invalid ${fieldName}`);

// Auth validations
const registerValidation = [
    emailRule,
    passwordRule,
    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Name cannot exceed 100 characters'),
    body('phone')
        .optional()
        .matches(/^[0-9]{10}$/)
        .withMessage('Please provide a valid 10-digit phone number')
];

const loginValidation = [
    emailRule,
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Complaint validations
const complaintValidation = [
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Invalid latitude'),
    body('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Invalid longitude'),
    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Address cannot exceed 500 characters')
];

// Fine validations
const fineValidation = [
    body('amount')
        .isFloat({ min: 100, max: 50000 })
        .withMessage('Fine amount must be between ₹100 and ₹50,000'),
    body('vehicleNo')
        .notEmpty()
        .trim()
        .toUpperCase()
        .withMessage('Vehicle number is required'),
    body('remarks')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Remarks cannot exceed 500 characters')
];

// Admin whitelist validation (only email required)
const createAdminValidation = [
    emailRule
];

// OTP validation
const otpValidation = [
    body('otp')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('OTP must be 6 digits')
];

// Pagination validation
const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];

module.exports = {
    registerValidation,
    loginValidation,
    complaintValidation,
    fineValidation,
    createAdminValidation,
    otpValidation,
    paginationValidation,
    mongoIdRule
};
