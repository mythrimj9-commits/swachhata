const { User } = require('../models');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const { generateOTPWithExpiry, verifyOTP } = require('../utils/otp');
const { sendOTPEmail } = require('../services/email.service');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, ROLES } = require('../utils/constants');

/**
 * Register a new citizen
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create user
        const user = new User({
            email,
            password,
            name,
            phone,
            role: ROLES.CITIZEN,
            isVerified: true // Citizens are auto-verified (no email OTP for simplicity)
        });

        await user.save();

        // Generate tokens
        const tokens = generateTokens(user._id, user.role);

        // Save refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.status(201).json({
            success: true,
            message: SUCCESS_MESSAGES.REGISTERED,
            data: {
                user: user.toJSON(),
                ...tokens
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Register admin with whitelisted email
 * Admin email must be pre-created by superadmin
 * POST /api/auth/admin-register
 */
const adminRegister = async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        // Find whitelisted admin (created by superadmin but not yet registered)
        const existingAdmin = await User.findOne({
            email,
            role: ROLES.ADMIN
        });

        if (!existingAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Email not whitelisted. Please contact Super Admin.'
            });
        }

        // Check if already registered (has password set and verified)
        if (existingAdmin.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Admin already registered. Please login.'
            });
        }

        // Update admin with registration details
        existingAdmin.password = password;
        existingAdmin.name = name || existingAdmin.name;
        existingAdmin.phone = phone || existingAdmin.phone;

        // Generate new OTP for verification
        const { otp, expiry } = generateOTPWithExpiry(10);
        existingAdmin.otp = otp;
        existingAdmin.otpExpiry = expiry;

        await existingAdmin.save();

        // Send OTP email
        await sendOTPEmail(email, otp, name || existingAdmin.name);

        res.status(200).json({
            success: true,
            message: 'Registration successful! OTP sent to your email.',
            data: {
                email: existingAdmin.email,
                requiresOTP: true
            }
        });

    } catch (error) {
        console.error('Admin register error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Login user (all roles)
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user with password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_CREDENTIALS
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_CREDENTIALS
            });
        }

        // Check if active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Check if admin is verified
        if (user.role === ROLES.ADMIN && !user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email first'
            });
        }

        // Generate tokens
        const tokens = generateTokens(user._id, user.role);

        // Save refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.status(200).json({
            success: true,
            message: SUCCESS_MESSAGES.LOGGED_IN,
            data: {
                user: user.toJSON(),
                ...tokens
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Verify OTP (for admin accounts)
 * POST /api/auth/verify-otp
 */
const verifyOTPHandler = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email }).select('+otp +otpExpiry');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.USER_NOT_FOUND
            });
        }

        // Verify OTP
        const result = verifyOTP(otp, user.otp, user.otpExpiry);

        if (!result.valid) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        // Mark as verified
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Generate tokens
        const tokens = generateTokens(user._id, user.role);
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.status(200).json({
            success: true,
            message: SUCCESS_MESSAGES.OTP_VERIFIED,
            data: {
                user: user.toJSON(),
                ...tokens
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Resend OTP
 * POST /api/auth/resend-otp
 */
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.USER_NOT_FOUND
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        // Generate new OTP
        const { otp, expiry } = generateOTPWithExpiry(10);
        user.otp = otp;
        user.otpExpiry = expiry;
        await user.save();

        // Send OTP email
        await sendOTPEmail(email, otp, user.name);

        res.status(200).json({
            success: true,
            message: SUCCESS_MESSAGES.OTP_SENT
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.USER_NOT_FOUND
            });
        }

        res.status(200).json({
            success: true,
            data: { user: user.toJSON() }
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update profile
 * PUT /api/auth/update-profile
 */
const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.USER_NOT_FOUND
            });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: user.toJSON() }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        // Find user
        const user = await User.findById(decoded.userId).select('+refreshToken');

        if (!user || user.refreshToken !== token) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const tokens = generateTokens(user._id, user.role);

        // Update refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.status(200).json({
            success: true,
            data: tokens
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Logout
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (user) {
            user.refreshToken = undefined;
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: SUCCESS_MESSAGES.LOGGED_OUT
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    register,
    adminRegister,
    login,
    verifyOTPHandler,
    resendOTP,
    getMe,
    updateProfile,
    refreshToken,
    logout
};

