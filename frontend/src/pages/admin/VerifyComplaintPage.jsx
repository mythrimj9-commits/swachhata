import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { complaintService } from '../../services/complaint.service'
import StatusBadge from '../../components/dashboard/StatusBadge'
import LocationPicker from '../../components/maps/LocationPicker'
import Modal from '../../components/common/Modal'
import { formatDateTime, formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'
import {
    FaArrowLeft, FaCar, FaMapMarkerAlt, FaClock,
    FaCheck, FaTimes, FaMoneyBillWave, FaTrash
} from 'react-icons/fa'

const VerifyComplaintPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [complaint, setComplaint] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showFineModal, setShowFineModal] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [vehicleNo, setVehicleNo] = useState('')
    const [fineAmount, setFineAmount] = useState(500)
    const [fineRemarks, setFineRemarks] = useState('')
    const [rejectReason, setRejectReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchComplaint()
    }, [id])

    const fetchComplaint = async () => {
        try {
            const response = await complaintService.getDetails(id)
            setComplaint(response.data.complaint)
            setVehicleNo(response.data.complaint.verifiedVehicleNo ||
                response.data.complaint.extractedVehicleNo || '')
        } catch (error) {
            console.error('Failed to fetch complaint:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerify = async () => {
        if (!vehicleNo.trim()) {
            toast.error('Please enter vehicle number')
            return
        }

        setIsSubmitting(true)
        try {
            await complaintService.verify(id, { vehicleNo })
            toast.success('Vehicle number verified!')
            fetchComplaint()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleIssueFine = async () => {
        if (!vehicleNo.trim()) {
            toast.error('Please verify vehicle number first')
            return
        }

        setIsSubmitting(true)
        try {
            await complaintService.issueFine(id, {
                amount: fineAmount,
                vehicleNo,
                remarks: fineRemarks
            })
            toast.success('Fine issued successfully!')
            setShowFineModal(false)
            fetchComplaint()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to issue fine')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReject = async () => {
        setIsSubmitting(true)
        try {
            await complaintService.updateStatus(id, {
                status: 'rejected',
                remarks: rejectReason
            })
            toast.success('Complaint rejected')
            setShowRejectModal(false)
            navigate('/admin/complaints')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
            return
        }

        try {
            await complaintService.delete(id)
            toast.success('Complaint deleted')
            navigate('/admin/complaints')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete')
        }
    }

    if (isLoading) {
        return <div className="loading">Loading complaint...</div>
    }

    if (!complaint) {
        return (
            <div className="error-state">
                <p>Complaint not found</p>
                <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
            </div>
        )
    }

    const location = complaint.location?.coordinates
        ? { latitude: complaint.location.coordinates[1], longitude: complaint.location.coordinates[0] }
        : null

    return (
        <div className="page-container">
            <button className="btn btn-outline mb-3" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back
            </button>

            <div className="verify-complaint">
                <div className="details-header">
                    <h1>Review Complaint</h1>
                    <StatusBadge status={complaint.status} />
                </div>

                <div className="details-grid">
                    {/* Image */}
                    <div className="card">
                        <div className="card-header"><h3>Evidence Photo</h3></div>
                        <div className="card-body">
                            <img
                                src={complaint.imageUrl}
                                alt="Complaint Evidence"
                                className="complaint-image-large"
                            />
                        </div>
                    </div>

                    {/* Info & Actions */}
                    <div className="card">
                        <div className="card-header"><h3>Details & Actions</h3></div>
                        <div className="card-body">
                            <div className="detail-item">
                                <FaClock />
                                <div>
                                    <label>Submitted</label>
                                    <p>{formatDateTime(complaint.createdAt)}</p>
                                </div>
                            </div>

                            <div className="detail-item">
                                <FaMapMarkerAlt />
                                <div>
                                    <label>Location</label>
                                    <p>{complaint.address || 'Location marked on map'}</p>
                                </div>
                            </div>

                            {/* Vehicle Number Input */}
                            <div className="vehicle-input-section">
                                <label><FaCar /> Vehicle Number</label>
                                <div className="input-with-button">
                                    <input
                                        type="text"
                                        value={vehicleNo}
                                        onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                                        placeholder="Enter vehicle number"
                                        disabled={complaint.status !== 'submitted'}
                                    />
                                    {complaint.status === 'submitted' && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleVerify}
                                            disabled={isSubmitting}
                                        >
                                            <FaCheck /> Verify
                                        </button>
                                    )}
                                </div>
                                {complaint.extractedVehicleNo && (
                                    <p className="ai-detected">
                                        AI Detected: {complaint.extractedVehicleNo}
                                        ({complaint.aiConfidence}% confidence)
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="action-buttons mt-4">
                                {complaint.status === 'verified' && !complaint.fineId && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setShowFineModal(true)}
                                    >
                                        <FaMoneyBillWave /> Issue Fine
                                    </button>
                                )}

                                {complaint.status === 'submitted' && (
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => setShowRejectModal(true)}
                                    >
                                        <FaTimes /> Reject
                                    </button>
                                )}

                                <button className="btn btn-outline-danger" onClick={handleDelete}>
                                    <FaTrash /> Delete
                                </button>
                            </div>

                            {/* Fine Info */}
                            {complaint.fineId && (
                                <div className="fine-info-card mt-4">
                                    <h4>Fine Issued</h4>
                                    <p className="fine-amount">{formatCurrency(complaint.fineId.amount)}</p>
                                    <p>Status: <span className={`payment-status ${complaint.fineId.paymentStatus}`}>
                                        {complaint.fineId.paymentStatus}
                                    </span></p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Map */}
                {location && (
                    <div className="card mt-4">
                        <div className="card-header"><h3>Location</h3></div>
                        <div className="card-body">
                            <LocationPicker location={location} editable={false} />
                        </div>
                    </div>
                )}
            </div>

            {/* Fine Modal */}
            <Modal
                isOpen={showFineModal}
                onClose={() => setShowFineModal(false)}
                title="Issue Fine"
            >
                <div className="form-group">
                    <label>Vehicle Number</label>
                    <input type="text" value={vehicleNo} disabled />
                </div>
                <div className="form-group">
                    <label>Fine Amount (₹)</label>
                    <input
                        type="number"
                        value={fineAmount}
                        onChange={(e) => setFineAmount(Number(e.target.value))}
                        min={100}
                        max={50000}
                    />
                </div>
                <div className="form-group">
                    <label>Remarks (Optional)</label>
                    <textarea
                        value={fineRemarks}
                        onChange={(e) => setFineRemarks(e.target.value)}
                        placeholder="Add remarks..."
                    />
                </div>
                <div className="modal-actions">
                    <button className="btn btn-outline" onClick={() => setShowFineModal(false)}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleIssueFine}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Issuing...' : 'Issue Fine'}
                    </button>
                </div>
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                title="Reject Complaint"
            >
                <div className="form-group">
                    <label>Reason for Rejection</label>
                    <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter reason..."
                        required
                    />
                </div>
                <div className="modal-actions">
                    <button className="btn btn-outline" onClick={() => setShowRejectModal(false)}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={handleReject}
                        disabled={isSubmitting || !rejectReason}
                    >
                        {isSubmitting ? 'Rejecting...' : 'Reject Complaint'}
                    </button>
                </div>
            </Modal>
        </div>
    )
}

export default VerifyComplaintPage
