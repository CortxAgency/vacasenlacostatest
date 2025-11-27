const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function seed() {
    console.log('🌱 Starting Seed via API...');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 1. Create User
    const email = `seed.user.${Date.now()}@gmail.com`;
    const password = 'Password123!';

    console.log(`👤 Creating User: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Seed User',
                avatar_url: 'https://github.com/shadcn.png'
            }
        }
    });

    if (authError) {
        console.error('❌ Auth Error:', authError.message);
        process.exit(1);
    }

    const user = authData.user;
    console.log(`✅ User Created: ${user.id}`);

    // 2. Wait for Trigger (optional, but good practice)
    // We can try to update the profile to verify it exists and set is_verified
    // We need to sign in? signUp returns a session, so 'supabase' client might be authenticated if we used the returned session?
    // Actually, createClient maintains state if configured, but here it's a script.
    // We need to set the session manually or create a new client with the access token.

    const session = authData.session;
    if (!session) {
        console.error('❌ No session returned (Email confirmation required?)');
        // If email confirmation is on, we can't proceed easily.
        // But usually for dev/test projects it's off or we can use auto-confirm.
        // Let's assume it's off or we can't proceed.
        process.exit(1);
    }

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

    // 3. Update Profile (Verify)
    const { error: profileError } = await authClient
        .from('users')
        .update({ is_verified: true })
        .eq('id', user.id);

    if (profileError) {
        console.warn('⚠️ Profile update failed (Trigger might be slow):', profileError.message);
    } else {
        console.log('✅ Profile Verified');
    }

    // 4. Insert Properties
    const properties = [
        {
            title: 'Departamento con Vista al Mar',
            description: 'Espectacular departamento de 3 ambientes con balcón terraza y vista plena al mar. Totalmente equipado.',
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
            description: 'Casa estilo cabaña en medio del bosque, ideal para descansar. Parrilla y parque.',
            price: 1500,
            currency: 'USD',
            operation_type: 'rent',
            rooms: 4,
            bathrooms: 2,
            address: 'Los Pinos 567',
            status: 'active',
            is_featured: false
        },
        {
            title: 'Monoambiente Centro',
            description: 'Ideal inversión o alquiler temporal. A 2 cuadras de la peatonal.',
            price: 45000,
            currency: 'USD',
            operation_type: 'sale',
            rooms: 1,
            bathrooms: 1,
            address: 'San Martín 2020',
            status: 'active',
            is_featured: false
        }
    ];

    for (const prop of properties) {
        const { data: propData, error: propError } = await authClient
            .from('properties')
            .insert({
                owner_id: user.id, // RLS requires this to match auth.uid()
                ...prop
            })
            .select()
            .single();

        if (propError) {
            console.error(`❌ Failed to insert property ${prop.title}:`, propError.message);
            continue;
        }

        console.log(`🏠 Property inserted: ${prop.title}`);

        // Insert Image
        const { error: imgError } = await authClient
            .from('property_images')
            .insert({
                property_id: propData.id,
                url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
                order: 0
            });

        if (imgError) {
            console.error('❌ Image insert failed:', imgError.message);
        }
    }

    console.log('🏁 Seeding Complete!');
}

seed();
