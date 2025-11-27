const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const configs = [
    {
        name: 'Pooler 6543',
        connectionString: 'postgresql://postgres:Andresyseba1%21@aws-0-sa-east-1.pooler.supabase.com:6543/postgres'
    },
    {
        name: 'Pooler 5432',
        connectionString: 'postgresql://postgres:Andresyseba1%21@aws-0-sa-east-1.pooler.supabase.com:5432/postgres'
    },
    {
        name: 'Direct IP',
        connectionString: 'postgresql://postgres:Andresyseba1%21@186.130.128.250:5432/postgres'
    },
    {
        name: 'Direct DNS',
        connectionString: 'postgresql://postgres:Andresyseba1%21@db.xjjkqmjxuemfdnqogkpa.supabase.co:5432/postgres'
    }
];

async function tryConfirm() {
    const email = 'test.user.1764191236642@gmail.com';
    console.log(`🎯 Trying to confirm: ${email}`);

    for (const config of configs) {
        console.log(`\n🔌 Trying ${config.name}...`);
        const client = new Client({
            connectionString: config.connectionString,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000
        });

        try {
            await client.connect();
            console.log('✅ Connected!');

            const res = await client.query(`
                UPDATE auth.users
                SET email_confirmed_at = now(),
                    updated_at = now()
                WHERE email = $1
                RETURNING id, email, email_confirmed_at
            `, [email]);

            if (res.rows.length > 0) {
                console.log('🎉 SUCCESS! User Confirmed:', res.rows[0]);
                await client.end();
                return; // Exit success
            } else {
                console.log('⚠️ User not found in this DB (weird)');
            }
            await client.end();
        } catch (err) {
            console.error(`❌ Failed: ${err.message}`);
        }
    }

    console.log('\n💀 All attempts failed.');
}

tryConfirm();
