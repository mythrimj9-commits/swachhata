// Environment configuration validation
const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

const validateEnv = () => {
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(envVar => console.error(`   - ${envVar}`));
        console.error('\nPlease check your .env file');
        process.exit(1);
    }

    console.log('✅ Environment variables validated');
};

const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '15m',
    jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    superAdmin: {
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@swachhata.gov.in',
        password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123'
    }
};

module.exports = { validateEnv, config };
