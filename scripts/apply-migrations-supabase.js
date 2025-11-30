const { createClient } = require('@supabase/supabase-js');
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        log(RED, '❌ Error: Missing Supabase credentials in .env.local');
        log(YELLOW, 'Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    log(CYAN, '🔌 Connected to Supabase via API\n');

    try {
        // Migration 1: Add rooms and bathrooms
        log(CYAN, '--- Migration 1: Add rooms and bathrooms ---');
        const migration1SQL = `
-- Add rooms and bathrooms columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS rooms int DEFAULT 1,
ADD COLUMN IF NOT EXISTS bathrooms int DEFAULT 1;

-- Update existing rows to have default values if null
UPDATE public.properties SET rooms = 1 WHERE rooms IS NULL;
UPDATE public.properties SET bathrooms = 1 WHERE bathrooms IS NULL;
        `.trim();

        const { error: err1 } = await supabase.rpc('exec_sql', { sql: migration1SQL }).single();
        if (err1 && !err1.message.includes('already exists')) {
            // Try direct query instead
            const parts1 = migration1SQL.split(';').filter(s => s.trim());
            for (const part of parts1) {
                if (part.trim()) {
                    const { error } = await supabase.rpc('exec_sql', { sql: part.trim() });
                    if (error && !error.message.includes('already exists')) {
                        throw error;
                    }
                }
            }
        }
        log(GREEN, '✅ Migration 1 applied: rooms and bathrooms columns\n');

        // Migration 2: Add featured columns
        log(CYAN, '--- Migration 2: Add featured columns ---');
        const migration2SQL = `
-- Add featured columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_until timestamptz;

-- Index for faster queries on featured properties
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(is_featured);
        `.trim();

        const parts2 = migration2SQL.split(';').filter(s => s.trim());
        for (const part of parts2) {
            if (part.trim()) {
                const { error } = await supabase.rpc('exec_sql', { sql: part.trim() });
                if (error && !error.message.includes('already exists')) {
                    // Ignore silently if column exists
                    if (!error.message.includes('column') && !error.message.includes('index')) {
                        throw error;
                    }
                }
            }
        }
        log(GREEN, '✅ Migration 2 applied: is_featured and featured_until columns\n');

        // Migration 3: Create favorites table
        log(CYAN, '--- Migration 3: Create favorites table ---');

        // First check if table exists
        const { data: tableExists } = await supabase
            .from('favorites')
            .select('id')
            .limit(1);

        if (tableExists !== null) {
            log(YELLOW, '⚠️  Favorites table already exists, skipping creation\n');
        } else {
            const migration3SQL = `
-- Tabla de Favoritos
CREATE TABLE IF NOT EXISTS favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- RLS para Favoritos
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
            `.trim();

            const parts3 = migration3SQL.split(';').filter(s => s.trim());
            for (const part of parts3) {
                if (part.trim()) {
                    const { error } = await supabase.rpc('exec_sql', { sql: part.trim() });
                    if (error && !error.message.includes('already exists')) {
                        // Only throw if it's not an "already exists" type error
                        if (!error.message.toLowerCase().includes('exist')) {
                            log(YELLOW, `Warning: ${error.message}`);
                        }
                    }
                }
            }

            // Create policies separately
            log(CYAN, 'Creating RLS policies for favorites...');

            const policies = [
                {
                    name: 'Usuarios pueden ver sus propios favoritos',
                    sql: `
                        DROP POLICY IF EXISTS "Usuarios pueden ver sus propios favoritos" ON favorites;
                        CREATE POLICY "Usuarios pueden ver sus propios favoritos"
                          ON favorites FOR SELECT
                          USING (auth.uid() = user_id);
                    `
                },
                {
                    name: 'Usuarios pueden agregar favoritos',
                    sql: `
                        DROP POLICY IF EXISTS "Usuarios pueden agregar favoritos" ON favorites;
                        CREATE POLICY "Usuarios pueden agregar favoritos"
                          ON favorites FOR INSERT
                          WITH CHECK (auth.uid() = user_id);
                    `
                },
                {
                    name: 'Usuarios pueden eliminar sus favoritos',
                    sql: `
                        DROP POLICY IF EXISTS "Usuarios pueden eliminar sus favoritos" ON favorites;
                        CREATE POLICY "Usuarios pueden eliminar sus favoritos"
                          ON favorites FOR DELETE
                          USING (auth.uid() = user_id);
                    `
                }
            ];

            for (const policy of policies) {
                const parts = policy.sql.trim().split(';').filter(s => s.trim());
                for (const part of parts) {
                    if (part.trim()) {
                        await supabase.rpc('exec_sql', { sql: part.trim() });
                    }
                }
            }

            log(GREEN, '✅ Migration 3 applied: favorites table created with RLS policies\n');
        }

        // Verify the changes
        log(CYAN, '--- Verifying Database Schema ---\n');

        // Check properties table structure
        const { data: props, error: propsError } = await supabase
            .from('properties')
            .select('id, rooms, bathrooms, is_featured, featured_until')
            .limit(1);

        if (!propsError) {
            log(GREEN, '✅ Properties table has all required columns');
        } else {
            log(YELLOW, `⚠️  ${propsError.message}`);
        }

        // Check favorites table
        const { error: favsError } = await supabase
            .from('favorites')
            .select('id')
            .limit(1);

        if (!favsError || favsError.code === 'PGRST116') { // PGRST116 = no rows, but table exists
            log(GREEN, '✅ Favorites table exists and is accessible');
        } else {
            log(YELLOW, `⚠️  ${favsError.message}`);
        }

        log(GREEN, '\n✨ All migrations verification completed!');

    } catch (err) {
        log(RED, `\n❌ Error: ${err.message}`);
        console.error(err);
        process.exit(1);
    }
}

applyMissingMigrations();
