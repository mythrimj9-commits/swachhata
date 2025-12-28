import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { complaintService } from '../../services/complaint.service'
import StatusBadge from '../../components/dashboard/StatusBadge'
import { formatDate } from '../../utils/helpers'
import { FaFilter, FaEye } from 'react-icons/fa'

const AllComplaintsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [complaints, setComplaints] = useState([])
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [isLoading, setIsLoading] = useState(true)

    const status = searchParams.get('status') || ''

    useEffect(() => {
        fetchComplaints()
    }, [pagination.page, status])

    const fetchComplaints = async () => {
        setIsLoading(true)
        try {
            const response = await complaintService.getAll({
                page: pagination.page,
                limit: 10,
                status: status || undefined,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            })
            setComplaints(response.data.complaints)
            setPagination(response.data.pagination)
        } catch (error) {
            console.error('Failed to fetch complaints:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleFilterChange = (newStatus) => {
        if (newStatus) {
            setSearchParams({ status: newStatus })
        } else {
            setSearchParams({})
        }
        setPagination({ ...pagination, page: 1 })
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>All Complaints</h1>
            </div>

            <div className="filters-bar">
                <div className="filter-group">
                    <FaFilter />
                    <select
                        value={status}
                        onChange={(e) => handleFilterChange(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="submitted">Submitted (Pending)</option>
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
                </div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Location</th>
                                    <th>Vehicle No</th>
                                    <th>Complainant</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map(complaint => (
                                    <tr key={complaint._id}>
                                        <td>
                                            <img
                                                src={complaint.imageUrl}
                                                alt="Complaint"
                                                className="table-thumbnail"
                                            />
                                        </td>
                                        <td>{complaint.address || 'Location marked'}</td>
                                        <td>
                                            {complaint.extractedVehicleNo || '-'}
                                            {complaint.extractedVehicleNo && (
                                                <span className="ai-confidence">
                                                    {complaint.aiConfidence}% conf
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {complaint.isAnonymous
                                                ? <span className="anonymous">Anonymous</span>
                                                : complaint.userId?.email || '-'
                                            }
                                        </td>
                                        <td><StatusBadge status={complaint.status} /></td>
                                        <td>{formatDate(complaint.createdAt)}</td>
                                        <td>
                                            <Link
                                                to={`/admin/complaints/${complaint._id}`}
                                                className="btn btn-primary btn-sm"
                                            >
                                                <FaEye /> Review
                                            </Link>
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
        </div>
    )
}

export default AllComplaintsPage
