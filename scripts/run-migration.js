const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('❌ Error: DATABASE_URL is missing in .env.local');
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🔌 Connected to DB');

        const sqlPath = path.join(__dirname, '../database/migrations/001_add_featured_columns.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📝 Applying migration...');
        await client.query(sql);
        console.log('✅ Migration applied successfully!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

runMigration();
