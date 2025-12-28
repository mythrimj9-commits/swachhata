import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { complaintService } from '../../services/complaint.service'
import StatusBadge from '../../components/dashboard/StatusBadge'
import LocationPicker from '../../components/maps/LocationPicker'
import { formatDateTime, formatCurrency } from '../../utils/helpers'
import { FaArrowLeft, FaCar, FaMapMarkerAlt, FaClock, FaMoneyBillWave } from 'react-icons/fa'

const ComplaintDetailsPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [complaint, setComplaint] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchComplaint()
    }, [id])

    const fetchComplaint = async () => {
        try {
            const response = await complaintService.getById(id)
            setComplaint(response.data.complaint)
        } catch (error) {
            console.error('Failed to fetch complaint:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="loading">Loading complaint details...</div>
    }

    if (!complaint) {
        return (
            <div className="error-state">
                <p>Complaint not found</p>
                <button className="btn btn-primary" onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
        )
    }

    const location = complaint.location?.coordinates
        ? { latitude: complaint.location.coordinates[1], longitude: complaint.location.coordinates[0] }
        : null

    return (
        <div className="page-container">
            <button className="btn btn-outline mb-3" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back to Complaints
            </button>

            <div className="complaint-details">
                <div className="details-header">
                    <h1>Complaint Details</h1>
                    <StatusBadge status={complaint.status} />
                </div>

                <div className="details-grid">
                    {/* Image Section */}
                    <div className="card">
                        <div className="card-header">
                            <h3>Evidence Photo</h3>
                        </div>
                        <div className="card-body">
                            <img
                                src={complaint.imageUrl}
                                alt="Complaint Evidence"
                                className="complaint-image-large"
                            />
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="card">
                        <div className="card-header">
                            <h3>Details</h3>
                        </div>
                        <div className="card-body">
                            <div className="detail-item">
                                <FaClock />
                                <div>
                                    <label>Submitted On</label>
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

                            {(complaint.extractedVehicleNo || complaint.verifiedVehicleNo) && (
                                <div className="detail-item">
                                    <FaCar />
                                    <div>
                                        <label>Vehicle Number</label>
                                        <p className="vehicle-number">
                                            {complaint.verifiedVehicleNo || complaint.extractedVehicleNo}
                                            {complaint.extractedVehicleNo && !complaint.verifiedVehicleNo && (
                                                <span className="ai-tag">AI Detected</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {complaint.description && (
                                <div className="detail-item">
                                    <div>
                                        <label>Description</label>
                                        <p>{complaint.description}</p>
                                    </div>
                                </div>
                            )}

                            {complaint.fineId && (
                                <div className="detail-item fine-info">
                                    <FaMoneyBillWave />
                                    <div>
                                        <label>Fine Amount</label>
                                        <p className="fine-amount">{formatCurrency(complaint.fineId.amount)}</p>
                                        <span className={`payment-status ${complaint.fineId.paymentStatus}`}>
                                            {complaint.fineId.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Map */}
                {location && (
                    <div className="card mt-4">
                        <div className="card-header">
                            <h3>Location on Map</h3>
                        </div>
                        <div className="card-body">
                            <LocationPicker location={location} editable={false} />
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div className="card mt-4">
                    <div className="card-header">
                        <h3>Status Timeline</h3>
                    </div>
                    <div className="card-body">
                        <div className="timeline">
                            {complaint.statusHistory?.map((item, index) => (
                                <div key={index} className="timeline-item">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <StatusBadge status={item.status} />
                                        <p className="timeline-date">{formatDateTime(item.changedAt)}</p>
                                        {item.remarks && <p className="timeline-remarks">{item.remarks}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ComplaintDetailsPage
