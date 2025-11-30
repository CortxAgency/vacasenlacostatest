const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xjjkqmjxuemfdnqogkpa.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqamtxbWp4dWVtZmRucW9na3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDEyNDY2OCwiZXhwIjoyMDc5NzAwNjY4fQ.XmaD_cbRL3E6PicTFq8FPe0yptvDi--SofUDG8OmbZc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function fixDatabase() {
    console.log('🔧 Iniciando reparación de base de datos...');

    const sql = `
    -- Agregar columnas faltantes a properties
    ALTER TABLE public.properties 
    ADD COLUMN IF NOT EXISTS rooms int DEFAULT 1,
    ADD COLUMN IF NOT EXISTS bathrooms int DEFAULT 1,
    ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS featured_until timestamptz,
    ADD COLUMN IF NOT EXISTS location text DEFAULT '(0,0)';

    -- Actualizar filas existentes
    UPDATE public.properties SET rooms = 1 WHERE rooms IS NULL;
    UPDATE public.properties SET bathrooms = 1 WHERE bathrooms IS NULL;
    UPDATE public.properties SET location = '(0,0)' WHERE location IS NULL;

    -- Crear índice para featured
    CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(is_featured);
  `;

    // Ejecutar SQL vía RPC (si está habilitado) o intentar inyección directa si es posible (limitado)
    // Nota: La API de JS estándar no permite DDL (ALTER TABLE) directamente sin una función RPC 'exec_sql'.
    // Vamos a intentar llamar a una función RPC común si existe, o usar la API REST de Supabase para SQL si está disponible.

    // Intento 1: Usar endpoint SQL de PostgREST (no suele estar expuesto públicamente).
    // Intento 2: Asumir que existe la función 'exec_sql' (común en setups de Supabase).

    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
        console.log('⚠️ Error ejecutando vía RPC:', error.message);
        console.log('   (Es probable que la función exec_sql no exista en tu DB).');
        console.log('   Sin acceso al Dashboard SQL Editor, no podemos alterar la estructura de la tabla vía API JS estándar.');
    } else {
        console.log('✅ Migración aplicada exitosamente.');
    }
}

fixDatabase();
