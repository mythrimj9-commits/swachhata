/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate OTP with expiry time
 * @param {number} expiryMinutes - OTP validity in minutes (default: 10)
 */
const generateOTPWithExpiry = (expiryMinutes = 10) => {
    const otp = generateOTP();
    const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000);

    return { otp, expiry };
};

/**
 * Verify OTP against stored values
 */
const verifyOTP = (inputOtp, storedOtp, expiry) => {
    if (!storedOtp || !expiry) {
        return { valid: false, message: 'OTP not found' };
    }

    if (new Date() > new Date(expiry)) {
        return { valid: false, message: 'OTP has expired' };
    }

    if (inputOtp !== storedOtp) {
        return { valid: false, message: 'Invalid OTP' };
    }

    return { valid: true, message: 'OTP verified' };
};

module.exports = {
    generateOTP,
    generateOTPWithExpiry,
    verifyOTP
};
