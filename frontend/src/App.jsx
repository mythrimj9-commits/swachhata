import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

// Layouts
import PublicLayout from './components/layouts/PublicLayout'
import DashboardLayout from './components/layouts/DashboardLayout'

// Public Pages
import HomePage from './pages/public/HomePage'
import CitizenLoginPage from './pages/public/CitizenLoginPage'
import AdminLoginPage from './pages/public/AdminLoginPage'
import SuperAdminLoginPage from './pages/public/SuperAdminLoginPage'
import AnonymousComplaintPage from './pages/public/AnonymousComplaintPage'

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard'
import NewComplaintPage from './pages/citizen/NewComplaintPage'
import MyComplaintsPage from './pages/citizen/MyComplaintsPage'
import ComplaintDetailsPage from './pages/citizen/ComplaintDetailsPage'
import MyFinesPage from './pages/citizen/MyFinesPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AllComplaintsPage from './pages/admin/AllComplaintsPage'
import VerifyComplaintPage from './pages/admin/VerifyComplaintPage'
import AllFinesPage from './pages/admin/AllFinesPage'

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard'
import ManageAdminsPage from './pages/superadmin/ManageAdminsPage'

// Protected Route Components
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return <div className="loading-screen">Loading...</div>
    }

    if (!user) {
        return <Navigate to="/" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />
    }

    return children
}

function App() {
    return (
        <Routes>
            {/* Landing Page - No Layout */}
            <Route path="/" element={<HomePage />} />

            {/* Role-based Login Pages */}
            <Route path="/citizen-login" element={<CitizenLoginPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/superadmin-login" element={<SuperAdminLoginPage />} />

            {/* Public Routes with Layout */}
            <Route element={<PublicLayout />}>
                <Route path="/anonymous-complaint" element={<AnonymousComplaintPage />} />
            </Route>

            {/* Citizen Routes */}
            <Route path="/citizen" element={
                <ProtectedRoute allowedRoles={['citizen', 'admin', 'superadmin']}>
                    <DashboardLayout />
                </ProtectedRoute>
            }>
                <Route index element={<CitizenDashboard />} />
                <Route path="new-complaint" element={<NewComplaintPage />} />
                <Route path="complaints" element={<MyComplaintsPage />} />
                <Route path="complaints/:id" element={<ComplaintDetailsPage />} />
                <Route path="fines" element={<MyFinesPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <DashboardLayout />
                </ProtectedRoute>
            }>
                <Route index element={<AdminDashboard />} />
                <Route path="complaints" element={<AllComplaintsPage />} />
                <Route path="complaints/:id" element={<VerifyComplaintPage />} />
                <Route path="fines" element={<AllFinesPage />} />
            </Route>

            {/* Super Admin Routes */}
            <Route path="/superadmin" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                    <DashboardLayout />
                </ProtectedRoute>
            }>
                <Route index element={<SuperAdminDashboard />} />
                <Route path="admins" element={<ManageAdminsPage />} />
            </Route>

            {/* Legacy routes - redirect */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/citizen-login" replace />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App
