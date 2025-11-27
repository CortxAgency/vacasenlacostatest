const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const config = {
    connectionString: 'postgresql://postgres:Andresyseba1%21@186.130.128.250:5432/postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function grantPermissions() {
    console.log('🔑 Starting Grant Permissions (Retry Mode)...');

    for (let i = 1; i <= 10; i++) {
        console.log(`\n🔄 Attempt ${i}/10...`);
        const client = new Client(config);

        try {
            await client.connect();
            console.log('✅ Connected!');

            await client.query(`
                GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
                GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
                GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
                GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
            `);

            console.log('🎉 Permissions Granted Successfully!');
            await client.end();
            return;
        } catch (err) {
            console.error(`❌ Failed: ${err.message}`);
            await client.end();
            await sleep(3000); // Wait 3s
        }
    }

    console.log('\n💀 All attempts failed.');
}

grantPermissions();
