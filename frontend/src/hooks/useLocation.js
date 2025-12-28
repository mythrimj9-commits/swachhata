import { useState, useEffect } from 'react'

export const useLocation = () => {
    const [location, setLocation] = useState(null)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const getCurrentLocation = () => {
        setIsLoading(true)
        setError(null)

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser')
            setIsLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                })
                setIsLoading(false)
            },
            (err) => {
                let errorMessage = 'Unable to get location'
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied'
                        break
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = 'Location unavailable'
                        break
                    case err.TIMEOUT:
                        errorMessage = 'Location request timed out'
                        break
                }
                setError(errorMessage)
                setIsLoading(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        )
    }

    const updateLocation = (lat, lng) => {
        setLocation({
            latitude: lat,
            longitude: lng,
            accuracy: null // Manual update, no accuracy info
        })
    }

    return {
        location,
        error,
        isLoading,
        getCurrentLocation,
        updateLocation
    }
}
