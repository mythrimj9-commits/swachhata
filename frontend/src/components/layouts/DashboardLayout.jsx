import { Outlet } from 'react-router-dom'
import Sidebar from '../common/Sidebar'
import DashboardNavbar from '../common/DashboardNavbar'
import { useAuth } from '../../hooks/useAuth'

const DashboardLayout = () => {
    const { user } = useAuth()

    return (
        <div className="dashboard-layout">
            <Sidebar role={user?.role} />
            <div className="dashboard-main">
                <DashboardNavbar />
                <main className="dashboard-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout
