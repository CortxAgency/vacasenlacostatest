'use server'

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

// Initialize MercadoPago
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
    options: { timeout: 5000 }
});

// Planes de Destacado (Configuración)
const PLANS = {
    'basic_7': { days: 7, price: 5000, title: 'Destacado Semanal (7 días)' },
    'standard_15': { days: 15, price: 9000, title: 'Destacado Quincenal (15 días)' },
    'premium_30': { days: 30, price: 15000, title: 'Destacado Mensual (30 días)' },
}

export type PlanId = keyof typeof PLANS

export async function createPreference(propertyId: string, planId: PlanId = 'basic_7') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Validar propiedad
    const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

    if (!property || property.owner_id !== user.id) {
        throw new Error('Unauthorized or Property not found');
    }

    const plan = PLANS[planId]
    if (!plan) throw new Error('Invalid Plan ID');

    const preference = new Preference(client);

    try {
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: planId,
                        title: `${plan.title} - ${property.title}`,
                        quantity: 1,
                        unit_price: plan.price,
                        currency_id: 'ARS',
                        description: `Destacar propiedad ${propertyId} por ${plan.days} días`,
                    }
                ],
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?status=success&property_id=${propertyId}`,
                    failure: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?status=failure`,
                    pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?status=pending`,
                },
                auto_return: 'approved',
                external_reference: JSON.stringify({
                    property_id: propertyId,
                    plan_id: planId,
                    user_id: user.id,
                    days: plan.days
                }),
                metadata: {
                    property_id: propertyId,
                    user_id: user.id,
                    plan_id: planId,
                    type: 'feature_property'
                },
                notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`
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
