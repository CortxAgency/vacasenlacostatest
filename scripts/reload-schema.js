const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const configs = [
    {
        name: 'Pooler 6543',
        connectionString: 'postgresql://postgres:Andresyseba1%21@aws-0-sa-east-1.pooler.supabase.com:6543/postgres'
    },
    {
        name: 'Direct IP',
        connectionString: 'postgresql://postgres:Andresyseba1%21@186.130.128.250:5432/postgres'
    }
];

async function reloadSchema() {
    console.log('🔄 Starting Schema Reload...');

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

            await client.query("NOTIFY pgrst, 'reload config'");

            console.log('🎉 Schema Reload Signal Sent!');
            await client.end();
            return;
        } catch (err) {
            console.error(`❌ Failed: ${err.message}`);
            await client.end();
        }
    }

    console.log('\n💀 All attempts failed.');
}

reloadSchema();
