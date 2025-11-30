const fs = require('fs');
const path = require('path');

console.log('🔧 Actualizando .env.local con credenciales de R2...\n');

const envPath = path.join(process.cwd(), '.env.local');

// Backup first
if (fs.existsSync(envPath)) {
    const backupPath = path.join(process.cwd(), '.env.local.backup2');
    fs.copyFileSync(envPath, backupPath);
    console.log('✅ Backup guardado en: .env.local.backup2\n');
}

const envContent = `# ================================
# Vacas en la Costa - Environment Variables
# Actualizado: ${new Date().toISOString()}
# ================================

# ---- SUPABASE ----
NEXT_PUBLIC_SUPABASE_URL=https://xjjkqmjxuemfdnqogkpa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqamtxbWp4dWVtZmRucW9na3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMjQ2NjgsImV4cCI6MjA3OTcwMDY2OH0.NhA8IWjB8wuSEtpM_okk05cE-HxSclpy9BaHy1NRWsg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqamtxbWp4dWVtZmRucW9na3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDEyNDY2OCwiZXhwIjoyMDc5NzAwNjY4fQ.XmaD_cbRL3E6PicTFq8FPe0yptvDi--SofUDG8OmbZc

# ---- CLOUDFLARE R2 ----
NEXT_PUBLIC_R2_PUBLIC_URL=pub-e01bd23781b441a1a45bda2ab1f5edbe.r2.dev
R2_ACCOUNT_ID=d7768f6e21c37967d6f8b7b6be7d0620
R2_BUCKET_NAME=media
R2_ACCESS_KEY_ID=e1c98b057ee4a34708bd425c4f30531f
R2_SECRET_ACCESS_KEY=1cc6e9f24d304d16bb5f625406d028a2d3b6491c1195270a03d71de996d12b91
`;

fs.writeFileSync(envPath, envContent);

console.log('✅ .env.local actualizado con TODAS las credenciales!\n');
console.log('📝 Variables configuradas:');
console.log('   ✅ NEXT_PUBLIC_SUPABASE_URL');
console.log('   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('   ✅ NEXT_PUBLIC_R2_PUBLIC_URL');
console.log('   ✅ R2_ACCESS_KEY_ID');
console.log('   ✅ R2_SECRET_ACCESS_KEY');
console.log('\n⚡ IMPORTANTE: Reinicia el dev server para que tome los cambios:');
console.log('   1. Ctrl+C (detener servidor actual)');
console.log('   2. npm run dev\n');
console.log('🚀 Ahora SÍ puedes subir imágenes!\n');
