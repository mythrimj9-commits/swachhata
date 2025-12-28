import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { complaintService, fineService } from '../../services/complaint.service'
import StatCard from '../../components/dashboard/StatCard'
import StatusBadge from '../../components/dashboard/StatusBadge'
import { formatDate } from '../../utils/helpers'
import { FaPlus, FaFileAlt, FaMoneyBillWave, FaClock, FaCheckCircle } from 'react-icons/fa'

const CitizenDashboard = () => {
    const [stats, setStats] = useState({
        totalComplaints: 0,
        pendingComplaints: 0,
        unpaidFines: 0,
        totalFineAmount: 0
    })
    const [recentComplaints, setRecentComplaints] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [complaintsRes, finesRes] = await Promise.all([
                complaintService.getMyComplaints({ limit: 5 }),
                fineService.getMyFines({ paymentStatus: 'unpaid' })
            ])

            const complaints = complaintsRes.data.complaints
            const fines = finesRes.data.fines

            setRecentComplaints(complaints)
            setStats({
                totalComplaints: complaintsRes.data.pagination.total,
                pendingComplaints: complaints.filter(c =>
                    ['submitted', 'verified'].includes(c.status)
                ).length,
                unpaidFines: fines.length,
                totalFineAmount: fines.reduce((sum, f) => sum + f.amount, 0)
            })
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="loading">Loading dashboard...</div>
    }

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h1>Citizen Dashboard</h1>
                <Link to="/citizen/new-complaint" className="btn btn-primary">
                    <FaPlus /> New Complaint
                </Link>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="Total Complaints"
                    value={stats.totalComplaints}
                    icon={FaFileAlt}
                    color="#3B82F6"
                />
                <StatCard
                    title="Pending Review"
                    value={stats.pendingComplaints}
                    icon={FaClock}
                    color="#F59E0B"
                />
                <StatCard
                    title="Unpaid Fines"
                    value={stats.unpaidFines}
                    icon={FaMoneyBillWave}
                    color="#EF4444"
                />
                <StatCard
                    title="Total Fine Amount"
                    value={`₹${stats.totalFineAmount.toLocaleString()}`}
                    icon={FaMoneyBillWave}
                    color="#8B5CF6"
                />
            </div>

            <div className="card mt-4">
                <div className="card-header">
                    <h3>Recent Complaints</h3>
                    <Link to="/citizen/complaints" className="btn btn-outline btn-sm">
                        View All
                    </Link>
                </div>
                <div className="card-body">
                    {recentComplaints.length === 0 ? (
                        <div className="empty-state">
                            <p>No complaints yet</p>
                            <Link to="/citizen/new-complaint" className="btn btn-primary">
                                Submit Your First Complaint
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentComplaints.map(complaint => (
                                        <tr key={complaint._id}>
                                            <td>
                                                <img
                                                    src={complaint.imageUrl}
                                                    alt="Complaint"
                                                    className="table-thumbnail"
                                                />
                                            </td>
                                            <td>{complaint.address || 'Location marked'}</td>
                                            <td><StatusBadge status={complaint.status} /></td>
                                            <td>{formatDate(complaint.createdAt)}</td>
                                            <td>
                                                <Link
                                                    to={`/citizen/complaints/${complaint._id}`}
                                                    className="btn btn-outline btn-sm"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CitizenDashboard
