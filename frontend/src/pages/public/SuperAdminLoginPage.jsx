import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { FaArrowLeft, FaLock, FaEnvelope, FaUserCog } from 'react-icons/fa'

const SuperAdminLoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        const result = await login(formData.email, formData.password)

        if (result.success) {
            if (result.user.role === 'superadmin') {
                navigate('/superadmin')
            } else {
                setError('You do not have super admin access')
            }
        }
        setIsLoading(false)
    }

    return (
        <div className="role-auth-page superadmin-theme">
            <div className="auth-sidebar">
                <Link to="/" className="back-link">
                    <FaArrowLeft /> Back to Home
                </Link>
                <div className="sidebar-content">
                    <img src="/logo.png" alt="Swachhata 2.0" className="auth-logo" />
                    <h1>Super Admin Portal</h1>
                    <p>System administration and management console</p>
                    <ul className="auth-features">
                        <li>👥 Manage admin accounts</li>
                        <li>✉️ Whitelist admin emails</li>
                        <li>📊 System-wide analytics</li>
                        <li>⚙️ System configuration</li>
                    </ul>
                    <div className="auth-note warning">
                        <FaLock />
                        <span>Super Admin access is restricted. Contact system administrator for credentials.</span>
                    </div>
                </div>
            </div>

            <div className="auth-main">
                <div className="auth-form-container">
                    <div className="superadmin-badge">
                        <FaUserCog />
                        <span>Super Admin Only</span>
                    </div>

                    <h2>Super Admin Sign In</h2>
                    <p className="auth-subtitle">Access the system administration console</p>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter super admin email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="security-note">
                        🔒 This session will be logged for security purposes
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SuperAdminLoginPage
