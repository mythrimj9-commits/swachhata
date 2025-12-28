const { User, Complaint, Fine } = require('../models');
const { generateOTPWithExpiry } = require('../utils/otp');
const { sendAdminCreationEmail } = require('../services/email.service');
const { ROLES, ERROR_MESSAGES } = require('../utils/constants');

/**
 * Whitelist admin email
 * POST /api/superadmin/admins
 */
const createAdmin = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered or whitelisted'
            });
        }

        // Create admin placeholder (whitelisted email only)
        const admin = new User({
            email,
            password: 'TEMP_' + Math.random().toString(36).slice(2) + Date.now(), // Temp password, will be set by admin
            role: ROLES.ADMIN,
            isVerified: false,
            isActive: true,
            createdBy: req.userId
        });

        await admin.save();

        res.status(201).json({
            success: true,
            message: 'Admin email whitelisted successfully. Admin can now register using this email.',
            data: {
                admin: {
                    _id: admin._id,
                    email: admin.email,
                    role: admin.role,
                    isVerified: admin.isVerified,
                    createdAt: admin.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/**
 * Get all admins
 * GET /api/superadmin/admins
 */
const getAllAdmins = async (req, res) => {
    try {
        const { page = 1, limit = 10, isVerified } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { role: ROLES.ADMIN };
        if (isVerified !== undefined) {
            query.isVerified = isVerified === 'true';
        }

        const [admins, total] = await Promise.all([
            User.find(query)
                .select('-password -refreshToken')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('createdBy', 'name email'),
            User.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: {
                admins,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update admin
 * PUT /api/superadmin/admins/:id
 */
const updateAdmin = async (req, res) => {
    try {
        const { name, phone, isActive } = req.body;

        const admin = await User.findOne({
            _id: req.params.id,
            role: ROLES.ADMIN
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        if (name !== undefined) admin.name = name;
        if (phone !== undefined) admin.phone = phone;
        if (isActive !== undefined) admin.isActive = isActive;

        await admin.save();

        res.status(200).json({
            success: true,
            message: 'Admin updated successfully',
            data: { admin: admin.toJSON() }
        });

    } catch (error) {
        console.error('Update admin error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Delete admin
 * DELETE /api/superadmin/admins/:id
 */
const deleteAdmin = async (req, res) => {
    try {
        const admin = await User.findOne({
            _id: req.params.id,
            role: ROLES.ADMIN
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Admin deleted successfully'
        });

    } catch (error) {
        console.error('Delete admin error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Resend OTP to admin
 * POST /api/superadmin/admins/:id/resend-otp
 */
const resendAdminOTP = async (req, res) => {
    try {
        const admin = await User.findOne({
            _id: req.params.id,
            role: ROLES.ADMIN
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        if (admin.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Admin is already verified'
            });
        }

        // Generate new OTP
        const { otp, expiry } = generateOTPWithExpiry(10);
        admin.otp = otp;
        admin.otpExpiry = expiry;
        await admin.save();

        // Send OTP email
        await sendAdminCreationEmail(admin.email, otp, admin.name);

        res.status(200).json({
            success: true,
            message: 'OTP sent to admin email'
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
 * Get system-wide statistics
 * GET /api/superadmin/statistics
 */
const getSystemStatistics = async (req, res) => {
    try {
        const [
            userStats,
            complaintStats,
            fineStats,
            monthlyComplaints
        ] = await Promise.all([
            // User statistics by role
            User.aggregate([
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 },
                        verified: {
                            $sum: { $cond: ['$isVerified', 1, 0] }
                        },
                        active: {
                            $sum: { $cond: ['$isActive', 1, 0] }
                        }
                    }
                }
            ]),

            // Complaint statistics
            Complaint.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // Fine statistics
            Fine.aggregate([
                {
                    $group: {
                        _id: null,
                        totalFines: { $sum: 1 },
                        totalAmount: { $sum: '$amount' },
                        paidCount: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
                        },
                        paidAmount: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$amount', 0] }
                        }
                    }
                }
            ]),

            // Monthly complaints (last 6 months)
            Complaint.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])
        ]);

        // Format statistics
        const stats = {
            users: {
                total: 0,
                byRole: {}
            },
            complaints: {
                total: 0,
                byStatus: {}
            },
            fines: fineStats[0] || {
                totalFines: 0,
                totalAmount: 0,
                paidCount: 0,
                paidAmount: 0
            },
            monthlyTrend: monthlyComplaints
        };

        userStats.forEach(s => {
            stats.users.byRole[s._id] = {
                count: s.count,
                verified: s.verified,
                active: s.active
            };
            stats.users.total += s.count;
        });

        complaintStats.forEach(s => {
            stats.complaints.byStatus[s._id] = s.count;
            stats.complaints.total += s.count;
        });

        res.status(200).json({
            success: true,
            data: { statistics: stats }
        });

    } catch (error) {
        console.error('Get system statistics error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createAdmin,
    getAllAdmins,
    updateAdmin,
    deleteAdmin,
    resendAdminOTP,
    getSystemStatistics
};
