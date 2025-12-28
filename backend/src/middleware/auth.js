const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');
const { ERROR_MESSAGES } = require('../utils/constants');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Authorization denied.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = verifyAccessToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or expired'
            });
        }

        // Get user from database
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.USER_NOT_FOUND
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact admin.'
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

/**
 * Optional authentication middleware
 * Attaches user if token provided, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token, continue without user
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);

        if (decoded) {
            const user = await User.findById(decoded.userId);
            if (user && user.isActive) {
                req.user = user;
                req.userId = user._id;
                req.userRole = user.role;
            }
        }

        next();
    } catch (error) {
        // Continue without user if any error
        next();
    }
};

module.exports = { auth, optionalAuth };
