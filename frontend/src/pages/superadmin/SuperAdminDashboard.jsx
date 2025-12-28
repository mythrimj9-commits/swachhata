import { useState, useEffect } from 'react'
import { superadminService } from '../../services/complaint.service'
import StatCard from '../../components/dashboard/StatCard'
import { formatCurrency, getRoleDisplayName } from '../../utils/helpers'
import { FaUsers, FaFileAlt, FaMoneyBillWave, FaUserShield } from 'react-icons/fa'

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchStatistics()
    }, [])

    const fetchStatistics = async () => {
        try {
            const response = await superadminService.getStatistics()
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
                <h1>Super Admin Dashboard</h1>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="Total Users"
                    value={stats?.users?.total || 0}
                    icon={FaUsers}
                    color="#3B82F6"
                />
                <StatCard
                    title="Total Admins"
                    value={stats?.users?.byRole?.admin?.count || 0}
                    icon={FaUserShield}
                    color="#8B5CF6"
                />
                <StatCard
                    title="Total Complaints"
                    value={stats?.complaints?.total || 0}
                    icon={FaFileAlt}
                    color="#F59E0B"
                />
                <StatCard
                    title="Total Fine Collection"
                    value={formatCurrency(stats?.fines?.paidAmount || 0)}
                    icon={FaMoneyBillWave}
                    color="#10B981"
                />
            </div>

            <div className="dashboard-grid mt-4">
                {/* User Stats */}
                <div className="card">
                    <div className="card-header">
                        <h3>User Statistics</h3>
                    </div>
                    <div className="card-body">
                        <div className="user-stats-list">
                            {stats?.users?.byRole && Object.entries(stats.users.byRole).map(([role, data]) => (
                                <div key={role} className="user-stat-item">
                                    <span className="role-name">{getRoleDisplayName(role)}</span>
                                    <span className="role-count">{data.count}</span>
                                    <span className="role-info">
                                        ({data.verified} verified, {data.active} active)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Complaint Stats */}
                <div className="card">
                    <div className="card-header">
                        <h3>Complaint Statistics</h3>
                    </div>
                    <div className="card-body">
                        <div className="complaint-stats-list">
                            {stats?.complaints?.byStatus && Object.entries(stats.complaints.byStatus).map(([status, count]) => (
                                <div key={status} className="complaint-stat-item">
                                    <span className="status-name">{status}</span>
                                    <span className="status-count">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Fine Stats */}
                <div className="card">
                    <div className="card-header">
                        <h3>Fine Collection</h3>
                    </div>
                    <div className="card-body">
                        <div className="fine-stats">
                            <div className="fine-stat-row">
                                <span>Total Fines Issued</span>
                                <span>{stats?.fines?.totalFines || 0}</span>
                            </div>
                            <div className="fine-stat-row">
                                <span>Total Fine Amount</span>
                                <span>{formatCurrency(stats?.fines?.totalAmount || 0)}</span>
                            </div>
                            <div className="fine-stat-row">
                                <span>Paid</span>
                                <span className="paid">{formatCurrency(stats?.fines?.paidAmount || 0)}</span>
                            </div>
                            <div className="fine-stat-row">
                                <span>Pending</span>
                                <span className="unpaid">{formatCurrency((stats?.fines?.totalAmount || 0) - (stats?.fines?.paidAmount || 0))}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SuperAdminDashboard
