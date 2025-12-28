import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Click handler component
const ClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect([e.latlng.lat, e.latlng.lng])
        },
    })
    return null
}

// Recenter map when position changes
const RecenterMap = ({ position }) => {
    const map = useMap()
    useEffect(() => {
        if (position) {
            map.setView(position, 15)
        }
    }, [position, map])
    return null
}

const LocationPicker = ({ location, onLocationChange, editable = true }) => {
    const [position, setPosition] = useState(null)

    // Default center (India)
    const defaultCenter = [20.5937, 78.9629]

    useEffect(() => {
        if (location && location.latitude && location.longitude) {
            setPosition([location.latitude, location.longitude])
        }
    }, [location])

    const handlePositionChange = (newPosition) => {
        if (!editable) return
        setPosition(newPosition)
        onLocationChange?.({
            latitude: newPosition[0],
            longitude: newPosition[1]
        })
    }

    const center = position || defaultCenter
    const zoom = position ? 15 : 5

    return (
        <div className="map-container">
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '300px', width: '100%', borderRadius: '8px' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {editable && <ClickHandler onLocationSelect={handlePositionChange} />}
                {position && <Marker position={position} />}
                <RecenterMap position={position} />
            </MapContainer>
            {editable && (
                <p className="map-hint">Click on the map to select location</p>
            )}
        </div>
    )
}

export default LocationPicker
