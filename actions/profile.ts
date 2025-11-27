'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileSchema = z.object({
    full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    whatsapp: z.string().min(8, "El número debe ser válido"),
    // bio: z.string().optional(), // Add bio column to DB if we want it later
})

export async function getProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return null
    }

    return data
}

export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { message: 'No autorizado', type: 'error' }
    }

    const rawData = {
        full_name: formData.get('full_name') as string,
        whatsapp: formData.get('whatsapp') as string,
    }

    const validatedFields = profileSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            message: validatedFields.error.issues[0].message,
            type: 'error'
        }
    }

    const { error } = await supabase
        .from('users')
        .update({
            full_name: validatedFields.data.full_name,
            whatsapp: validatedFields.data.whatsapp,
            // If we add bio later: bio: validatedFields.data.bio
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        return { message: 'Error al actualizar el perfil', type: 'error' }
    }

    revalidatePath('/profile')
    revalidatePath('/dashboard') // Update dashboard as well if name is shown there
    return { message: 'Perfil actualizado correctamente', type: 'success' }
}
