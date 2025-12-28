import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { FaEnvelope, FaLock, FaLeaf } from 'react-icons/fa'

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [isLoading, setIsLoading] = useState(false)
    const { login, user } = useAuth()
    const navigate = useNavigate()

    // Redirect if already logged in
    if (user) {
        const path = user.role === 'superadmin' ? '/superadmin' :
            user.role === 'admin' ? '/admin' : '/citizen'
        navigate(path, { replace: true })
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        const result = await login(formData.email, formData.password)

        if (result.success) {
            const path = result.user.role === 'superadmin' ? '/superadmin' :
                result.user.role === 'admin' ? '/admin' : '/citizen'
            navigate(path)
        }

        setIsLoading(false)
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <FaLeaf className="auth-icon" />
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue to Swachhata 2.0</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Register</Link></p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
