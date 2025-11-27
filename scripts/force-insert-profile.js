const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function insertProfile() {
    // Use Pooler 6543 which worked
    const connectionString = 'postgresql://postgres:Andresyseba1%21@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🔌 Connected to DB');

        const email = 'test.user.1764191236642@gmail.com';

        // Get User ID from auth.users
        const userRes = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);

        if (userRes.rows.length === 0) {
            console.error('❌ User not found in auth.users');
            return;
        }

        const userId = userRes.rows[0].id;
        console.log(`👤 Found Auth User ID: ${userId}`);

        // Insert into public.users
        const insertRes = await client.query(`
            INSERT INTO public.users (id, full_name, email, role, is_verified)
            VALUES ($1, 'Test User', $2, 'user', true)
            ON CONFLICT (id) DO UPDATE SET is_verified = true
            RETURNING id
        `, [userId, email]);

        console.log('✅ Profile Inserted/Updated:', insertRes.rows[0]);

    } catch (err) {
        console.error('❌ DB Error:', err);
    } finally {
        await client.end();
    }
}

insertProfile();
