const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkTables() {
    const connectionString = 'postgresql://postgres:Andresyseba1%21@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🔌 Connected to DB');

        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        console.log('Tables found:', res.rows.map(r => r.table_name));

    } catch (err) {
        console.error('❌ DB Error:', err);
    } finally {
        await client.end();
    }
}

checkTables();
