const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

async function seed() {
    console.log('🌱 Starting Seed...');

    // 1. Create User via Supabase Auth (so we can login in UI)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const email = `test.user.${Date.now()}@gmail.com`;
    const password = 'Password123!';

    console.log(`👤 Creating Auth User: ${email}`);
    const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('❌ Auth Error:', authError.message);
        // If rate limit, we might want to skip user creation and try to find one, 
        // but for now let's just fail or use a fallback if we could.
        // We'll proceed to try to insert data even if auth fails, using a random ID, 
        // just to get properties in the DB (though they won't have a login-able owner).
    }

    const userId = user ? user.id : uuidv4();
    console.log(`🔑 User ID: ${userId}`);

    // 2. Connect to DB via PG (Admin/Owner)
    // Using the Pooler URL
    const connectionString = 'postgresql://postgres:Andresyseba1%21@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🔌 Connected to DB (Direct)');

        // 3. Insert Profile (public.users)
        // We use string interpolation carefully to avoid parameter issues, 
        // but for simple strings it's fine in a seed script.
        const insertUserQuery = `
            INSERT INTO public.users (id, full_name, email, role, is_verified)
            VALUES ('${userId}', 'Test User', '${email}', 'user', true)
            ON CONFLICT (id) DO UPDATE SET is_verified = true
        `;
        await client.query(insertUserQuery);
        console.log('✅ Profile created');

        // 4. Insert Properties
        const properties = [
            {
                title: 'Departamento con Vista al Mar',
                description: 'Espectacular departamento de 3 ambientes con balcón terraza y vista plena al mar. Totalmente equipado.',
                price: 85000,
                address: 'Av. Costanera 1234',
                rooms: 3,
                bathrooms: 2,
                op_type: 'sale',
                is_featured: true
            },
            {
                title: 'Casa en el Bosque',
                description: 'Casa estilo cabaña en medio del bosque, ideal para descansar. Parrilla y parque.',
                price: 1500,
                address: 'Los Pinos 567',
                rooms: 4,
                bathrooms: 2,
                op_type: 'rent',
                is_featured: false
            },
            {
                title: 'Monoambiente Centro',
                description: 'Ideal inversión o alquiler temporal. A 2 cuadras de la peatonal.',
                price: 45000,
                address: 'San Martín 2020',
                rooms: 1,
                bathrooms: 1,
                op_type: 'sale',
                is_featured: false
            }
        ];

        for (const prop of properties) {
            const propId = uuidv4();
            const insertPropQuery = `
                INSERT INTO public.properties (
                    id, owner_id, title, description, price, currency, 
                    operation_type, rooms, bathrooms, address, status, is_featured
                ) VALUES (
                    '${propId}', '${userId}', '${prop.title}', '${prop.description}', ${prop.price}, 'USD', 
                    '${prop.op_type}', ${prop.rooms}, ${prop.bathrooms}, '${prop.address}', 'active', ${prop.is_featured}
                )
            `;
            await client.query(insertPropQuery);

            // Insert Image
            const imgUrl = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80';
            const insertImgQuery = `
                INSERT INTO public.property_images (id, property_id, url, "order")
                VALUES ('${uuidv4()}', '${propId}', '${imgUrl}', 0)
            `;
            await client.query(insertImgQuery);

            console.log(`🏠 Property inserted: ${prop.title}`);
        }

        console.log('🏁 Seeding Complete!');

    } catch (err) {
        console.error('❌ DB Error:', err);
    } finally {
        await client.end();
    }
}

seed();
