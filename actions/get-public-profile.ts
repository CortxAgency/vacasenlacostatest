'use server'

import { createClient } from '@/utils/supabase/server'

export async function getPublicProfile(userId: string) {
    const supabase = await createClient()

    // Get User Info
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, full_name, avatar_url, is_verified, role, created_at')
        .eq('id', userId)
        .single()

    if (userError || !user) return null

    // Get User Properties
    const { data: properties, error: propError } = await supabase
        .from('properties')
        .select(`
            *,
            property_images (
                url
            )
        `)
        .eq('owner_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    return {
        user,
        properties: properties || []
    }
}
