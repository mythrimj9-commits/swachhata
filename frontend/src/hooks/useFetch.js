import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

export const useFetch = (url, options = {}) => {
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const {
        immediate = true,
        showError = true
    } = options

    const fetchData = useCallback(async (params = {}) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await api.get(url, { params })
            setData(response.data.data)
            return response.data.data
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to fetch data'
            setError(message)
            if (showError) {
                toast.error(message)
            }
            return null
        } finally {
            setIsLoading(false)
        }
    }, [url, showError])

    useEffect(() => {
        if (immediate && url) {
            fetchData()
        }
    }, [immediate, url, fetchData])

    const refetch = (params) => fetchData(params)

    return { data, isLoading, error, refetch }
}
