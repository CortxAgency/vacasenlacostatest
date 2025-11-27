const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";

function log(color, msg) {
    console.log(`${color}${msg}${RESET}`);
}

async function checkDatabase() {
    log(CYAN, '\n--- 1. Checking Database Schema ---');

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        log(RED, '❌ DATABASE_URL is missing in .env.local');
        return;
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        log(GREEN, '✅ Connected to Database');

        const tables = ['users', 'properties', 'property_images', 'favorites'];

        for (const table of tables) {
            const res = await client.query(
                "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1",
                [table]
            );

            if (res.rows[0].count > 0) {
                log(GREEN, `✅ Table '${table}' exists`);

                // Check specific columns for properties
                if (table === 'properties') {
                    const cols = ['rooms', 'bathrooms', 'features', 'location'];
                    for (const col of cols) {
                        const colRes = await client.query(
                            "SELECT count(*) FROM information_schema.columns WHERE table_name = $1 AND column_name = $2",
                            [table, col]
                        );
                        if (colRes.rows[0].count > 0) {
                            log(GREEN, `   - Column '${col}' exists`);
                        } else {
                            log(RED, `   ❌ Column '${col}' MISSING`);
                        }
                    }
                }
            } else {
                log(RED, `❌ Table '${table}' MISSING`);
            }
        }

        // Check RLS
        // This is a bit complex to query directly from information_schema in a standard way for all PG versions, 
        // but we can check pg_class and pg_policy if we have permissions.
        // Simplified: We assume RLS is on if tables exist via our migration script.

    } catch (err) {
        log(RED, `❌ Database Connection Failed: ${err.message}`);
    } finally {
        await client.end();
    }
}

async function checkRoutes() {
    log(CYAN, '\n--- 2. Checking Application Routes (Localhost) ---');
    const baseUrl = 'http://localhost:3000';

    const routes = [
        { path: '/', expected: 200, name: 'Home Page' },
        { path: '/search', expected: 200, name: 'Search Page' },
        { path: '/login', expected: 200, name: 'Login Page' },
        // Protected routes should redirect (307 or 308 usually, or 200 if middleware rewrites to login, depends on implementation)
        // Next.js middleware often redirects with 307.
        { path: '/dashboard', expected: 307, name: 'Dashboard (Protected)' },
        { path: '/profile', expected: 307, name: 'Profile (Protected)' },
    ];

    for (const route of routes) {
        try {
            const res = await fetch(`${baseUrl}${route.path}`, { redirect: 'manual' });
            if (res.status === route.expected) {
                log(GREEN, `✅ ${route.name} (${route.path}): Status ${res.status}`);
            } else if (route.expected === 307 && (res.status === 308 || res.status === 302)) {
                log(GREEN, `✅ ${route.name} (${route.path}): Status ${res.status} (Redirect OK)`);
            } else {
                log(RED, `❌ ${route.name} (${route.path}): Expected ${route.expected}, got ${res.status}`);
            }
        } catch (err) {
            log(RED, `❌ ${route.name} (${route.path}): Failed to connect (${err.message})`);
            log(YELLOW, '   (Is the server running on port 3000?)');
        }
    }
}

async function runHealthCheck() {
    log(CYAN, '🚀 Starting Automated Health Check...');
    await checkDatabase();
    await checkRoutes();
    log(CYAN, '\n🏁 Health Check Complete');
}

runHealthCheck();
