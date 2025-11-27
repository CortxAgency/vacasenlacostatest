const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkPort() {
    // Try port 5432 on Pooler
    const connectionString = 'postgresql://postgres:Andresyseba1%21@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        console.log('🔌 Connecting to Pooler on 5432...');
        await client.connect();
        console.log('✅ Connected!');
        await client.end();
    } catch (err) {
        console.error('❌ Failed on 5432:', err.message);
    }
}

checkPort();
