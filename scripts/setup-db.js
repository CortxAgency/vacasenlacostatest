const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('❌ Error: DATABASE_URL is missing in .env.local');
        console.log('Please add your Supabase connection string to .env.local');
        console.log('Format: postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres');
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
        console.log('🔌 Connecting to Supabase...');
        await client.connect();
        console.log('✅ Connected successfully.');

        const schemaPath = path.join(__dirname, '../supabase/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('📝 Executing schema migration...');

        // Split by semicolon to execute statements individually (basic parser)
        // Note: This is a simple split and might break on complex functions with semicolons inside strings.
        // For this schema it should be fine, or we can execute the whole block if pg supports it.
        // pg supports executing multiple statements in one go.

        await client.query(schemaSql);

        console.log('✨ Schema applied successfully!');

    } catch (err) {
        console.error('❌ Error applying schema:', err);
    } finally {
        await client.end();
    }
}

setupDatabase();
