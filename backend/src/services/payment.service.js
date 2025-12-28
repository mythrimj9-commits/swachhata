const { Fine } = require('../models');

/**
 * Mock payment processing
 * Simulates payment flow without actual transaction
 */

/**
 * Generate payment reference number
 */
const generatePaymentReference = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `SWC-${timestamp}-${random}`.toUpperCase();
};

/**
 * Process mock payment
 * @param {string} fineId - Fine ID to process payment for
 * @param {string} paymentMethod - Payment method (upi, card, netbanking, mock)
 */
const processPayment = async (fineId, paymentMethod = 'mock') => {
    try {
        const fine = await Fine.findById(fineId).populate('complaintId');

        if (!fine) {
            return {
                success: false,
                message: 'Fine not found'
            };
        }

        if (fine.paymentStatus === 'paid') {
            return {
                success: false,
                message: 'Fine already paid',
                paymentReference: fine.paymentReference
            };
        }

        // Simulate payment processing delay (optional)
        // await new Promise(resolve => setTimeout(resolve, 1000));

        // Mark as paid
        fine.paymentStatus = 'paid';
        fine.paidAt = new Date();
        fine.paymentMethod = paymentMethod;
        fine.paymentReference = generatePaymentReference();

        await fine.save();

        // Update complaint status to closed
        if (fine.complaintId) {
            const { Complaint } = require('../models');
            await Complaint.findByIdAndUpdate(fine.complaintId._id || fine.complaintId, {
                status: 'closed',
                $push: {
                    statusHistory: {
                        status: 'closed',
                        changedAt: new Date(),
                        remarks: 'Fine paid - Case closed'
                    }
                }
            });
        }

        return {
            success: true,
            message: 'Payment successful',
            paymentReference: fine.paymentReference,
            paidAt: fine.paidAt,
            amount: fine.amount
        };

    } catch (error) {
        console.error('Payment processing error:', error);
        return {
            success: false,
            message: error.message
        };
    }
};

/**
 * Get payment status
 */
const getPaymentStatus = async (fineId) => {
    try {
        const fine = await Fine.findById(fineId).select('paymentStatus paymentReference paidAt amount');

        if (!fine) {
            return { success: false, message: 'Fine not found' };
        }

        return {
            success: true,
            paymentStatus: fine.paymentStatus,
            paymentReference: fine.paymentReference,
            paidAt: fine.paidAt,
            amount: fine.amount
        };

    } catch (error) {
        return { success: false, message: error.message };
    }
};

/**
 * Calculate fine amount based on offence severity (optional enhancement)
 */
const calculateFineAmount = (offenceType = 'dumping', repeat = false) => {
    const baseFines = {
        dumping: 500,
        littering: 200,
        burning: 1000,
        industrial: 5000
    };

    let amount = baseFines[offenceType] || 500;

    // Double for repeat offenders
    if (repeat) {
        amount *= 2;
    }

    // Ensure within limits
    return Math.min(Math.max(amount, 100), 50000);
};

/**
 * Get payment statistics
 */
const getPaymentStatistics = async () => {
    try {
        const stats = await Fine.aggregate([
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
                    },
                    unpaidCount: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0] }
                    },
                    unpaidAmount: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, '$amount', 0] }
                    }
                }
            }
        ]);

        return stats[0] || {
            totalFines: 0,
            totalAmount: 0,
            paidCount: 0,
            paidAmount: 0,
            unpaidCount: 0,
            unpaidAmount: 0
        };

    } catch (error) {
        console.error('Statistics error:', error);
        return null;
    }
};

module.exports = {
    generatePaymentReference,
    processPayment,
    getPaymentStatus,
    calculateFineAmount,
    getPaymentStatistics
};
