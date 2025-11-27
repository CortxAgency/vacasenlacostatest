'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'

// Fix for Leaflet default icon not loading in Next.js
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

interface PropertyMapProps {
    properties: any[]
    center?: [number, number]
    zoom?: number
}

export default function PropertyMap({ properties, center = [-34.6037, -58.3816], zoom = 12 }: PropertyMapProps) {
    // Default center: Buenos Aires Obelisco

    return (
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {properties.map((property) => {
                // Parse location point "(lat,lng)"
                // Assuming format from Postgres point: "(x,y)" where x is lat, y is lng (or vice versa depending on insertion)
                // Actually Postgres point is (x,y). Usually x=lng, y=lat in GIS, but simple point might be lat,lng.
                // Let's assume we parse it safely.
                // For MVP we initialized with (0,0). Let's handle that.

                let lat = -34.6037
                let lng = -58.3816

                if (property.location && typeof property.location === 'string') {
                    const parts = property.location.replace(/[()]/g, '').split(',')
                    if (parts.length === 2) {
                        lat = parseFloat(parts[0])
                        lng = parseFloat(parts[1])
                    }
                } else if (property.location && typeof property.location === 'object') {
                    // If supabase returns it as object
                    lat = property.location.x
                    lng = property.location.y
                }

                if (lat === 0 && lng === 0) return null // Skip invalid/default locations

                return (
                    <Marker key={property.id} position={[lat, lng]} icon={icon}>
                        <Popup>
                            <div className="min-w-[200px]">
                                <img
                                    src={property.property_images?.[0]?.url || '/placeholder.jpg'}
                                    alt={property.title}
                                    className="w-full h-32 object-cover rounded-md mb-2"
                                />
                                <h3 className="font-bold text-sm">{property.title}</h3>
                                <p className="text-xs text-muted-foreground">{property.address}</p>
                                <p className="font-bold mt-1">
                                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: property.currency }).format(property.price)}
                                </p>
                                <a href={`/property/${property.id}`} className="block mt-2 text-xs text-primary hover:underline">
                                    Ver detalles
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                )
            })}
        </MapContainer>
    )
}
