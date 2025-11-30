import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

// Initialize MercadoPago
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
    options: { timeout: 5000 }
})

// Initialize Supabase Admin Client (Service Role)
// We need admin rights to update any property
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        // 1. Get query params and body
        const url = new URL(request.url)
        const topic = url.searchParams.get('topic') || url.searchParams.get('type')
        const id = url.searchParams.get('id') || url.searchParams.get('data.id')

        // MercadoPago sends different formats. We care about 'payment'
        if (topic !== 'payment' && topic !== 'merchant_order') {
            // Just acknowledge
            return NextResponse.json({ status: 'ok' })
        }

        if (!id) {
            return NextResponse.json({ status: 'error', message: 'Missing ID' }, { status: 400 })
        }

        console.log(`🔔 Webhook received: ${topic} ID: ${id}`)

        // 2. Fetch Payment Data from MercadoPago API
        // This is crucial: We don't trust the webhook body alone. We verify with the API.
        const payment = new Payment(client)
        const paymentData = await payment.get({ id: id })

        if (paymentData.status === 'approved') {
            console.log(`✅ Payment ${id} approved. Processing...`)

            // 3. Extract Metadata / External Reference
            const { external_reference } = paymentData

            if (!external_reference) {
                console.error('❌ Missing external_reference in payment')
                return NextResponse.json({ status: 'error' }, { status: 400 })
            }

            let data
            try {
                data = JSON.parse(external_reference)
            } catch (e) {
                console.error('❌ Error parsing external_reference', e)
                return NextResponse.json({ status: 'error' }, { status: 400 })
            }

            const { property_id, days } = data

            if (!property_id || !days) {
                console.error('❌ Invalid data in external_reference')
                return NextResponse.json({ status: 'error' }, { status: 400 })
            }

            // 4. Calculate new expiration date
            const expirationDate = new Date()
            expirationDate.setDate(expirationDate.getDate() + parseInt(days))

            // 5. Update Database (Supabase)
            const { error } = await supabase
                .from('properties')
                .update({
                    is_featured: true,
                    featured_until: expirationDate.toISOString(),
                    last_payment_id: id
                })
                .eq('id', property_id)

            if (error) {
                console.error('❌ Error updating property in DB:', error)
                return NextResponse.json({ status: 'error', message: 'DB Error' }, { status: 500 })
            }

            console.log(`🎉 Property ${property_id} featured until ${expirationDate.toISOString()}`)
        }

        return NextResponse.json({ status: 'ok' })

    } catch (error) {
        console.error('❌ Webhook Error:', error)
        return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 })
    }
}
