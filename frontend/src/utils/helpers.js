// Format date
export const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

// Format date with time
export const formatDateTime = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Format currency (INR)
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '-'
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

// Truncate text
export const truncateText = (text, length = 50) => {
    if (!text) return ''
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
}

// Get initials from name
export const getInitials = (name) => {
    if (!name) return '?'
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
}

// Validate email
export const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

// Validate phone (10 digits)
export const isValidPhone = (phone) => {
    const re = /^[0-9]{10}$/
    return re.test(phone)
}

// Get role display name
export const getRoleDisplayName = (role) => {
    switch (role) {
        case 'citizen': return 'Citizen'
        case 'admin': return 'Admin'
        case 'superadmin': return 'Super Admin'
        default: return role
    }
}

// Get status badge class
export const getStatusClass = (status) => {
    switch (status) {
        case 'submitted': return 'badge-warning'
        case 'verified': return 'badge-info'
        case 'fined': return 'badge-danger'
        case 'closed': return 'badge-success'
        case 'rejected': return 'badge-secondary'
        default: return 'badge-default'
    }
}
