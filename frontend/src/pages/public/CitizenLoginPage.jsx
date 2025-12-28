import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { FaEnvelope, FaLock, FaUser, FaArrowLeft } from 'react-icons/fa'

const CitizenLoginPage = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        confirmPassword: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const { login, register } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        if (isLogin) {
            const result = await login(formData.email, formData.password)
            if (result.success) {
                navigate('/citizen')
            }
        } else {
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match')
                setIsLoading(false)
                return
            }
            const result = await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            })
            if (result.success) {
                navigate('/citizen')
            }
        }
        setIsLoading(false)
    }

    return (
        <div className="role-auth-page citizen-theme">
            <div className="auth-sidebar">
                <Link to="/" className="back-link">
                    <FaArrowLeft /> Back to Home
                </Link>
                <div className="sidebar-content">
                    <img src="/logo.png" alt="Swachhata 2.0" className="auth-logo" />
                    <h1>Citizen Portal</h1>
                    <p>Report illegal garbage dumping and help keep your neighborhood clean</p>
                    <ul className="auth-features">
                        <li>📸 Submit complaints with photos</li>
                        <li>📍 Auto-capture GPS location</li>
                        <li>🔍 Track complaint status</li>
                        <li>💳 Pay fines online</li>
                    </ul>
                </div>
            </div>

            <div className="auth-main">
                <div className="auth-form-container">
                    <div className="auth-tabs">
                        <button
                            className={isLogin ? 'active' : ''}
                            onClick={() => setIsLogin(true)}
                        >
                            Sign In
                        </button>
                        <button
                            className={!isLogin ? 'active' : ''}
                            onClick={() => setIsLogin(false)}
                        >
                            Register
                        </button>
                    </div>

                    <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
                    <p className="auth-subtitle">
                        {isLogin ? 'Sign in to your citizen account' : 'Register as a new citizen'}
                    </p>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="10-digit number"
                                    pattern="[0-9]{10}"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={isLogin ? 'Enter password' : 'Min 6 characters'}
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CitizenLoginPage
