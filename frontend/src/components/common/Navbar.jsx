import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { FaLeaf, FaUser, FaSignOutAlt } from 'react-icons/fa'

const Navbar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const getDashboardPath = () => {
        if (!user) return '/login'
        switch (user.role) {
            case 'superadmin': return '/superadmin'
            case 'admin': return '/admin'
            default: return '/citizen'
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <FaLeaf className="brand-icon" />
                    <span>Swachhata 2.0</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/anonymous-complaint" className="nav-link">Report Issue</Link>

                    {user ? (
                        <div className="navbar-user">
                            <Link to={getDashboardPath()} className="nav-link dashboard-link">
                                <FaUser /> Dashboard
                            </Link>
                            <button onClick={handleLogout} className="btn-logout">
                                <FaSignOutAlt /> Logout
                            </button>
                        </div>
                    ) : (
                        <div className="navbar-auth">
                            <Link to="/login" className="btn btn-outline">Login</Link>
                            <Link to="/register" className="btn btn-primary">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
