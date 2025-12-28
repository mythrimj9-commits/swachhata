// API URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// App name
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Swachhata 2.0'

// User roles
export const ROLES = {
    CITIZEN: 'citizen',
    ADMIN: 'admin',
    SUPER_ADMIN: 'superadmin'
}

// Complaint statuses
export const COMPLAINT_STATUS = {
    SUBMITTED: 'submitted',
    VERIFIED: 'verified',
    FINED: 'fined',
    CLOSED: 'closed',
    REJECTED: 'rejected'
}

// Status labels with colors
export const STATUS_CONFIG = {
    submitted: { label: 'Submitted', color: '#F59E0B', bg: '#FEF3C7' },
    verified: { label: 'Verified', color: '#3B82F6', bg: '#DBEAFE' },
    fined: { label: 'Fine Issued', color: '#EF4444', bg: '#FEE2E2' },
    closed: { label: 'Closed', color: '#10B981', bg: '#D1FAE5' },
    rejected: { label: 'Rejected', color: '#6B7280', bg: '#F3F4F6' }
}

// Payment statuses
export const PAYMENT_STATUS = {
    UNPAID: 'unpaid',
    PAID: 'paid'
}

// Navigation items by role
export const NAV_ITEMS = {
    citizen: [
        { label: 'Dashboard', path: '/citizen', icon: 'dashboard' },
        { label: 'New Complaint', path: '/citizen/new-complaint', icon: 'add' },
        { label: 'My Complaints', path: '/citizen/complaints', icon: 'list' },
        { label: 'My Fines', path: '/citizen/fines', icon: 'money' }
    ],
    admin: [
        { label: 'Dashboard', path: '/admin', icon: 'dashboard' },
        { label: 'All Complaints', path: '/admin/complaints', icon: 'list' },
        { label: 'All Fines', path: '/admin/fines', icon: 'money' }
    ],
    superadmin: [
        { label: 'Dashboard', path: '/superadmin', icon: 'dashboard' },
        { label: 'Manage Admins', path: '/superadmin/admins', icon: 'users' }
    ]
}
