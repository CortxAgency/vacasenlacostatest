const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
    console.log('Testing connection to:', process.env.DATABASE_URL);
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected successfully!');
        await client.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        if (err.code === 'ENOTFOUND') {
            console.log('⚠️ Host not found. Check the Project ID.');
        }
    }
}

testConnection();
