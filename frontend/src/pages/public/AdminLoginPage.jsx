import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FaEnvelope, FaLock, FaArrowLeft, FaUserShield } from 'react-icons/fa'

const AdminLoginPage = () => {
    const [step, setStep] = useState('login') // login, register, verify
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        confirmPassword: '',
        otp: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        const result = await login(formData.email, formData.password)
        if (result.success) {
            if (result.user.role === 'admin' || result.user.role === 'superadmin') {
                navigate('/admin')
            } else {
                setError('You do not have admin access')
            }
        }
        setIsLoading(false)
    }

    const handleRegister = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            // Check if email is whitelisted and register
            const response = await api.post('/auth/admin-register', {
                email: formData.email,
                password: formData.password,
                name: formData.name,
                phone: formData.phone
            })

            toast.success('OTP sent to your email!')
            setStep('verify')
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed. Email may not be whitelisted.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await api.post('/auth/verify-otp', {
                email: formData.email,
                otp: formData.otp
            })

            toast.success('Account verified! Please login.')
            setStep('login')
            setFormData({ ...formData, password: '', otp: '' })
        } catch (error) {
            setError(error.response?.data?.message || 'Invalid OTP')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="role-auth-page admin-theme">
            <div className="auth-sidebar">
                <Link to="/" className="back-link">
                    <FaArrowLeft /> Back to Home
                </Link>
                <div className="sidebar-content">
                    <img src="/logo.png" alt="Swachhata 2.0" className="auth-logo" />
                    <h1>Admin Portal</h1>
                    <p>Municipal officer dashboard for managing complaints and fines</p>
                    <ul className="auth-features">
                        <li>✅ Review citizen complaints</li>
                        <li>🔍 Verify vehicle numbers</li>
                        <li>💰 Issue fines</li>
                        <li>📊 View analytics</li>
                    </ul>
                    <div className="auth-note">
                        <FaUserShield />
                        <span>Admin registration requires email whitelisting by Super Admin</span>
                    </div>
                </div>
            </div>

            <div className="auth-main">
                <div className="auth-form-container">
                    {step === 'login' && (
                        <>
                            <div className="auth-tabs">
                                <button className="active">Sign In</button>
                                <button onClick={() => setStep('register')}>Register</button>
                            </div>

                            <h2>Admin Sign In</h2>
                            <p className="auth-subtitle">Access the municipal admin dashboard</p>

                            {error && <div className="alert alert-error">{error}</div>}

                            <form onSubmit={handleLogin}>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter admin email"
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
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 'register' && (
                        <>
                            <div className="auth-tabs">
                                <button onClick={() => setStep('login')}>Sign In</button>
                                <button className="active">Register</button>
                            </div>

                            <h2>Admin Registration</h2>
                            <p className="auth-subtitle">Your email must be whitelisted by Super Admin</p>

                            {error && <div className="alert alert-error">{error}</div>}

                            <form onSubmit={handleRegister}>
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Whitelisted Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter whitelisted email"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="10-digit number"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min 8 characters"
                                        minLength={8}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Confirm Password *</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm password"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Registering...' : 'Register'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 'verify' && (
                        <>
                            <h2>Verify Email</h2>
                            <p className="auth-subtitle">Enter the OTP sent to {formData.email}</p>

                            {error && <div className="alert alert-error">{error}</div>}

                            <form onSubmit={handleVerifyOTP}>
                                <div className="form-group">
                                    <label>Enter OTP</label>
                                    <input
                                        type="text"
                                        name="otp"
                                        value={formData.otp}
                                        onChange={handleChange}
                                        placeholder="6-digit OTP"
                                        maxLength={6}
                                        required
                                        className="otp-input"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline btn-full mt-2"
                                    onClick={() => setStep('register')}
                                >
                                    Back to Registration
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminLoginPage
