import { useState, useEffect } from 'react'
import { superadminService } from '../../services/complaint.service'
import Modal from '../../components/common/Modal'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import {
    FaPlus, FaEdit, FaTrash, FaEnvelope, FaCheck, FaTimes, FaRedo
} from 'react-icons/fa'

const ManageAdminsPage = () => {
    const [admins, setAdmins] = useState([])
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [isLoading, setIsLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingAdmin, setEditingAdmin] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchAdmins()
    }, [pagination.page])

    const fetchAdmins = async () => {
        setIsLoading(true)
        try {
            const response = await superadminService.getAdmins({
                page: pagination.page,
                limit: 10
            })
            setAdmins(response.data.admins)
            setPagination(response.data.pagination)
        } catch (error) {
            console.error('Failed to fetch admins:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingAdmin(null)
        setFormData({ name: '', email: '', phone: '', password: '' })
        setShowModal(true)
    }

    const openEditModal = (admin) => {
        setEditingAdmin(admin)
        setFormData({
            name: admin.name || '',
            email: admin.email,
            phone: admin.phone || '',
            password: ''
        })
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            if (editingAdmin) {
                await superadminService.updateAdmin(editingAdmin._id, {
                    name: formData.name,
                    phone: formData.phone
                })
                toast.success('Admin updated successfully')
            } else {
                await superadminService.createAdmin({ email: formData.email })
                toast.success('Email whitelisted! Admin can now register.')
            }
            setShowModal(false)
            fetchAdmins()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this admin?')) return

        try {
            await superadminService.deleteAdmin(id)
            toast.success('Admin deleted')
            fetchAdmins()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete')
        }
    }

    const handleResendOTP = async (id) => {
        try {
            await superadminService.resendOTP(id)
            toast.success('OTP sent to admin email')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP')
        }
    }

    const handleToggleActive = async (admin) => {
        try {
            await superadminService.updateAdmin(admin._id, {
                isActive: !admin.isActive
            })
            toast.success(`Admin ${admin.isActive ? 'deactivated' : 'activated'}`)
            fetchAdmins()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update')
        }
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Manage Admins</h1>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <FaPlus /> Add Admin
                </button>
            </div>

            {isLoading ? (
                <div className="loading">Loading admins...</div>
            ) : admins.length === 0 ? (
                <div className="empty-state card">
                    <p>No admins found</p>
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        Create First Admin
                    </button>
                </div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Verified</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map(admin => (
                                    <tr key={admin._id}>
                                        <td>{admin.name || '-'}</td>
                                        <td>{admin.email}</td>
                                        <td>{admin.phone || '-'}</td>
                                        <td>
                                            {admin.isVerified ? (
                                                <span className="badge-success"><FaCheck /> Yes</span>
                                            ) : (
                                                <span className="badge-warning"><FaTimes /> No</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${admin.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {admin.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>{formatDate(admin.createdAt)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => openEditModal(admin)}
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                {!admin.isVerified && (
                                                    <button
                                                        className="btn btn-sm btn-outline"
                                                        onClick={() => handleResendOTP(admin._id)}
                                                        title="Resend OTP"
                                                    >
                                                        <FaRedo />
                                                    </button>
                                                )}
                                                <button
                                                    className={`btn btn-sm ${admin.isActive ? 'btn-warning' : 'btn-success'}`}
                                                    onClick={() => handleToggleActive(admin)}
                                                    title={admin.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {admin.isActive ? <FaTimes /> : <FaCheck />}
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(admin._id)}
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            >
                                Previous
                            </button>
                            <span>Page {pagination.page} of {pagination.pages}</span>
                            <button
                                disabled={pagination.page === pagination.pages}
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingAdmin ? 'Edit Admin' : 'Whitelist Admin Email'}
            >
                <form onSubmit={handleSubmit}>
                    {!editingAdmin ? (
                        <>
                            <p className="modal-description">
                                Enter the email address to whitelist. The admin will use this email to register themselves.
                            </p>
                            <div className="form-group">
                                <label>Admin Email Address *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    pattern="[0-9]{10}"
                                    placeholder="10-digit number"
                                />
                            </div>
                        </>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : (editingAdmin ? 'Update' : 'Whitelist Email')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default ManageAdminsPage
