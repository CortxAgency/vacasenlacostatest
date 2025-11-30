'use client'

import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for Leaflet default icon
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

interface LocationPickerProps {
    value?: { lat: number; lng: number }
    onChange: (value: { lat: number; lng: number }) => void
}

function LocationMarker({ position, setPosition }: { position: { lat: number; lng: number } | null, setPosition: (pos: { lat: number; lng: number }) => void }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng)
            map.flyTo(e.latlng, map.getZoom())
        },
    })

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom())
        }
    }, [position, map])

    return position === null ? null : (
        <Marker position={position} icon={icon} draggable={true} eventHandlers={{
            dragend: (e) => {
                const marker = e.target
                const position = marker.getLatLng()
                setPosition(position)
            },
        }}>
            <Popup>Ubicación de la propiedad</Popup>
        </Marker>
    )
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
    // Default center: Miramar / Costa Atlántica
    const defaultCenter = { lat: -38.2725, lng: -57.8386 }
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(value || null)

    const handleSetPosition = (pos: { lat: number; lng: number }) => {
        setPosition(pos)
        onChange(pos)
    }

    return (
        <div className="h-[300px] w-full rounded-md overflow-hidden border z-0 relative">
            <MapContainer
                center={value || defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={handleSetPosition} />
            </MapContainer>
            <div className="absolute bottom-2 left-2 bg-white/90 p-2 rounded text-xs z-[1000] shadow-sm">
                Haz click o arrastra el marcador para ajustar
            </div>
        </div>
    )
}
