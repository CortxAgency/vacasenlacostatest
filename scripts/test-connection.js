const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
    // Construct user with tenant ID
    // Project Ref: xjjkqmjxuemfdnqogkpa
    const connectionString = 'postgresql://postgres.xjjkqmjxuemfdnqogkpa:Andresyseba1%21@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

    console.log('🔌 Testing Connection with Tenant User...');
    console.log(connectionString.replace(/:[^:]*@/, ':****@')); // Hide password

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000
    });

    try {
        await client.connect();
        console.log('✅ Connected!');
        await client.end();
    } catch (err) {
        console.error(`❌ Failed: ${err.message}`);
        await client.end();
    }
}

testConnection();
