import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/complaint.service'
import StatCard from '../../components/dashboard/StatCard'
import StatusBadge from '../../components/dashboard/StatusBadge'
import { formatDate, formatCurrency } from '../../utils/helpers'
import { FaFileAlt, FaMoneyBillWave, FaClock, FaCheckCircle } from 'react-icons/fa'

const AdminDashboard = () => {
    const [stats, setStats] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchStatistics()
    }, [])

    const fetchStatistics = async () => {
        try {
            const response = await adminService.getStatistics()
            setStats(response.data.statistics)
        } catch (error) {
            console.error('Failed to fetch statistics:', error)
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
                <h1>Admin Dashboard</h1>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="Total Complaints"
                    value={stats?.complaints?.total || 0}
                    icon={FaFileAlt}
                    color="#3B82F6"
                />
                <StatCard
                    title="Pending Review"
                    value={stats?.complaints?.byStatus?.submitted || 0}
                    icon={FaClock}
                    color="#F59E0B"
                />
                <StatCard
                    title="Total Fines Collected"
                    value={formatCurrency(stats?.fines?.collectedAmount || 0)}
                    icon={FaMoneyBillWave}
                    color="#10B981"
                />
                <StatCard
                    title="Pending Fines"
                    value={formatCurrency(stats?.fines?.pendingAmount || 0)}
                    icon={FaMoneyBillWave}
                    color="#EF4444"
                />
            </div>

            {/* Quick Actions */}
            <div className="quick-actions mt-4">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    <Link to="/admin/complaints?status=submitted" className="action-card card">
                        <FaClock className="action-icon pending" />
                        <h3>Review Pending</h3>
                        <p>{stats?.complaints?.byStatus?.submitted || 0} complaints awaiting review</p>
                    </Link>
                    <Link to="/admin/complaints?status=verified" className="action-card card">
                        <FaCheckCircle className="action-icon verified" />
                        <h3>Issue Fines</h3>
                        <p>{stats?.complaints?.byStatus?.verified || 0} verified complaints</p>
                    </Link>
                    <Link to="/admin/fines?paymentStatus=unpaid" className="action-card card">
                        <FaMoneyBillWave className="action-icon unpaid" />
                        <h3>Unpaid Fines</h3>
                        <p>{stats?.fines?.pending || 0} fines pending payment</p>
                    </Link>
                </div>
            </div>

            {/* Recent Complaints */}
            {stats?.recentComplaints && (
                <div className="card mt-4">
                    <div className="card-header">
                        <h3>Recent Complaints</h3>
                        <Link to="/admin/complaints" className="btn btn-outline btn-sm">
                            View All
                        </Link>
                    </div>
                    <div className="card-body">
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
                                    {stats.recentComplaints.map(complaint => (
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
                                                    to={`/admin/complaints/${complaint._id}`}
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminDashboard
