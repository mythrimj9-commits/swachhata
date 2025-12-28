const { Complaint, Fine } = require('../models');
const cloudinaryService = require('../services/cloudinary.service');
const ocrService = require('../services/ocr.service');
const { COMPLAINT_STATUS, SUCCESS_MESSAGES } = require('../utils/constants');

/**
 * Submit anonymous complaint
 * POST /api/public/anonymous-complaint
 */
const submitAnonymousComplaint = async (req, res) => {
    try {
        const { latitude, longitude, address, description } = req.body;

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

        // Create anonymous complaint
        const complaint = new Complaint({
            userId: null,
            isAnonymous: true,
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
                remarks: 'Anonymous complaint submitted'
            }]
        });

        await complaint.save();

        res.status(201).json({
            success: true,
            message: SUCCESS_MESSAGES.COMPLAINT_CREATED,
            data: {
                complaintId: complaint._id,
                status: complaint.status,
                vehicleDetected: ocrResult.vehicleNo,
                confidence: ocrResult.confidence
            }
        });

    } catch (error) {
        console.error('Anonymous complaint error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get public statistics
 * GET /api/public/statistics
 */
const getPublicStatistics = async (req, res) => {
    try {
        const [complaintStats, fineStats] = await Promise.all([
            Complaint.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        resolved: {
                            $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
                        },
                        pending: {
                            $sum: { $cond: [{ $in: ['$status', ['submitted', 'verified', 'fined']] }, 1, 0] }
                        }
                    }
                }
            ]),

            Fine.aggregate([
                {
                    $group: {
                        _id: null,
                        totalFines: { $sum: 1 },
                        totalCollected: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$amount', 0] }
                        }
                    }
                }
            ])
        ]);

        const stats = {
            complaints: complaintStats[0] || { total: 0, resolved: 0, pending: 0 },
            fines: fineStats[0] || { totalFines: 0, totalCollected: 0 }
        };

        res.status(200).json({
            success: true,
            data: { statistics: stats }
        });

    } catch (error) {
        console.error('Get public statistics error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Track complaint status (by ID)
 * GET /api/public/track/:id
 */
const trackComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .select('status statusHistory createdAt imageUrl address extractedVehicleNo');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                complaint: {
                    _id: complaint._id,
                    status: complaint.status,
                    createdAt: complaint.createdAt,
                    address: complaint.address,
                    statusTimeline: complaint.statusHistory.map(h => ({
                        status: h.status,
                        date: h.changedAt,
                        remarks: h.remarks
                    }))
                }
            }
        });

    } catch (error) {
        console.error('Track complaint error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    submitAnonymousComplaint,
    getPublicStatistics,
    trackComplaint
};
