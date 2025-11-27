const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function seed() {
    console.log('🌱 Starting Smart Seed...');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    let user = null;
    let session = null;

    // 1. Try to find existing user
    const { data: existingUsers } = await supabase
        .from('users')
        .select('email')
        .limit(1);

    if (existingUsers && existingUsers.length > 0) {
        const email = existingUsers[0].email;
        console.log(`🔍 Found existing user: ${email}`);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: 'Password123!'
        });

        if (!error && data.session) {
            console.log('✅ Logged in successfully');
            user = data.user;
            session = data.session;
        } else {
            console.warn('⚠️ Login failed:', error?.message);
        }
    }

    // 2. If no user, Sign Up
    if (!user) {
        const email = `seed.user.${Date.now()}@gmail.com`;
        const password = 'Password123!';
        console.log(`👤 Creating New User: ${email}`);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: 'Seed User' } }
        });

        if (error) {
            console.error('❌ Signup failed:', error.message);
            process.exit(1);
        }
        user = data.user;
        session = data.session;
    }

    if (!session) {
        console.error('❌ No session available. Exiting.');
        process.exit(1);
    }

    // 3. Authenticated Client
    const authClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            }
        }
    );

    // 4. Insert Properties
    console.log('🏠 Inserting Properties...');
    const properties = [
        {
            title: 'Departamento con Vista al Mar',
            description: 'Espectacular departamento de 3 ambientes con balcón terraza y vista plena al mar.',
            price: 85000,
            currency: 'USD',
            operation_type: 'sale',
            rooms: 3,
            bathrooms: 2,
            address: 'Av. Costanera 1234',
            status: 'active',
            is_featured: true
        },
        {
            title: 'Casa en el Bosque',
            description: 'Casa estilo cabaña en medio del bosque.',
            price: 1500,
            currency: 'USD',
            operation_type: 'rent',
            rooms: 4,
            bathrooms: 2,
            address: 'Los Pinos 567',
            status: 'active',
            is_featured: false
        }
    ];

    for (const prop of properties) {
        const { data: propData, error: propError } = await authClient
            .from('properties')
            .insert({
                owner_id: user.id,
                ...prop
            })
            .select()
            .single();

        if (propError) {
            console.error(`❌ Insert failed for ${prop.title}:`, propError.message);
        } else {
            console.log(`✅ Inserted: ${prop.title}`);

            // Image
            await authClient.from('property_images').insert({
                property_id: propData.id,
                url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
                order: 0
            });
        }
    }

    console.log('🏁 Seed Complete');
}

seed();
