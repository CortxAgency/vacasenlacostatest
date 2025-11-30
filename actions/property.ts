'use server'

import { createClient } from '@/utils/supabase/server'
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
    location: z.string().optional(),
})

export async function publishProperty(prevState: any, formData: FormData) {
    // This function seems unused or placeholder in previous context, 
    // keeping it simple or returning error as client uses createProperty directly.
    return { message: 'Use client-side handler for this complex mutation' }
}

export async function createProperty(data: z.infer<typeof propertySchema>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { title, description, price, currency, operation_type, address, features, images, rooms, bathrooms, location } = data

    // Si no hay ubicación especificada, usar Pinamar centro como default razonable
    // Mejor que (0,0) que cae en el océano Atlántico
    const DEFAULT_LOCATION = '(-37.1084,-56.8533)' // Pinamar centro
    const finalLocation = location && location !== '(0,0)' ? location : DEFAULT_LOCATION

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
            location: finalLocation,
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

import { r2 } from '@/utils/r2'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

// ... (imports)

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

    // 1. Get images to delete from R2
    const { data: images } = await supabase
        .from('property_images')
        .select('url')
        .eq('property_id', propertyId)

    if (images && images.length > 0) {
        // Extract keys from URLs
        // URL format: https://domain.com/KEY
        // We assume the key is the path part of the URL relative to the public bucket URL
        // Or simply everything after the last '/' if we stored full URLs.
        // Let's be safer: if we stored the full public URL, we need to strip the domain.

        const deletePromises = images.map(async (img) => {
            try {
                // Simple extraction: assume key is "userId/filename.ext" which is usually at the end
                // If URL is "https://.../userId/uuid.jpg", we want "userId/uuid.jpg"
                const urlParts = img.url.split('/')
                // We know our keys are "userId/uuid.ext", so take last 2 parts
                const key = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`

                await r2.send(new DeleteObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: key
                }))
            } catch (err) {
                console.error('Error deleting file from R2:', err)
                // Continue even if one fails
            }
        })

        await Promise.all(deletePromises)
    }

    // 2. Delete from DB
    const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)

    if (error) throw new Error('Error deleting property')

    return { success: true }
}
