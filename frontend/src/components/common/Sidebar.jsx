import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { NAV_ITEMS } from '../../utils/constants'
import { getRoleDisplayName } from '../../utils/helpers'
import {
    FaLeaf, FaTachometerAlt, FaPlus, FaList,
    FaMoneyBillWave, FaUsers, FaSignOutAlt
} from 'react-icons/fa'

const iconMap = {
    dashboard: FaTachometerAlt,
    add: FaPlus,
    list: FaList,
    money: FaMoneyBillWave,
    users: FaUsers
}

const Sidebar = ({ role }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const navItems = NAV_ITEMS[role] || []

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <FaLeaf className="brand-icon" />
                <span>Swachhata 2.0</span>
            </div>

            <div className="sidebar-user">
                <div className="user-avatar">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}
                </div>
                <div className="user-info">
                    <span className="user-name">{user?.name || user?.email}</span>
                    <span className="user-role">{getRoleDisplayName(role)}</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const Icon = iconMap[item.icon] || FaList
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === `/citizen` || item.path === `/admin` || item.path === `/superadmin`}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <Icon className="nav-icon" />
                            <span>{item.label}</span>
                        </NavLink>
                    )
                })}
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
