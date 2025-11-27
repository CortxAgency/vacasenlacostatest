const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('❌ Error: DATABASE_URL is missing');
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🔌 Connected to DB');

        const sql = fs.readFileSync(
            path.join(__dirname, '../supabase/migrations/20240523000001_add_rooms_bathrooms.sql'),
            'utf8'
        );

        await client.query(sql);
        console.log('✅ Migration applied: Added rooms and bathrooms columns');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
