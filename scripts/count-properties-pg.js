const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function countPropertiesPg() {
    // Use IP Address
    const connectionString = 'postgresql://postgres:Andresyseba1%21@186.130.128.250:5432/postgres';

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query('SELECT count(*) FROM public.properties');
        console.log('Total Properties (PG):', res.rows[0].count);

        const resActive = await client.query("SELECT count(*) FROM public.properties WHERE status = 'active'");
        console.log('Active Properties (PG):', resActive.rows[0].count);

    } catch (err) {
        console.error('PG Error:', err);
    } finally {
        await client.end();
    }
}

countPropertiesPg();
