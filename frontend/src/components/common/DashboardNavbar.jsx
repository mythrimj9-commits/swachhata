import { useAuth } from '../../hooks/useAuth'
import { FaBell, FaUser } from 'react-icons/fa'

const DashboardNavbar = () => {
    const { user } = useAuth()

    return (
        <header className="dashboard-navbar">
            <div className="navbar-title">
                <h1>Welcome back, {user?.name || 'User'}!</h1>
                <p>Manage your complaints and fines</p>
            </div>

            <div className="navbar-actions">
                <button className="icon-btn">
                    <FaBell />
                    <span className="badge">3</span>
                </button>
                <div className="user-menu">
                    <div className="user-avatar-sm">
                        <FaUser />
                    </div>
                </div>
            </div>
        </header>
    )
}

export default DashboardNavbar
