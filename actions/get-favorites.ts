'use server'

import { createClient } from '@/utils/supabase/server'
import { Property } from '@/types/types' // We might need to define this type if not exists, or use any

export async function getFavorites(): Promise<Property[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('favorites')
        .select(`
            property_id,
            properties (
                *,
                property_images (
                    url
                ),
                users (
                    full_name,
                    avatar_url,
                    is_verified,
                    whatsapp
                )
            )
        `)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error fetching favorites:', error)
        return []
    }

    // Transform data to match Property interface
    return data.map((item: any) => ({
        ...item.properties,
        property_images: item.properties.property_images || [],
        users: item.properties.users
    }))
}
