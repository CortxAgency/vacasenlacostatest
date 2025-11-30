# 🚀 GUÍA DE DESPLIEGUE FINAL - Vacas en la Costa

**Estado:** LISTO PARA PRODUCCIÓN (Production Ready)
**Fecha:** 29 Nov 2025

---

## 1. Verificación de Base de Datos
Asegúrate de haber ejecutado el script SQL de migración en Supabase.
Si no lo hiciste, ve al SQL Editor de Supabase y ejecuta:

```sql
-- Agregar campos de contacto
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS contact_whatsapp text,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS contact_preference text DEFAULT 'whatsapp';

-- Agregar verificación de identidad
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_identity_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at timestamptz;
```

## 2. Variables de Entorno (Vercel)
Al desplegar en Vercel, asegúrate de configurar estas variables (copiar de `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_R2_PUBLIC_URL`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

## 3. Funcionalidades Nuevas Habilitadas
- **Contacto Personalizado:** Al publicar, ahora puedes poner un WhatsApp diferente al de tu perfil.
- **Mapa Exacto:** La ubicación se guarda y muestra con precisión.
- **Verificación:** El sistema soporta badges de "Identidad Verificada" (manejado por admin en DB).
- **Email Alternativo:** Si no tienes WhatsApp, los usuarios pueden enviarte un email directo.

## 4. Testing Final Recomendado
1. Publicar una propiedad con fotos y ubicación en el mapa.
2. Verificar que en el detalle de la propiedad aparezca el mapa centrado.
3. Probar el botón de WhatsApp (debe abrir con el mensaje pre-llenado).
4. Verificar que el badge de usuario aparezca correctamente.

¡Tu aplicación está lista para recibir usuarios reales! 🚀
