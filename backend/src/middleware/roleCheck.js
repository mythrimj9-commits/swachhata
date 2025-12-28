const { ROLES, ERROR_MESSAGES } = require('../utils/constants');

/**
 * Role-based access control middleware
 * @param  {...string} allowedRoles - Roles that can access the route
 */
const roleCheck = (...allowedRoles) => {
    return (req, res, next) => {
        // User must be authenticated first
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED
            });
        }

        next();
    };
};

// Predefined role checks
const isCitizen = roleCheck(ROLES.CITIZEN, ROLES.ADMIN, ROLES.SUPER_ADMIN);
const isAdmin = roleCheck(ROLES.ADMIN, ROLES.SUPER_ADMIN);
const isSuperAdmin = roleCheck(ROLES.SUPER_ADMIN);

// Admin only (not superadmin)
const isAdminOnly = roleCheck(ROLES.ADMIN);

// Any authenticated user
const isAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    next();
};

module.exports = {
    roleCheck,
    isCitizen,
    isAdmin,
    isSuperAdmin,
    isAdminOnly,
    isAuthenticated
};
