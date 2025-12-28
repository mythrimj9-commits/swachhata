import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { complaintService } from '../../services/complaint.service'
import StatusBadge from '../../components/dashboard/StatusBadge'
import { formatDate } from '../../utils/helpers'
import { FaPlus, FaFilter } from 'react-icons/fa'

const MyComplaintsPage = () => {
    const [complaints, setComplaints] = useState([])
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [filter, setFilter] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchComplaints()
    }, [pagination.page, filter])

    const fetchComplaints = async () => {
        setIsLoading(true)
        try {
            const response = await complaintService.getMyComplaints({
                page: pagination.page,
                limit: 10,
                status: filter || undefined
            })
            setComplaints(response.data.complaints)
            setPagination(response.data.pagination)
        } catch (error) {
            console.error('Failed to fetch complaints:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const statuses = ['', 'submitted', 'verified', 'fined', 'closed', 'rejected']

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>My Complaints</h1>
                <Link to="/citizen/new-complaint" className="btn btn-primary">
                    <FaPlus /> New Complaint
                </Link>
            </div>

            <div className="filters-bar">
                <div className="filter-group">
                    <FaFilter />
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="submitted">Submitted</option>
                        <option value="verified">Verified</option>
                        <option value="fined">Fine Issued</option>
                        <option value="closed">Closed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <span className="results-count">{pagination.total} complaint(s)</span>
            </div>

            {isLoading ? (
                <div className="loading">Loading complaints...</div>
            ) : complaints.length === 0 ? (
                <div className="empty-state card">
                    <p>No complaints found</p>
                    <Link to="/citizen/new-complaint" className="btn btn-primary">
                        Submit Your First Complaint
                    </Link>
                </div>
            ) : (
                <>
                    <div className="complaints-grid">
                        {complaints.map(complaint => (
                            <Link
                                key={complaint._id}
                                to={`/citizen/complaints/${complaint._id}`}
                                className="complaint-card card"
                            >
                                <div className="complaint-image">
                                    <img src={complaint.imageUrl} alt="Complaint" />
                                    <StatusBadge status={complaint.status} />
                                </div>
                                <div className="complaint-info">
                                    <p className="complaint-location">{complaint.address || 'Location marked'}</p>
                                    <p className="complaint-date">{formatDate(complaint.createdAt)}</p>
                                    {complaint.extractedVehicleNo && (
                                        <p className="vehicle-no">🚗 {complaint.extractedVehicleNo}</p>
                                    )}
                                </div>
                            </Link>
                        ))}
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
        </div>
    )
}

export default MyComplaintsPage
