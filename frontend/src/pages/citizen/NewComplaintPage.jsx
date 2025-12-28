import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation as useLocationHook } from '../../hooks/useLocation'
import { complaintService } from '../../services/complaint.service'
import LocationPicker from '../../components/maps/LocationPicker'
import toast from 'react-hot-toast'
import { FaCamera, FaMapMarkerAlt, FaPaperPlane, FaClock, FaKeyboard, FaCrosshairs } from 'react-icons/fa'

const NewComplaintPage = () => {
    const [formData, setFormData] = useState({
        image: null,
        imagePreview: null,
        description: '',
        address: ''
    })

    // Location state
    const [locationMode, setLocationMode] = useState('auto') // 'auto' or 'manual'
    const [manualCoords, setManualCoords] = useState({ latitude: '', longitude: '' })

    // DateTime state
    const [dateTimeMode, setDateTimeMode] = useState('auto') // 'auto' or 'manual'
    const [manualDateTime, setManualDateTime] = useState('')

    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

    const { location, getCurrentLocation, updateLocation, isLoading: locationLoading } = useLocationHook()

    // Set current date/time as default for manual mode
    useEffect(() => {
        const now = new Date()
        const localDateTime = now.toISOString().slice(0, 16)
        setManualDateTime(localDateTime)
    }, [])

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData({
                ...formData,
                image: file,
                imagePreview: URL.createObjectURL(file)
            })
        }
    }

    const handleManualCoordsChange = (field, value) => {
        const newCoords = { ...manualCoords, [field]: value }
        setManualCoords(newCoords)

        // Update location if both are valid numbers
        const lat = parseFloat(newCoords.latitude)
        const lng = parseFloat(newCoords.longitude)
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            updateLocation({ latitude: lat, longitude: lng })
        }
    }

    const getEffectiveLocation = () => {
        if (locationMode === 'manual') {
            const lat = parseFloat(manualCoords.latitude)
            const lng = parseFloat(manualCoords.longitude)
            if (!isNaN(lat) && !isNaN(lng)) {
                return { latitude: lat, longitude: lng }
            }
            return null
        }
        return location
    }

    const getEffectiveDateTime = () => {
        if (dateTimeMode === 'manual' && manualDateTime) {
            return new Date(manualDateTime).toISOString()
        }
        return new Date().toISOString()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.image) {
            toast.error('Please upload an image')
            return
        }

        const effectiveLocation = getEffectiveLocation()
        if (!effectiveLocation) {
            toast.error('Please select or enter a valid location')
            return
        }

        setIsSubmitting(true)

        try {
            const submitData = new FormData()
            submitData.append('image', formData.image)
            submitData.append('latitude', effectiveLocation.latitude)
            submitData.append('longitude', effectiveLocation.longitude)
            submitData.append('description', formData.description)
            submitData.append('address', formData.address)
            submitData.append('incidentTime', getEffectiveDateTime())

            await complaintService.create(submitData)
            toast.success('Complaint submitted successfully!')
            navigate('/citizen/complaints')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit')
        } finally {
            setIsSubmitting(false)
        }
    }

    const effectiveLocation = getEffectiveLocation()

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Submit New Complaint</h1>
                <p>Report illegal garbage dumping with photo evidence</p>
            </div>

            <form onSubmit={handleSubmit} className="complaint-form card">
                <div className="card-body">
                    {/* Image Upload */}
                    <div className="form-section">
                        <h3><FaCamera /> Upload Photo Evidence</h3>
                        <div className="image-upload">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                id="image-input"
                                capture="environment"
                            />
                            <label htmlFor="image-input" className="upload-area">
                                {formData.imagePreview ? (
                                    <img src={formData.imagePreview} alt="Preview" />
                                ) : (
                                    <>
                                        <FaCamera className="upload-icon" />
                                        <p>Click to upload or take photo</p>
                                        <span>Max 5MB, JPEG/PNG</span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Date/Time Section */}
                    <div className="form-section">
                        <h3><FaClock /> Incident Date & Time</h3>
                        <div className="toggle-options">
                            <button
                                type="button"
                                className={`toggle-btn ${dateTimeMode === 'auto' ? 'active' : ''}`}
                                onClick={() => setDateTimeMode('auto')}
                            >
                                <FaClock /> Auto (Now)
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${dateTimeMode === 'manual' ? 'active' : ''}`}
                                onClick={() => setDateTimeMode('manual')}
                            >
                                <FaKeyboard /> Manual Entry
                            </button>
                        </div>

                        {dateTimeMode === 'auto' ? (
                            <div className="auto-value-display">
                                <p>Current Time: <strong>{new Date().toLocaleString('en-IN')}</strong></p>
                            </div>
                        ) : (
                            <div className="form-group mt-3">
                                <label>Select Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={manualDateTime}
                                    onChange={(e) => setManualDateTime(e.target.value)}
                                    max={new Date().toISOString().slice(0, 16)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Location Section */}
                    <div className="form-section">
                        <h3><FaMapMarkerAlt /> Incident Location</h3>
                        <div className="toggle-options">
                            <button
                                type="button"
                                className={`toggle-btn ${locationMode === 'auto' ? 'active' : ''}`}
                                onClick={() => setLocationMode('auto')}
                            >
                                <FaCrosshairs /> GPS / Map
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${locationMode === 'manual' ? 'active' : ''}`}
                                onClick={() => setLocationMode('manual')}
                            >
                                <FaKeyboard /> Manual Entry
                            </button>
                        </div>

                        {locationMode === 'auto' ? (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-outline mt-3 mb-3"
                                    onClick={getCurrentLocation}
                                    disabled={locationLoading}
                                >
                                    {locationLoading ? 'Getting Location...' : '📍 Use My Current Location'}
                                </button>

                                <LocationPicker
                                    location={location}
                                    onLocationChange={updateLocation}
                                />

                                {location && (
                                    <div className="coords-display">
                                        <span>Lat: {parseFloat(location.latitude).toFixed(6)}</span>
                                        <span>Lng: {parseFloat(location.longitude).toFixed(6)}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="manual-coords mt-3">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Latitude *</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={manualCoords.latitude}
                                            onChange={(e) => handleManualCoordsChange('latitude', e.target.value)}
                                            placeholder="e.g. 19.0760"
                                            min="-90"
                                            max="90"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Longitude *</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={manualCoords.longitude}
                                            onChange={(e) => handleManualCoordsChange('longitude', e.target.value)}
                                            placeholder="e.g. 72.8777"
                                            min="-180"
                                            max="180"
                                            required
                                        />
                                    </div>
                                </div>
                                <p className="help-text">
                                    💡 Tip: You can get coordinates from Google Maps by right-clicking on a location
                                </p>
                            </div>
                        )}

                        <div className="form-group mt-3">
                            <label>Address / Landmark (Optional)</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Enter address or nearby landmark"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="form-section">
                        <div className="form-group">
                            <label>Description (Optional)</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the issue in detail..."
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting || !formData.image || !effectiveLocation}
                        >
                            <FaPaperPlane /> {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default NewComplaintPage
