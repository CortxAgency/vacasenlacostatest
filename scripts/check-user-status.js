const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkUser() {
    // Use Pooler URL
    const connectionString = 'postgresql://postgres:Andresyseba1%21@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🔌 Connected to DB');

        const email = 'test.user.1764191236642@gmail.com';

        const res = await client.query(`
            SELECT id, email, email_confirmed_at, last_sign_in_at, created_at
            FROM auth.users
            WHERE email = $1
        `, [email]);

        if (res.rows.length > 0) {
            console.log('👤 User Found:', res.rows[0]);
        } else {
            console.error('❌ User NOT found in DB');
        }

    } catch (err) {
        console.error('❌ DB Error:', err);
    } finally {
        await client.end();
    }
}

checkUser();
