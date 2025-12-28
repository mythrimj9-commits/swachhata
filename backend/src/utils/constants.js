// User roles
const ROLES = {
    CITIZEN: 'citizen',
    ADMIN: 'admin',
    SUPER_ADMIN: 'superadmin'
};

// Complaint statuses
const COMPLAINT_STATUS = {
    SUBMITTED: 'submitted',
    VERIFIED: 'verified',
    FINED: 'fined',
    CLOSED: 'closed',
    REJECTED: 'rejected'
};

// Payment statuses
const PAYMENT_STATUS = {
    UNPAID: 'unpaid',
    PAID: 'paid'
};

// Fine amount limits
const FINE_LIMITS = {
    MIN: 100,
    MAX: 50000,
    DEFAULT: 500
};

// Pagination defaults
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
};

// Indian vehicle plate pattern
// Matches: MH01AB1234, KA 05 MN 1234, DL 1C AB 1234
const VEHICLE_PLATE_REGEX = /[A-Z]{2}\s*\d{1,2}\s*[A-Z]{1,3}\s*\d{1,4}/gi;

// OTP settings
const OTP_SETTINGS = {
    LENGTH: 6,
    EXPIRY_MINUTES: 10
};

// Cloudinary folders
const CLOUDINARY_FOLDERS = {
    COMPLAINTS: 'swachhata/complaints',
    PROFILES: 'swachhata/profiles'
};

// Error messages
const ERROR_MESSAGES = {
    UNAUTHORIZED: 'You are not authorized to access this resource',
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    COMPLAINT_NOT_FOUND: 'Complaint not found',
    FINE_NOT_FOUND: 'Fine not found',
    ALREADY_EXISTS: 'Resource already exists',
    INVALID_OTP: 'Invalid or expired OTP',
    SERVER_ERROR: 'Internal server error'
};

// Success messages
const SUCCESS_MESSAGES = {
    REGISTERED: 'Registration successful',
    LOGGED_IN: 'Login successful',
    LOGGED_OUT: 'Logout successful',
    OTP_SENT: 'OTP sent successfully',
    OTP_VERIFIED: 'OTP verified successfully',
    COMPLAINT_CREATED: 'Complaint submitted successfully',
    FINE_ISSUED: 'Fine issued successfully',
    PAYMENT_SUCCESS: 'Payment successful'
};

module.exports = {
    ROLES,
    COMPLAINT_STATUS,
    PAYMENT_STATUS,
    FINE_LIMITS,
    PAGINATION,
    VEHICLE_PLATE_REGEX,
    OTP_SETTINGS,
    CLOUDINARY_FOLDERS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
};
