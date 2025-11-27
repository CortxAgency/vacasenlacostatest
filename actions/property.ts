'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const propertySchema = z.object({
    title: z.string().min(5),
    description: z.string().min(20),
    price: z.number().min(1),
    currency: z.enum(['USD', 'ARS']),
    operation_type: z.enum(['rent', 'sale', 'temporary']),
    address: z.string().min(5),
    features: z.record(z.string(), z.boolean()),
    images: z.array(z.string()).min(1),
    rooms: z.number().min(1).optional(),
    bathrooms: z.number().min(1).optional(),
})

export async function publishProperty(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { message: 'Debes iniciar sesión para publicar.' }
    }

    // Parse data manually because of complex types (images, features)
    // In a real app, we'd use a more robust form handler or pass JSON
    // For this example, we assume the client sends a JSON string for complex fields or we handle them differently.
    // To keep it simple with Server Actions + Client Component, we will receive the raw data from the client component calling this action directly, 
    // OR we can use the formData if we structure the inputs correctly.

    // Better approach for this complexity: Client Component calls this action with an object, not FormData.
    // But "use server" actions called from client can accept objects.

    return { message: 'Use client-side handler for this complex mutation' }
}

export async function createProperty(data: z.infer<typeof propertySchema>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { title, description, price, currency, operation_type, address, features, images, rooms, bathrooms } = data

    // 1. Insert Property
    const { data: property, error: propError } = await supabase
        .from('properties')
        .insert({
            owner_id: user.id,
            title,
            description,
            price,
            currency,
            operation_type,
            address,
            features,
            rooms: rooms || 1,
            bathrooms: bathrooms || 1,
            location: '(0,0)', // Placeholder for now, map integration later
        })
        .select()
        .single()

    if (propError) {
        console.error('Error creating property:', propError)
        throw new Error('Error creating property')
    }

    // 2. Insert Images
    if (images.length > 0) {
        const imageInserts = images.map((url, index) => ({
            property_id: property.id,
            url,
            order: index,
        }))

        const { error: imgError } = await supabase
            .from('property_images')
            .insert(imageInserts)

        if (imgError) {
            console.error('Error inserting images:', imgError)
            // Non-fatal, property created but images failed. 
        }
    }

    return { success: true, propertyId: property.id }
}

export async function deleteProperty(propertyId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Verify ownership
    const { data: property } = await supabase
        .from('properties')
        .select('owner_id')
        .eq('id', propertyId)
        .single()

    if (!property || property.owner_id !== user.id) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)

    if (error) throw new Error('Error deleting property')

    return { success: true }
}
