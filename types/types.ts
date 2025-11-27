export interface Property {
    id: string
    title: string
    description: string
    price: number
    currency: string
    operation_type: string
    address: string
    city: string
    state: string
    zip_code: string
    country: string
    latitude?: number
    longitude?: number
    location?: any
    owner_id: string
    created_at: string
    updated_at: string
    is_active: boolean
    is_featured: boolean
    featured_until?: string
    rooms?: number
    bathrooms?: number
    features?: Record<string, boolean>
    property_images: {
        id: string
        url: string
        is_main: boolean
    }[]
    users?: {
        full_name: string
        avatar_url: string
        whatsapp?: string
        is_verified?: boolean
    }
}
