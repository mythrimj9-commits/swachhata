import { useState } from 'react'
import { useLocation as useLocationHook } from '../../hooks/useLocation'
import { complaintService } from '../../services/complaint.service'
import LocationPicker from '../../components/maps/LocationPicker'
import toast from 'react-hot-toast'
import { FaCamera, FaMapMarkerAlt, FaPaperPlane, FaCheckCircle } from 'react-icons/fa'

const AnonymousComplaintPage = () => {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        image: null,
        imagePreview: null,
        description: '',
        address: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState(null)

    const { location, getCurrentLocation, updateLocation, isLoading: locationLoading } = useLocationHook()

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

    const handleSubmit = async () => {
        if (!formData.image) {
            toast.error('Please upload an image')
            return
        }

        if (!location) {
            toast.error('Please select location on map')
            return
        }

        setIsSubmitting(true)

        try {
            const submitData = new FormData()
            submitData.append('image', formData.image)
            submitData.append('latitude', location.latitude)
            submitData.append('longitude', location.longitude)
            submitData.append('description', formData.description)
            submitData.append('address', formData.address)

            const response = await complaintService.submitAnonymous(submitData)
            setResult(response.data)
            setStep(3)
            toast.success('Complaint submitted successfully!')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="anonymous-complaint-page">
            <div className="page-header">
                <h1>🚨 Report Illegal Dumping</h1>
                <p>Submit complaint anonymously - no registration required</p>
            </div>

            <div className="steps-indicator">
                <div className={`step ${step >= 1 ? 'active' : ''}`}>
                    <span>1</span> Upload Photo
                </div>
                <div className={`step ${step >= 2 ? 'active' : ''}`}>
                    <span>2</span> Location
                </div>
                <div className={`step ${step >= 3 ? 'active' : ''}`}>
                    <span>3</span> Done
                </div>
            </div>

            <div className="complaint-form">
                {step === 1 && (
                    <div className="form-step">
                        <h2><FaCamera /> Upload Evidence Photo</h2>

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
                                    </>
                                )}
                            </label>
                        </div>

                        <div className="form-group">
                            <label>Description (Optional)</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the issue..."
                                rows={3}
                            />
                        </div>

                        <button
                            className="btn btn-primary btn-full"
                            onClick={() => setStep(2)}
                            disabled={!formData.image}
                        >
                            Continue to Location
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="form-step">
                        <h2><FaMapMarkerAlt /> Select Location</h2>

                        <button
                            className="btn btn-outline btn-full mb-3"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                        >
                            {locationLoading ? 'Getting Location...' : '📍 Use My Current Location'}
                        </button>

                        <LocationPicker
                            location={location}
                            onLocationChange={updateLocation}
                        />

                        <div className="form-group mt-3">
                            <label>Address (Optional)</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Enter address or landmark"
                            />
                        </div>

                        <div className="form-actions">
                            <button className="btn btn-outline" onClick={() => setStep(1)}>
                                Back
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !location}
                            >
                                <FaPaperPlane /> {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && result && (
                    <div className="form-step success-step">
                        <FaCheckCircle className="success-icon" />
                        <h2>Complaint Submitted!</h2>
                        <p>Your complaint has been registered successfully.</p>

                        <div className="result-card">
                            <p><strong>Complaint ID:</strong> {result.complaintId}</p>
                            {result.vehicleDetected && (
                                <p><strong>Vehicle Detected:</strong> {result.vehicleDetected}</p>
                            )}
                            <p><strong>Status:</strong> {result.status}</p>
                        </div>

                        <p className="note">
                            Save your Complaint ID to track the status later.
                        </p>

                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setStep(1)
                                setFormData({ image: null, imagePreview: null, description: '', address: '' })
                                setResult(null)
                            }}
                        >
                            Submit Another Complaint
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AnonymousComplaintPage
