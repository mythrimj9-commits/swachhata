const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const citizenRoutes = require('./citizen.routes');
const adminRoutes = require('./admin.routes');
const superadminRoutes = require('./superadmin.routes');
const publicRoutes = require('./public.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/citizen', citizenRoutes);
router.use('/admin', adminRoutes);
router.use('/superadmin', superadminRoutes);
router.use('/public', publicRoutes);

module.exports = router;
