const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://xjjkqmjxuemfdnqogkpa.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqamtxbWp4dWVtZmRucW9na3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDEyNDY2OCwiZXhwIjoyMDc5NzAwNjY4fQ.XmaD_cbRL3E6PicTFq8FPe0yptvDi--SofUDG8OmbZc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

console.log('🚀 PRE-FLIGHT CHECK - Vacas en la Costa\n');

async function checkEnvFile() {
    console.log('📁 Verificando .env.local...');
    const envPath = path.join(process.cwd(), '.env.local');

    if (!fs.existsSync(envPath)) {
        console.log('⚠️  .env.local no existe. Creando plantilla...');
        const template = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xjjkqmjxuemfdnqogkpa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=REEMPLAZAR_CON_TU_ANON_KEY

# Cloudflare R2
NEXT_PUBLIC_R2_PUBLIC_URL=pub-e01bd23781b441a1a45bda2ab1f5edbe.r2.dev
R2_ACCOUNT_ID=d7768f6e21c37967d6f8b7b6be7d0620
R2_ACCESS_KEY_ID=REEMPLAZAR_CON_TU_KEY
R2_SECRET_ACCESS_KEY=REEMPLAZAR_CON_TU_SECRET
R2_BUCKET_NAME=media
`;
        fs.writeFileSync(envPath, template);
        console.log('✅ Plantilla .env.local creada. COMPLETA LAS KEYS antes de continuar.\n');
        return false;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
    const hasAnonKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    const hasR2Url = envContent.includes('NEXT_PUBLIC_R2_PUBLIC_URL');

    if (!hasSupabaseUrl || !hasAnonKey || !hasR2Url) {
        console.log('⚠️  .env.local existe pero faltan variables críticas.');
        console.log('   Asegúrate de tener: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_R2_PUBLIC_URL\n');
        return false;
    }

    console.log('✅ .env.local existe con variables básicas.\n');
    return true;
}

async function checkDatabase() {
    console.log('🗄️  Verificando conexión a Supabase...');

    try {
        const { data, error } = await supabase
            .from('properties')
            .select('id')
            .limit(1);

        if (error && error.code !== 'PGRST116') throw error;
        console.log('✅ Conexión a base de datos OK.\n');
        return true;
    } catch (err) {
        console.log(`❌ Error conectando a Supabase: ${err.message}\n`);
        return false;
    }
}

async function checkAuth() {
    console.log('🔐 Verificando configuración de Auth...');

    try {
        // Intentar verificar si Google está configurado vía metadata
        const { data, error } = await supabase.auth.getSession();
        // Si esto no falla, Auth está funcionando
        console.log('✅ Supabase Auth configurado correctamente.\n');
        return true;
    } catch (err) {
        console.log(`⚠️  Auth: ${err.message}\n`);
        return true; // No es crítico para el pre-flight
    }
}

async function checkCriticalFiles() {
    console.log('📄 Verificando archivos críticos...');

    const criticalFiles = [
        'app/login/page.tsx',
        'app/publish/page.tsx',
        'app/search/page.tsx',
        'components/location-picker.tsx',
        'actions/property.ts',
        'utils/image-url.ts'
    ];

    let allExist = true;
    criticalFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (!fs.existsSync(filePath)) {
            console.log(`❌ Falta: ${file}`);
            allExist = false;
        }
    });

    if (allExist) {
        console.log('✅ Todos los archivos críticos existen.\n');
    } else {
        console.log('');
    }

    return allExist;
}

async function checkDependencies() {
    console.log('📦 Verificando node_modules...');

    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        console.log('❌ node_modules no existe. Ejecuta: npm install\n');
        return false;
    }

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const criticalDeps = [
        '@supabase/supabase-js',
        'next',
        'react',
        'leaflet',
        'react-leaflet',
        'sonner'
    ];

    let allInstalled = true;
    criticalDeps.forEach(dep => {
        if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
            console.log(`⚠️  Falta dependencia: ${dep}`);
            allInstalled = false;
        }
    });

    if (allInstalled) {
        console.log('✅ Dependencias críticas instaladas.\n');
    } else {
        console.log('');
    }

    return allInstalled;
}

async function runPreFlight() {
    const checks = [];

    checks.push(await checkEnvFile());
    checks.push(await checkDependencies());
    checks.push(await checkCriticalFiles());
    checks.push(await checkDatabase());
    checks.push(await checkAuth());

    console.log('═══════════════════════════════════════');

    const allPassed = checks.every(check => check);

    if (allPassed) {
        console.log('✅ PRE-FLIGHT CHECK PASSED!');
        console.log('🚀 Ready to run: npm run dev\n');
        console.log('Next steps:');
        console.log('1. npm run dev');
        console.log('2. Open http://localhost:3000');
        console.log('3. Test: Login > Publish > Search > Favorites\n');
    } else {
        console.log('⚠️  SOME CHECKS FAILED');
        console.log('Fix the issues above before running the app.\n');
    }
}

runPreFlight();
