const { Complaint, Fine } = require('../models');
const cloudinaryService = require('../services/cloudinary.service');
const ocrService = require('../services/ocr.service');
const paymentService = require('../services/payment.service');
const { COMPLAINT_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, PAGINATION } = require('../utils/constants');

/**
 * Create a new complaint
 * POST /api/citizen/complaints
 */
const createComplaint = async (req, res) => {
    try {
        const { latitude, longitude, address, description, isAnonymous } = req.body;

        // Check if image is provided
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Image is required'
            });
        }

        // Upload image to Cloudinary
        console.log('📤 Uploading image to Cloudinary...');
        const uploadResult = await cloudinaryService.uploadImage(req.file);
        console.log('✅ Image uploaded:', uploadResult.url);

        // Extract vehicle number using OCR
        console.log('🔍 Extracting vehicle number...');
        const ocrResult = await ocrService.extractVehicleNumber(uploadResult.url);
        console.log('✅ OCR result:', ocrResult);

        // Create complaint
        const complaint = new Complaint({
            userId: isAnonymous ? null : req.userId,
            isAnonymous: isAnonymous || !req.userId,
            imageUrl: uploadResult.url,
            imagePublicId: uploadResult.publicId,
            description,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            address,
            extractedVehicleNo: ocrResult.vehicleNo,
            aiConfidence: ocrResult.confidence,
            ocrRawText: ocrResult.rawText,
            status: COMPLAINT_STATUS.SUBMITTED,
            statusHistory: [{
                status: COMPLAINT_STATUS.SUBMITTED,
                changedAt: new Date(),
                remarks: 'Complaint submitted'
            }]
        });

        await complaint.save();

        res.status(201).json({
            success: true,
            message: SUCCESS_MESSAGES.COMPLAINT_CREATED,
            data: {
                complaint,
                ocrResult: {
                    vehicleNo: ocrResult.vehicleNo,
                    confidence: ocrResult.confidence
                }
            }
        });

    } catch (error) {
        console.error('Create complaint error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get user's complaints
 * GET /api/citizen/complaints
 */
const getMyComplaints = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { userId: req.userId };
        if (status) {
            query.status = status;
        }

        const [complaints, total] = await Promise.all([
            Complaint.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
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
        console.error('Get complaints error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get single complaint details
 * GET /api/citizen/complaints/:id
 */
const getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findOne({
            _id: req.params.id,
            userId: req.userId
        }).populate('fineId').populate('verifiedBy', 'name email');

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
        console.error('Get complaint error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get user's fines
 * GET /api/citizen/fines
 */
const getMyFines = async (req, res) => {
    try {
        const { page = 1, limit = 10, paymentStatus } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get user's complaints first
        const userComplaints = await Complaint.find({ userId: req.userId }).select('_id');
        const complaintIds = userComplaints.map(c => c._id);

        const query = { complaintId: { $in: complaintIds } };
        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        const [fines, total] = await Promise.all([
            Fine.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('complaintId', 'imageUrl address status')
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
        console.error('Get fines error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Pay fine (mock payment)
 * POST /api/citizen/fines/:id/pay
 */
const payFine = async (req, res) => {
    try {
        const { paymentMethod = 'mock' } = req.body;

        const fine = await Fine.findById(req.params.id).populate('complaintId');

        if (!fine) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.FINE_NOT_FOUND
            });
        }

        // Verify fine belongs to user's complaint
        if (fine.complaintId.userId &&
            fine.complaintId.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED
            });
        }

        // Process payment
        const result = await paymentService.processPayment(fine._id, paymentMethod);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(200).json({
            success: true,
            message: SUCCESS_MESSAGES.PAYMENT_SUCCESS,
            data: result
        });

    } catch (error) {
        console.error('Pay fine error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get payment history
 * GET /api/citizen/payment-history
 */
const getPaymentHistory = async (req, res) => {
    try {
        // Get user's complaints
        const userComplaints = await Complaint.find({ userId: req.userId }).select('_id');
        const complaintIds = userComplaints.map(c => c._id);

        // Get paid fines
        const paidFines = await Fine.find({
            complaintId: { $in: complaintIds },
            paymentStatus: 'paid'
        })
            .sort({ paidAt: -1 })
            .populate('complaintId', 'imageUrl address');

        // Calculate totals
        const totalPaid = paidFines.reduce((sum, fine) => sum + fine.amount, 0);

        res.status(200).json({
            success: true,
            data: {
                payments: paidFines,
                summary: {
                    totalPayments: paidFines.length,
                    totalAmount: totalPaid
                }
            }
        });

    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createComplaint,
    getMyComplaints,
    getComplaintById,
    getMyFines,
    payFine,
    getPaymentHistory
};
