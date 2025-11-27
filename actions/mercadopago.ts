'use server'

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

// Initialize MercadoPago
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
    options: { timeout: 5000 }
});

export async function createPreference(propertyId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // Get property details
    const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

    if (!property || property.owner_id !== user.id) {
        throw new Error('Unauthorized or Property not found');
    }

    const preference = new Preference(client);

    try {
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: propertyId,
                        title: `Destacar Propiedad: ${property.title}`,
                        quantity: 1,
                        unit_price: 5000, // Precio fijo por ahora (ARS)
                        currency_id: 'ARS',
                    }
                ],
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?status=success&property_id=${propertyId}`,
                    failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?status=failure`,
                    pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?status=pending`,
                },
                auto_return: 'approved',
                metadata: {
                    property_id: propertyId,
                    user_id: user.id,
                    type: 'feature_property'
                },
                // notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago` // We need to implement this later
            }
        });

        if (!result.init_point) {
            throw new Error('No init_point returned');
        }

        return { url: result.init_point };
    } catch (error) {
        console.error('Error creating preference:', error);
        throw new Error('Error creating payment preference');
    }
}
