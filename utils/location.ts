/**
 * Utility functions for handling property locations
 */

export interface Coordinates {
    lat: number
    lng: number
}

/**
 * Parse location string from PostgreSQL point format "(lat,lng)" to coordinates object
 * @param location - String in format "(lat,lng)" or null
 * @returns Coordinates object or null if invalid
 */
export function parseLocation(location: string | null | undefined): Coordinates | null {
    if (!location) return null

    try {
        // Remove parentheses and split by comma
        const clean = location.replace(/[()]/g, '').trim()
        const parts = clean.split(',')

        if (parts.length !== 2) return null

        const lat = parseFloat(parts[0])
        const lng = parseFloat(parts[1])

        // Validate coordinates are numbers
        if (isNaN(lat) || isNaN(lng)) return null

        // Validate lat/lng ranges
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null

        return { lat, lng }
    } catch (error) {
        console.error('Error parsing location:', error)
        return null
    }
}

/**
 * Convert coordinates object to PostgreSQL point string format
 * @param coords - Coordinates object with lat and lng
 * @returns String in format "(lat,lng)"
 */
export function stringifyLocation(coords: Coordinates | null | undefined): string | null {
    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
        return null
    }

    return `(${coords.lat},${coords.lng})`
}

/**
 * Get default location for a region (Costa Atlántica, Argentina)
 */
export function getDefaultLocation(): Coordinates {
    return {
        lat: -38.0055, // Mar del Plata latitude
        lng: -57.5426  // Mar del Plata longitude
    }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param coord1 - First coordinates
 * @param coord2 - Second coordinates
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371 // Earth's radius in km
    const dLat = toRad(coord2.lat - coord1.lat)
    const dLng = toRad(coord2.lng - coord1.lng)

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180)
}
