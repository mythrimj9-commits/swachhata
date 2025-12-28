require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { createSuperAdmin } = require('./src/utils/seedAdmin');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(() => {
    console.log('✅ MongoDB Connected');

    // Create super admin if not exists
    createSuperAdmin().catch(err => console.error('Super admin seed error:', err));
}).catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
});

// Start server only in non-Vercel environment
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    });
}

// Export for Vercel serverless
module.exports = app;
