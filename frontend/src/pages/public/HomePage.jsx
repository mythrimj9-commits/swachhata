import { Link } from 'react-router-dom'
import { FaCamera, FaUser, FaUserShield, FaUserCog, FaArrowRight } from 'react-icons/fa'

const HomePage = () => {
    const roles = [
        {
            id: 'citizen',
            icon: FaUser,
            title: 'Citizen',
            description: 'Report illegal garbage dumping, track complaints, and pay fines',
            color: '#10B981',
            gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            path: '/citizen-login'
        },
        {
            id: 'admin',
            icon: FaUserShield,
            title: 'Municipal Admin',
            description: 'Review complaints, verify vehicle numbers, and issue fines',
            color: '#3B82F6',
            gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            path: '/admin-login'
        },
        {
            id: 'superadmin',
            icon: FaUserCog,
            title: 'Super Admin',
            description: 'Manage system administrators and view analytics',
            color: '#8B5CF6',
            gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
            path: '/superadmin-login'
        }
    ]

    const features = [
        {
            icon: '📸',
            title: 'Photo Evidence',
            description: 'Capture illegal dumping with photo proof'
        },
        {
            icon: '🤖',
            title: 'AI Detection',
            description: 'Automatic vehicle number extraction'
        },
        {
            icon: '📍',
            title: 'GPS Location',
            description: 'Precise location tracking'
        },
        {
            icon: '💳',
            title: 'Online Payment',
            description: 'Pay fines digitally'
        }
    ]

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="landing-hero">
                <div className="hero-content">
                    <img src="/logo.png" alt="Swachhata 2.0" className="hero-logo" />
                    <h1>AI-Enabled Citizen Complaint System</h1>
                    <p>Report illegal garbage dumping and help keep India clean</p>

                    <Link to="/anonymous-complaint" className="btn btn-primary btn-lg hero-cta">
                        <FaCamera /> Report Anonymously
                    </Link>
                </div>
            </section>

            {/* Role Selection */}
            <section className="role-selection">
                <h2>Choose Your Role</h2>
                <p className="section-subtitle">Select how you want to access the platform</p>

                <div className="roles-grid">
                    {roles.map((role) => (
                        <Link
                            key={role.id}
                            to={role.path}
                            className="role-card"
                            style={{ '--role-color': role.color }}
                        >
                            <div className="role-icon" style={{ background: role.gradient }}>
                                <role.icon />
                            </div>
                            <h3>{role.title}</h3>
                            <p>{role.description}</p>
                            <span className="role-cta">
                                Continue <FaArrowRight />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2>How It Works</h2>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-item">
                            <span className="feature-emoji">{feature.icon}</span>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats Section */}
            <section className="landing-stats">
                <div className="stat-box">
                    <span className="stat-num">10,000+</span>
                    <span className="stat-label">Complaints Resolved</span>
                </div>
                <div className="stat-box">
                    <span className="stat-num">₹50L+</span>
                    <span className="stat-label">Fines Collected</span>
                </div>
                <div className="stat-box">
                    <span className="stat-num">100+</span>
                    <span className="stat-label">Cities Covered</span>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>© 2024 Swachhata 2.0 | Swachh Bharat Mission | Clean India Initiative</p>
            </footer>
        </div>
    )
}

export default HomePage
