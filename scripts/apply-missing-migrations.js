const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";

function log(color, msg) {
    console.log(`${color}${msg}${RESET}`);
}

async function applyMissingMigrations() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        log(RED, '❌ Error: DATABASE_URL is missing in .env.local');
        log(YELLOW, 'Please add your Supabase connection string to .env.local');
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        log(CYAN, '🔌 Connecting to Supabase...');
        await client.connect();
        log(GREEN, '✅ Connected successfully.\n');

        // Migration 1: Add rooms and bathrooms
        log(CYAN, '--- Migration 1: Add rooms and bathrooms ---');
        const migration1 = fs.readFileSync(
            path.join(__dirname, '../supabase/migrations/20240523000001_add_rooms_bathrooms.sql'),
            'utf8'
        );
        try {
            await client.query(migration1);
            log(GREEN, '✅ Migration 1 applied: rooms and bathrooms columns added\n');
        } catch (err) {
            if (err.message.includes('already exists') || err.message.includes('column') && err.message.includes('already')) {
                log(YELLOW, '⚠️  Migration 1 already applied (columns exist)\n');
            } else {
                throw err;
            }
        }

        // Migration 2: Add featured columns
        log(CYAN, '--- Migration 2: Add featured columns ---');
        const migration2 = fs.readFileSync(
            path.join(__dirname, '../supabase/migrations/20240523000002_add_featured.sql'),
            'utf8'
        );
        try {
            await client.query(migration2);
            log(GREEN, '✅ Migration 2 applied: is_featured and featured_until columns added\n');
        } catch (err) {
            if (err.message.includes('already exists') || err.message.includes('column') && err.message.includes('already')) {
                log(YELLOW, '⚠️  Migration 2 already applied (columns exist)\n');
            } else {
                throw err;
            }
        }

        // Migration 3: Create favorites table
        log(CYAN, '--- Migration 3: Create favorites table ---');
        const migration3 = fs.readFileSync(
            path.join(__dirname, '../supabase/migrations/20240523000000_create_favorites.sql'),
            'utf8'
        );
        try {
            await client.query(migration3);
            log(GREEN, '✅ Migration 3 applied: favorites table created\n');
        } catch (err) {
            if (err.message.includes('already exists') || err.message.includes('relation') && err.message.includes('already')) {
                log(YELLOW, '⚠️  Migration 3 already applied (table exists)\n');
            } else {
                throw err;
            }
        }

        // Verify the changes
        log(CYAN, '--- Verifying Database Schema ---');

        // Check properties columns
        const colCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'properties' 
            AND column_name IN ('rooms', 'bathrooms', 'is_featured', 'featured_until')
            ORDER BY column_name
        `);

        const columns = colCheck.rows.map(r => r.column_name);
        log(CYAN, '\nProperties table columns:');
        ['rooms', 'bathrooms', 'is_featured', 'featured_until'].forEach(col => {
            if (columns.includes(col)) {
                log(GREEN, `  ✅ ${col}`);
            } else {
                log(RED, `  ❌ ${col} MISSING`);
            }
        });

        // Check favorites table
        const tableCheck = await client.query(`
            SELECT count(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'favorites'
        `);

        if (tableCheck.rows[0].count > 0) {
            log(GREEN, '  ✅ favorites table exists');

            // Check RLS policies
            const policyCheck = await client.query(`
                SELECT policyname 
                FROM pg_policies 
                WHERE tablename = 'favorites'
            `);
            log(CYAN, `\nFavorites RLS policies (${policyCheck.rows.length} found):`);
            policyCheck.rows.forEach(row => {
                log(GREEN, `  ✅ ${row.policyname}`);
            });
        } else {
            log(RED, '  ❌ favorites table MISSING');
        }

        log(GREEN, '\n✨ All migrations completed successfully!');

    } catch (err) {
        log(RED, `\n❌ Error applying migrations: ${err.message}`);
        console.error(err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

applyMissingMigrations();
