import api from './api'

export const complaintService = {
    // Citizen endpoints
    create: async (formData) => {
        const response = await api.post('/citizen/complaints', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data
    },

    getMyComplaints: async (params = {}) => {
        const response = await api.get('/citizen/complaints', { params })
        return response.data
    },

    getById: async (id) => {
        const response = await api.get(`/citizen/complaints/${id}`)
        return response.data
    },

    // Admin endpoints
    getAll: async (params = {}) => {
        const response = await api.get('/admin/complaints', { params })
        return response.data
    },

    getDetails: async (id) => {
        const response = await api.get(`/admin/complaints/${id}`)
        return response.data
    },

    verify: async (id, data) => {
        const response = await api.put(`/admin/complaints/${id}/verify`, data)
        return response.data
    },

    updateStatus: async (id, data) => {
        const response = await api.put(`/admin/complaints/${id}/status`, data)
        return response.data
    },

    delete: async (id) => {
        const response = await api.delete(`/admin/complaints/${id}`)
        return response.data
    },

    issueFine: async (id, data) => {
        const response = await api.post(`/admin/complaints/${id}/fine`, data)
        return response.data
    },

    // Public endpoints
    submitAnonymous: async (formData) => {
        const response = await api.post('/public/anonymous-complaint', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data
    },

    track: async (id) => {
        const response = await api.get(`/public/track/${id}`)
        return response.data
    }
}

export const fineService = {
    getMyFines: async (params = {}) => {
        const response = await api.get('/citizen/fines', { params })
        return response.data
    },

    pay: async (id, paymentMethod = 'mock') => {
        const response = await api.post(`/citizen/fines/${id}/pay`, { paymentMethod })
        return response.data
    },

    getPaymentHistory: async () => {
        const response = await api.get('/citizen/payment-history')
        return response.data
    },

    // Admin
    getAll: async (params = {}) => {
        const response = await api.get('/admin/fines', { params })
        return response.data
    }
}

export const adminService = {
    getStatistics: async () => {
        const response = await api.get('/admin/statistics')
        return response.data
    }
}

export const superadminService = {
    createAdmin: async (data) => {
        const response = await api.post('/superadmin/admins', data)
        return response.data
    },

    getAdmins: async (params = {}) => {
        const response = await api.get('/superadmin/admins', { params })
        return response.data
    },

    updateAdmin: async (id, data) => {
        const response = await api.put(`/superadmin/admins/${id}`, data)
        return response.data
    },

    deleteAdmin: async (id) => {
        const response = await api.delete(`/superadmin/admins/${id}`)
        return response.data
    },

    resendOTP: async (id) => {
        const response = await api.post(`/superadmin/admins/${id}/resend-otp`)
        return response.data
    },

    getStatistics: async () => {
        const response = await api.get('/superadmin/statistics')
        return response.data
    }
}

export const publicService = {
    getStatistics: async () => {
        const response = await api.get('/public/statistics')
        return response.data
    }
}
