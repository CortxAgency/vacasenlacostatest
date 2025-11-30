'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Review } from '@/types/types'

export async function createReview(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const reviewed_id = formData.get('reviewed_id') as string
    const rating = parseInt(formData.get('rating') as string)
    const comment = formData.get('comment') as string

    if (!reviewed_id || !rating || !comment) {
        return { message: 'Faltan campos requeridos', type: 'error' }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { message: 'Debes iniciar sesión para dejar una reseña', type: 'error' }
    }

    // Validar que el usuario tenga el email verificado para evitar spam de cuentas falsas
    // Obtenemos el perfil del usuario actual
    const { data: userProfile } = await supabase
        .from('users')
        .select('is_verified')
        .eq('id', user.id)
        .single()

    if (!userProfile?.is_verified) {
        return { message: 'Debes verificar tu email para poder dejar reseñas.', type: 'error' }
    }

    if (user.id === reviewed_id) {
        return { message: 'No puedes reseñarte a ti mismo', type: 'error' }
    }

    const { error } = await supabase
        .from('reviews')
        .insert({
            reviewer_id: user.id,
            reviewed_id,
            rating,
            comment
        })

    if (error) {
        // Código de error de Postgres para violación de unique constraint
        if (error.code === '23505') {
            return { message: 'Ya has dejado una reseña a este usuario.', type: 'error' }
        }
        console.error('Error creating review:', error)
        return { message: 'Error al guardar la reseña', type: 'error' }
    }

    revalidatePath(`/u/${reviewed_id}`)
    return { message: 'Reseña publicada con éxito', type: 'success' }
}

export async function getReviewsByUserId(userId: string): Promise<Review[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            reviewer:users!reviewer_id (
                full_name,
                avatar_url
            )
        `)
        .eq('reviewed_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching reviews:', error)
        return []
    }

    // Mapear la respuesta para que coincida con la interfaz Review
    // Supabase devuelve reviewer como un objeto dentro del review
    return data as unknown as Review[]
}

export async function getUserStats(userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewed_id', userId)

    if (error || !data || data.length === 0) {
        return { average: 0, total: 0 }
    }

    const total = data.length
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0)
    const average = sum / total

    return { average: parseFloat(average.toFixed(1)), total }
}
