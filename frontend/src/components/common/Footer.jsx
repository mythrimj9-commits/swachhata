import { FaLeaf, FaGithub, FaTwitter, FaEnvelope } from 'react-icons/fa'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <FaLeaf className="brand-icon" />
                    <div>
                        <h3>Swachhata 2.0</h3>
                        <p>AI-Enabled Complaint System</p>
                    </div>
                </div>

                <div className="footer-links">
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <a href="/">Home</a>
                        <a href="/anonymous-complaint">Report Issue</a>
                        <a href="/login">Login</a>
                    </div>

                    <div className="footer-section">
                        <h4>Resources</h4>
                        <a href="https://swachhbharatmission.gov.in" target="_blank" rel="noopener">
                            Swachh Bharat Mission
                        </a>
                        <a href="#">API Documentation</a>
                        <a href="#">Help Center</a>
                    </div>

                    <div className="footer-section">
                        <h4>Connect</h4>
                        <div className="social-links">
                            <a href="#"><FaGithub /></a>
                            <a href="#"><FaTwitter /></a>
                            <a href="#"><FaEnvelope /></a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Swachhata 2.0 | Clean India Initiative</p>
            </div>
        </footer>
    )
}

export default Footer
