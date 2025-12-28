import { createContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // Check authentication on mount
    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
            setIsLoading(false)
            return
        }

        try {
            const response = await api.get('/auth/me')
            setUser(response.data.data.user)
            setIsAuthenticated(true)
        } catch (error) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password })
            const { user, accessToken, refreshToken } = response.data.data

            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)

            setUser(user)
            setIsAuthenticated(true)
            toast.success('Login successful!')

            return { success: true, user }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed'
            toast.error(message)
            return { success: false, message }
        }
    }

    const register = async (data) => {
        try {
            const response = await api.post('/auth/register', data)
            const { user, accessToken, refreshToken } = response.data.data

            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)

            setUser(user)
            setIsAuthenticated(true)
            toast.success('Registration successful!')

            return { success: true, user }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed'
            toast.error(message)
            return { success: false, message }
        }
    }

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout')
        } catch (error) {
            // Continue with logout even if API call fails
        }

        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setUser(null)
        setIsAuthenticated(false)
        toast.success('Logged out successfully')
    }, [])

    const updateProfile = async (data) => {
        try {
            const response = await api.put('/auth/update-profile', data)
            setUser(response.data.data.user)
            toast.success('Profile updated!')
            return { success: true }
        } catch (error) {
            const message = error.response?.data?.message || 'Update failed'
            toast.error(message)
            return { success: false, message }
        }
    }

    const value = {
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        checkAuth
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
