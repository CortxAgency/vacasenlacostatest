const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function confirmUser() {
    // Use IP Address
    const connectionString = 'postgresql://postgres:Andresyseba1%21@186.130.128.250:5432/postgres';

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🔌 Connected to DB');

        const email = 'test.user.1764191236642@gmail.com';

        console.log(`📧 Confirming email for: ${email}`);

        const res = await client.query(`
            UPDATE auth.users
            SET email_confirmed_at = now(),
                updated_at = now()
            WHERE email = $1
            RETURNING id, email, email_confirmed_at
        `, [email]);

        if (res.rows.length > 0) {
            console.log('✅ User Confirmed:', res.rows[0]);
        } else {
            console.error('❌ User not found');
        }

    } catch (err) {
        console.error('❌ DB Error:', err);
    } finally {
        await client.end();
    }
}

confirmUser();
