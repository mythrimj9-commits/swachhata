const { Complaint, Fine, User } = require('../models');
const cloudinaryService = require('../services/cloudinary.service');
const { sendFineNotificationEmail } = require('../services/email.service');
const { COMPLAINT_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, PAGINATION, ROLES } = require('../utils/constants');

/**
 * Get all complaints
 * GET /api/admin/complaints
 */
const getAllComplaints = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (status) {
            query.status = status;
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [complaints, total] = await Promise.all([
            Complaint.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('userId', 'name email phone')
                .populate('verifiedBy', 'name')
                .populate('fineId'),
            Complaint.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: {
                complaints,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get all complaints error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get complaint details
 * GET /api/admin/complaints/:id
 */
const getComplaintDetails = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('userId', 'name email phone')
            .populate('verifiedBy', 'name email')
            .populate('fineId');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.COMPLAINT_NOT_FOUND
            });
        }

        res.status(200).json({
            success: true,
            data: { complaint }
        });

    } catch (error) {
        console.error('Get complaint details error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Verify/update vehicle number
 * PUT /api/admin/complaints/:id/verify
 */
const verifyVehicleNumber = async (req, res) => {
    try {
        const { vehicleNo, remarks } = req.body;

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.COMPLAINT_NOT_FOUND
            });
        }

        if (complaint.status !== COMPLAINT_STATUS.SUBMITTED) {
            return res.status(400).json({
                success: false,
                message: 'Complaint is not in submitted status'
            });
        }

        // Update complaint
        complaint.verifiedVehicleNo = vehicleNo.toUpperCase().replace(/\s/g, '');
        complaint.status = COMPLAINT_STATUS.VERIFIED;
        complaint.verifiedBy = req.userId;
        complaint.verifiedAt = new Date();
        complaint.statusHistory.push({
            status: COMPLAINT_STATUS.VERIFIED,
            changedBy: req.userId,
            changedAt: new Date(),
            remarks: remarks || 'Vehicle number verified'
        });

        await complaint.save();

        res.status(200).json({
            success: true,
            message: 'Vehicle number verified successfully',
            data: { complaint }
        });

    } catch (error) {
        console.error('Verify vehicle number error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update complaint status
 * PUT /api/admin/complaints/:id/status
 */
const updateComplaintStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;

        const validStatuses = Object.values(COMPLAINT_STATUS);
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.COMPLAINT_NOT_FOUND
            });
        }

        complaint.status = status;
        if (status === COMPLAINT_STATUS.REJECTED) {
            complaint.rejectionReason = remarks;
        }
        complaint.statusHistory.push({
            status,
            changedBy: req.userId,
            changedAt: new Date(),
            remarks
        });

        await complaint.save();

        res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            data: { complaint }
        });

    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Delete complaint (fake/invalid)
 * DELETE /api/admin/complaints/:id
 */
const deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.COMPLAINT_NOT_FOUND
            });
        }

        // Delete image from Cloudinary
        if (complaint.imagePublicId) {
            await cloudinaryService.deleteImage(complaint.imagePublicId);
        }

        // Delete associated fine if exists
        if (complaint.fineId) {
            await Fine.findByIdAndDelete(complaint.fineId);
        }

        await Complaint.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Complaint deleted successfully'
        });

    } catch (error) {
        console.error('Delete complaint error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Issue fine
 * POST /api/admin/complaints/:id/fine
 */
const issueFine = async (req, res) => {
    try {
        const { amount, vehicleNo, remarks } = req.body;

        const complaint = await Complaint.findById(req.params.id).populate('userId');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.COMPLAINT_NOT_FOUND
            });
        }

        if (complaint.status !== COMPLAINT_STATUS.VERIFIED) {
            return res.status(400).json({
                success: false,
                message: 'Complaint must be verified before issuing fine'
            });
        }

        // Check if fine already exists
        if (complaint.fineId) {
            return res.status(400).json({
                success: false,
                message: 'Fine already issued for this complaint'
            });
        }

        // Create fine
        const fine = new Fine({
            complaintId: complaint._id,
            vehicleNo: vehicleNo || complaint.verifiedVehicleNo,
            amount: parseFloat(amount),
            remarks,
            issuedBy: req.userId,
            issuedAt: new Date()
        });

        await fine.save();

        // Update complaint
        complaint.fineId = fine._id;
        complaint.status = COMPLAINT_STATUS.FINED;
        complaint.statusHistory.push({
            status: COMPLAINT_STATUS.FINED,
            changedBy: req.userId,
            changedAt: new Date(),
            remarks: `Fine of ₹${amount} issued`
        });

        await complaint.save();

        // Send email notification if user exists
        if (complaint.userId && complaint.userId.email) {
            await sendFineNotificationEmail(complaint.userId.email, {
                vehicleNo: fine.vehicleNo,
                amount: fine.amount,
                complaintId: complaint._id.toString(),
                remarks
            });
        }

        res.status(201).json({
            success: true,
            message: SUCCESS_MESSAGES.FINE_ISSUED,
            data: { fine, complaint }
        });

    } catch (error) {
        console.error('Issue fine error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get all fines
 * GET /api/admin/fines
 */
const getAllFines = async (req, res) => {
    try {
        const { page = 1, limit = 10, paymentStatus } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        const [fines, total] = await Promise.all([
            Fine.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('complaintId', 'imageUrl address userId')
                .populate('issuedBy', 'name'),
            Fine.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: {
                fines,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get all fines error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get admin dashboard statistics
 * GET /api/admin/statistics
 */
const getStatistics = async (req, res) => {
    try {
        const [
            complaintStats,
            fineStats,
            recentComplaints
        ] = await Promise.all([
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
                        _id: '$paymentStatus',
                        count: { $sum: 1 },
                        total: { $sum: '$amount' }
                    }
                }
            ]),

            // Recent complaints
            Complaint.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('userId', 'name email')
        ]);

        // Format statistics
        const stats = {
            complaints: {
                total: 0,
                byStatus: {}
            },
            fines: {
                total: 0,
                collected: 0,
                pending: 0,
                totalAmount: 0,
                collectedAmount: 0,
                pendingAmount: 0
            },
            recentComplaints
        };

        complaintStats.forEach(s => {
            stats.complaints.byStatus[s._id] = s.count;
            stats.complaints.total += s.count;
        });

        fineStats.forEach(s => {
            stats.fines.total += s.count;
            stats.fines.totalAmount += s.total;
            if (s._id === 'paid') {
                stats.fines.collected = s.count;
                stats.fines.collectedAmount = s.total;
            } else {
                stats.fines.pending = s.count;
                stats.fines.pendingAmount = s.total;
            }
        });

        res.status(200).json({
            success: true,
            data: { statistics: stats }
        });

    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllComplaints,
    getComplaintDetails,
    verifyVehicleNumber,
    updateComplaintStatus,
    deleteComplaint,
    issueFine,
    getAllFines,
    getStatistics
};
