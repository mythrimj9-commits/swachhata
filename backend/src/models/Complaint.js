const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    // Complainant Details
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null for anonymous complaints
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },

    // Complaint Content
    imageUrl: {
        type: String,
        required: [true, 'Image is required']
    },
    imagePublicId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },

    // Location Data
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: [true, 'Location coordinates are required'],
            validate: {
                validator: function (v) {
                    return v.length === 2 &&
                        v[0] >= -180 && v[0] <= 180 && // longitude
                        v[1] >= -90 && v[1] <= 90;     // latitude
                },
                message: 'Invalid coordinates'
            }
        }
    },
    address: {
        type: String,
        trim: true
    },

    // AI Extraction
    extractedVehicleNo: {
        type: String,
        trim: true,
        uppercase: true
    },
    verifiedVehicleNo: {
        type: String,
        trim: true,
        uppercase: true
    },
    aiConfidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    ocrRawText: {
        type: String
    },

    // Status Management
    status: {
        type: String,
        enum: ['submitted', 'verified', 'fined', 'closed', 'rejected'],
        default: 'submitted'
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ['submitted', 'verified', 'fined', 'closed', 'rejected']
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        remarks: String
    }],

    // Admin Actions
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: Date,
    rejectionReason: String,

    // Fine reference
    fineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fine'
    }
}, {
    timestamps: true
});

// Create 2dsphere index for geospatial queries
complaintSchema.index({ location: '2dsphere' });

// Create indexes for common queries
complaintSchema.index({ status: 1 });
complaintSchema.index({ userId: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ extractedVehicleNo: 1 });

// Add status to history on status change
complaintSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date()
        });
    }
    next();
});

// Virtual for fine details
complaintSchema.virtual('fine', {
    ref: 'Fine',
    localField: 'fineId',
    foreignField: '_id',
    justOne: true
});

// Enable virtuals in JSON
complaintSchema.set('toJSON', { virtuals: true });
complaintSchema.set('toObject', { virtuals: true });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
