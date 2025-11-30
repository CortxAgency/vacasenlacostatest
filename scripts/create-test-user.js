const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xjjkqmjxuemfdnqogkpa.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqamtxbWp4dWVtZmRucW9na3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDEyNDY2OCwiZXhwIjoyMDc5NzAwNjY4fQ.XmaD_cbRL3E6PicTFq8FPe0yptvDi--SofUDG8OmbZc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createTestUser() {
    console.log('👤 Creando usuario de prueba...\n');

    const testEmail = 'test@vacasenlacosta.com';
    const testPassword = 'Test123456!';

    try {
        // Crear usuario con email + password
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email: testEmail,
            password: testPassword,
            email_confirm: true, // Auto-confirmar para evitar esperar el email
            user_metadata: {
                full_name: 'Usuario de Prueba'
            }
        });

        if (userError) {
            if (userError.message.includes('already registered')) {
                console.log('⚠️  El usuario ya existe. Puedes usar las credenciales:\n');
                console.log('   Email: test@vacasenlacosta.com');
                console.log('   Password: Test123456!\n');
                return;
            }
            throw userError;
        }

        console.log('✅ Usuario creado exitosamente!\n');
        console.log('📧 Email: test@vacasenlacosta.com');
        console.log('🔑 Password: Test123456!\n');

        // Crear perfil en la tabla users
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: userData.user.id,
                email: testEmail,
                full_name: 'Usuario de Prueba',
                whatsapp: '1112345678',
                created_at: new Date().toISOString()
            });

        if (profileError && !profileError.message.includes('duplicate')) {
            console.log('⚠️  Error creando perfil (puede que ya exista):', profileError.message);
        } else {
            console.log('✅ Perfil creado en tabla users');
        }

        console.log('\n🎯 Ahora puedes entrar en: http://localhost:3001/login');
        console.log('   Selecciona "Contraseña" y usa las credenciales de arriba.\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createTestUser();
