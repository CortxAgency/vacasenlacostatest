'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileSchema = z.object({
    full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    whatsapp: z.string()
        .min(10, "El número es muy corto (mínimo 10 dígitos)")
        .max(13, "El número es muy largo")
        .regex(/^(?:11|2[2-9]|3[0-9]|4[0-9]|5[0-9])[0-9]{8}$/, "Formato inválido. Usá código de área sin 0 (ej: 11) y número sin 15."),
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
        whatsapp: (formData.get('whatsapp') as string).replace(/[\s-]/g, ''),
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
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        return { message: 'Error al actualizar el perfil', type: 'error' }
    }

    revalidatePath('/profile')
    revalidatePath('/dashboard')
    return { message: 'Perfil actualizado correctamente', type: 'success' }
}
