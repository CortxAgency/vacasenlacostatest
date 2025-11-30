# 🔑 Configuración de Variables de Entorno

Para que la aplicación funcione, necesitas crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

## 📋 Variables Requeridas

### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xjjkqmjxuemfdnqogkpa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[TU_ANON_KEY]
```

**¿Dónde encontrar la ANON_KEY?**
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/xjjkqmjxuemfdnqogkpa)
2. Settings > API
3. Copia la key que dice "anon" o "public"

### Cloudflare R2
```bash
NEXT_PUBLIC_R2_PUBLIC_URL=pub-e01bd23781b441a1a45bda2ab1f5edbe.r2.dev
R2_ACCOUNT_ID=d7768f6e21c37967d6f8b7b6be7d0620
R2_BUCKET_NAME=media
R2_ACCESS_KEY_ID=[TU_R2_KEY]
R2_SECRET_ACCESS_KEY=[TU_R2_SECRET]
```

**¿Dónde encontrar las keys de R2?**
1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. R2 > Manage R2 API Tokens
3. Si no tienes un token, créalo con permisos de "Admin Read & Write"
4. Copia el Access Key ID y Secret Access Key

## Service Role (Opcional - solo para scripts)
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqamtxbWp4dWVtZmRucW9na3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDEyNDY2OCwiZXhwIjoyMDc5NzAwNjY4fQ.XmaD_cbRL3E6PicTFq8FPe0yptvDi--SofUDG8OmbZc
```

---

## ⚠️ IMPORTANTE

**NO** subas el archivo `.env.local` a Git. Ya está en `.gitignore` por seguridad.

---

## ✅ Verificación

Una vez configurado, ejecuta:
```bash
node scripts/pre-flight.js
```

Si todo está bien, verás: ✅ PRE-FLIGHT CHECK PASSED!
