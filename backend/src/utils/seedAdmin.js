const { User } = require('../models');
const { ROLES } = require('./constants');

/**
 * Create super admin on first run if not exists
 */
const createSuperAdmin = async () => {
    try {
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@swachhata.gov.in';
        const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';

        // Check if super admin exists
        const existingSuperAdmin = await User.findOne({ role: ROLES.SUPER_ADMIN });

        if (existingSuperAdmin) {
            console.log('✅ Super Admin already exists:', existingSuperAdmin.email);
            return existingSuperAdmin;
        }

        // Create super admin
        const superAdmin = new User({
            email: superAdminEmail,
            password: superAdminPassword,
            name: 'Super Admin',
            role: ROLES.SUPER_ADMIN,
            isVerified: true,
            isActive: true
        });

        await superAdmin.save();

        console.log('✅ Super Admin created:');
        console.log(`   Email: ${superAdminEmail}`);
        console.log(`   Password: ${superAdminPassword}`);
        console.log('   ⚠️  Please change the password after first login!');

        return superAdmin;

    } catch (error) {
        console.error('❌ Error creating super admin:', error.message);
        throw error;
    }
};

module.exports = { createSuperAdmin };
