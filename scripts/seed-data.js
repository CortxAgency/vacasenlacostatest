const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function seed() {
    console.log('Starting seed process...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // 1. Try to find an existing user
        let userId;
        const userRes = await client.query('SELECT id FROM public.users LIMIT 1');

        if (userRes.rows.length > 0) {
            userId = userRes.rows[0].id;
            console.log('Found existing user:', userId);
        } else {
            console.log('No existing user found. Trying to create one...');
            // Fallback to creation if no user exists (might fail due to rate limit)
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );

            const email = `test_user_${Date.now()}@example.com`;
            const password = 'Password123!';

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: 'Test User',
                        avatar_url: 'https://i.pravatar.cc/150?u=test'
                    }
                }
            });

            if (authError) {
                throw new Error(`Error creating user: ${authError.message}`);
            }
            userId = authData.user.id;
            console.log('User created:', userId);
        }

        // 2. Insert Property using PG (bypassing RLS)
        const insertPropertyQuery = `
            INSERT INTO public.properties (owner_id, title, description, price, currency, operation_type, address, features, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id;
        `;

        const propertyValues = [
            userId,
            'Casa de Playa Soñada',
            'Hermosa casa frente al mar con todas las comodidades.',
            150000,
            'USD',
            'sale',
            'Av. Costanera 1234, Miramar',
            JSON.stringify({ rooms: 4, bathrooms: 2, parking: true }),
            'active'
        ];

        const res = await client.query(insertPropertyQuery, propertyValues);
        const propertyId = res.rows[0].id;
        console.log('Property inserted:', propertyId);

        // 3. Insert Images
        const insertImageQuery = `
            INSERT INTO public.property_images (property_id, url, "order")
            VALUES ($1, $2, $3);
        `;

        await client.query(insertImageQuery, [propertyId, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80', 0]);
        await client.query(insertImageQuery, [propertyId, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80', 1]);

        console.log('Images inserted successfully');

    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await client.end();
    }
}

seed();
