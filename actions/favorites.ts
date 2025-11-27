'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(propertyId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized', isFavorite: false }
    }

    // Check if already exists
    const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .single()

    if (existing) {
        // Remove
        await supabase.from('favorites').delete().eq('id', existing.id)
        revalidatePath('/')
        revalidatePath('/search')
        return { isFavorite: false }
    } else {
        // Add
        await supabase.from('favorites').insert({
            user_id: user.id,
            property_id: propertyId
        })
        revalidatePath('/')
        revalidatePath('/search')
        return { isFavorite: true }
    }
}

export async function getFavoriteStatus(propertyId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .single()

    return !!data
}
