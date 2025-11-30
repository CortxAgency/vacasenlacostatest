const fs = require('fs');
const path = require('path');

console.log('🔧 Generando archivo .env.local...\n');

const envContent = `# ================================
# Vacas en la Costa - Environment Variables
# Auto-generated: ${new Date().toISOString()}
# ================================

# ---- SUPABASE ----
NEXT_PUBLIC_SUPABASE_URL=https://xjjkqmjxuemfdnqogkpa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqamtxbWp4dWVtZmRucW9na3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMjQ2NjgsImV4cCI6MjA3OTcwMDY2OH0.NhA8IWjB8wuSEtpM_okk05cE-HxSclpy9BaHy1NRWsg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqamtxbWp4dWVtZmRucW9na3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDEyNDY2OCwiZXhwIjoyMDc5NzAwNjY4fQ.XmaD_cbRL3E6PicTFq8FPe0yptvDi--SofUDG8OmbZc

# ---- CLOUDFLARE R2 ----
NEXT_PUBLIC_R2_PUBLIC_URL=pub-e01bd23781b441a1a45bda2ab1f5edbe.r2.dev
R2_ACCOUNT_ID=d7768f6e21c37967d6f8b7b6be7d0620
R2_BUCKET_NAME=media

# IMPORTANTE: Completa estas dos variables con tus credenciales de Cloudflare R2
# Si no las tienes, ve a: Cloudflare Dashboard > R2 > Manage R2 API Tokens
R2_ACCESS_KEY_ID=PENDIENTE_CONFIGURAR
R2_SECRET_ACCESS_KEY=PENDIENTE_CONFIGURAR
`;

const envPath = path.join(process.cwd(), '.env.local');

try {
    // Verificar si ya existe
    if (fs.existsSync(envPath)) {
        console.log('⚠️  .env.local ya existe. Creando backup...');
        const backupPath = path.join(process.cwd(), '.env.local.backup');
        fs.copyFileSync(envPath, backupPath);
        console.log(`✅ Backup guardado en: .env.local.backup\n`);
    }

    // Escribir el nuevo archivo
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local creado exitosamente!\n');
    console.log('📝 Variables configuradas:');
    console.log('   ✅ NEXT_PUBLIC_SUPABASE_URL');
    console.log('   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('   ✅ NEXT_PUBLIC_R2_PUBLIC_URL');
    console.log('   ⚠️  R2_ACCESS_KEY_ID (pendiente)');
    console.log('   ⚠️  R2_SECRET_ACCESS_KEY (pendiente)');
    console.log('\n⚡ La app funcionará PARCIALMENTE sin las keys de R2.');
    console.log('   (Login/Auth/Búsqueda funcionan, Publicar fotos NO)\n');
    console.log('🚀 Puedes correr: npm run dev\n');

} catch (error) {
    console.error('❌ Error creando .env.local:', error.message);
    process.exit(1);
}
