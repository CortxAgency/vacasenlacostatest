const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xjjkqmjxuemfdnqogkpa.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqamtxbWp4dWVtZmRucW9na3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDEyNDY2OCwiZXhwIjoyMDc5NzAwNjY4fQ.XmaD_cbRL3E6PicTFq8FPe0yptvDi--SofUDG8OmbZc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function checkDatabase() {
    console.log('🔍 Verificando estado de la base de datos...');

    // 1. Verificar tabla properties y sus columnas nuevas
    const { data: props, error: propsError } = await supabase
        .from('properties')
        .select('id, rooms, bathrooms, is_featured, location')
        .limit(1);

    if (propsError) {
        console.log('❌ Error en tabla properties:', propsError.message);
    } else {
        console.log('✅ Tabla properties accesible.');
        // Verificar columnas específicas (si devuelve data, existen, si no, puede que no haya filas pero la query no falló)
        console.log('   Columnas verificadas: rooms, bathrooms, is_featured, location');
    }

    // 2. Verificar tabla favorites
    const { data: favs, error: favsError } = await supabase
        .from('favorites')
        .select('id')
        .limit(1);

    if (favsError) {
        console.log('❌ Tabla favorites NO existe o error:', favsError.message);
    } else {
        console.log('✅ Tabla favorites existe.');
    }

    // 3. Verificar tabla property_images
    const { data: imgs, error: imgsError } = await supabase
        .from('property_images')
        .select('id')
        .limit(1);

    if (imgsError) {
        console.log('❌ Tabla property_images NO existe o error:', imgsError.message);
    } else {
        console.log('✅ Tabla property_images existe.');
    }
}

checkDatabase();
