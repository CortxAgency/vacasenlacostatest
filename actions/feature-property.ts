'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function featureProperty(propertyId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // In a real app, we would verify the payment_id with MercadoPago here
    // const payment = await mercadopago.payment.findById(paymentId)
    // if (payment.status !== 'approved') throw new Error('Payment not approved')

    // Calculate expiration date (30 days from now)
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 30)

    const { error } = await supabase
        .from('properties')
        .update({
            is_featured: true,
            featured_until: expirationDate.toISOString()
        })
        .eq('id', propertyId)
        .eq('owner_id', user.id)

    if (error) throw new Error('Error updating property')

    revalidatePath('/dashboard')
    revalidatePath('/')
    revalidatePath('/search')

    return { success: true }
}
