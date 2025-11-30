export interface Property {
    id: string
    title: string
    description: string
    price: number
    currency: string
    operation_type: string
    address: string
    location?: string // PostgreSQL point string like "(lat,lng)"
    owner_id: string
    created_at: string
    updated_at: string
    status: string // 'active', 'paused', 'sold'
    is_featured: boolean
    featured_until?: string
    rooms: number
    bathrooms: number
    features: Record<string, any>
    // Contacto personalizado por publicación
    contact_whatsapp?: string
    contact_email?: string
    contact_preference?: 'whatsapp' | 'email' | 'both'
    property_images: {
        id?: string
        url: string
        order?: number
    }[]
    users?: User
}

export interface User {
    id?: string
    email?: string
    full_name: string
    avatar_url: string
    whatsapp?: string
    is_verified?: boolean // Email verificado (nivel básico)
    is_identity_verified?: boolean // Identidad verificada con documentos (nivel premium)
    verified_at?: string
    role?: string
    subscription_tier?: 'free' | 'basic' | 'premium'
    max_listings?: number
    listings_count?: number
    created_at?: string
}

export interface Review {
    id: string
    reviewer_id: string
    reviewed_id: string
    rating: number
    comment: string
    created_at: string
    reviewer?: User // Para mostrar quién escribió la reseña
}
