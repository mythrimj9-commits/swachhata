const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
    complaintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
        required: true,
        unique: true
    },
    vehicleNo: {
        type: String,
        required: [true, 'Vehicle number is required'],
        trim: true,
        uppercase: true
    },

    // Fine Details
    amount: {
        type: Number,
        required: [true, 'Fine amount is required'],
        min: [100, 'Minimum fine amount is ₹100'],
        max: [50000, 'Maximum fine amount is ₹50,000']
    },
    remarks: {
        type: String,
        trim: true,
        maxlength: [500, 'Remarks cannot exceed 500 characters']
    },
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },

    // Payment Status
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid'],
        default: 'unpaid'
    },
    paidAt: Date,
    paymentReference: String,

    // Payment details (for mock)
    paymentMethod: {
        type: String,
        enum: ['upi', 'card', 'netbanking', 'mock'],
        default: 'mock'
    }
}, {
    timestamps: true
});

// Index for queries
fineSchema.index({ vehicleNo: 1 });
fineSchema.index({ paymentStatus: 1 });
fineSchema.index({ issuedAt: -1 });

// Virtual for complaint details
fineSchema.virtual('complaint', {
    ref: 'Complaint',
    localField: 'complaintId',
    foreignField: '_id',
    justOne: true
});

// Generate payment reference
fineSchema.methods.generatePaymentReference = function () {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `SWC-${timestamp}-${random}`.toUpperCase();
};

// Mark as paid
fineSchema.methods.markAsPaid = async function (paymentMethod = 'mock') {
    this.paymentStatus = 'paid';
    this.paidAt = new Date();
    this.paymentMethod = paymentMethod;
    this.paymentReference = this.generatePaymentReference();
    await this.save();
    return this;
};

// Enable virtuals in JSON
fineSchema.set('toJSON', { virtuals: true });
fineSchema.set('toObject', { virtuals: true });

const Fine = mongoose.model('Fine', fineSchema);

module.exports = Fine;
