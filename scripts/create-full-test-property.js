const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xjjkqmjxuemfdnqogkpa.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqamtxbWp4dWVtZmRucW9na3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDEyNDY2OCwiZXhwIjoyMDc5NzAwNjY4fQ.XmaD_cbRL3E6PicTFq8FPe0yptvDi--SofUDG8OmbZc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function createFullTestProperty() {
    console.log('🚀 Creando propiedad de prueba FULL OPTIONS...\n');

    // 1. Obtener usuario de prueba
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'test@vacasenlacosta.com')
        .single();

    if (userError || !users) {
        console.error('❌ Error: No se encontró el usuario test@vacasenlacosta.com');
        return;
    }

    const userId = users.id;

    // 2. Actualizar usuario para que sea "Identidad Verificada"
    await supabase
        .from('users')
        .update({
            is_verified: true,
            is_identity_verified: true,
            subscription_tier: 'premium'
        })
        .eq('id', userId);

    console.log('✅ Usuario actualizado a PREMIUM VERIFICADO');

    // 3. Crear Propiedad
    const propertyData = {
        title: 'Casa de Lujo frente al Mar (TEST AUTOMÁTICO)',
        description: 'Esta es una propiedad de prueba para validar todas las funcionalidades nuevas.\n\nCuenta con vista al mar, piscina climatizada y quincho.',
        price: 2500,
        currency: 'USD',
        operation_type: 'rent',
        address: 'Av. del Mar 1234, Pinamar',
        location: '(-37.1128,-56.8595)', // Pinamar coords
        owner_id: userId,
        rooms: 5,
        bathrooms: 3,
        features: { wifi: true, pool: true, bbq: true, parking: true },
        contact_whatsapp: '1199998888', // WhatsApp personalizado
        contact_email: 'contacto@inmobiliaria-test.com', // Email personalizado
        is_featured: true
    };

    const { data: property, error: propError } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();

    if (propError) {
        console.error('❌ Error creando propiedad:', propError.message);
        return;
    }

    console.log(`✅ Propiedad creada: ${property.title} (ID: ${property.id})`);

    // 4. Agregar Imágenes de prueba
    const images = [
        { property_id: property.id, url: 'https://images.unsplash.com/photo-1600596542815-27bfefd0c3c6?q=80&w=1000&auto=format&fit=crop', order: 0 },
        { property_id: property.id, url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop', order: 1 },
        { property_id: property.id, url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop', order: 2 }
    ];

    const { error: imgError } = await supabase
        .from('property_images')
        .insert(images);

    if (imgError) {
        console.error('❌ Error agregando imágenes:', imgError.message);
    } else {
        console.log('✅ 3 Imágenes agregadas');
    }

    console.log('\n🎉 TEST DATA LISTA!');
    console.log(`🔗 Link: http://localhost:3001/property/${property.id}`);
}

createFullTestProperty();
