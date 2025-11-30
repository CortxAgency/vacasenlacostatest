# 🔍 Análisis de Problemas Identificados

**Fecha:** 29 Nov 2025 19:21  
**Prioridad:** ALTA - Afectan UX core

---

## 1️⃣ CUENTAS Y FEATURES

### Estado Actual:
```sql
-- Tabla users actual
id, email, full_name, avatar_url, role, whatsapp, is_verified, created_at
```

### ❌ Problemas:
- **Falta sistema de suscripciones/planes** (free, basic, premium)
- **No hay límite de publicaciones** por tipo de cuenta
- **No hay tracking de features activas** (destacados, boost, etc.)
- **Falta fecha de expiración** de beneficios

### ✅ Solución:
Agregar columnas:
- `subscription_tier` (free, basic, premium)
- `subscription_expires_at`
- `max_listings` (límite según plan)
- `listings_count` (contador actual)

---

## 2️⃣ WHATSAPP EN PUBLICACIONES

### ❌ Problema Detectado:
El código SÍ muestra WhatsApp (línea 230-236 en property/[id]/page.tsx):
```tsx
{property.users?.whatsapp ? (
    <Button>Contactar por WhatsApp</Button>
) : (
    <Button disabled>Sin contacto disponible</Button>
)}
```

**PERO:**
- WhatsApp está en la tabla `users` (global)
- NO se puede personalizar por publicación
- NO hay opción de enviar email alternativo
- La plantilla de WhatsApp es muy básica

### ✅ Solución:
1. **Agregar `contact_whatsapp` a tabla `properties`** (opcional, override del perfil)
2. **Agregar `contact_email` a tabla `properties`**
3. **Botón de email alternativo** si no hay WhatsApp
4. **Mejorar plantilla de WhatsApp** con más detalles de la propiedad

---

## 3️⃣ MAPA NO MUESTRA UBICACIÓN

### ❌ Problema:
En `PropertyMapWrapper`, el código hace:
```tsx
center={property.location ? undefined : [-38.0055, -57.5426]}
```

Esto significa que si hay `location`, **NO** define el centro manualmente.

### Causa Potencial:
- La columna `location` en DB es tipo `text` (ej: "(lat,lng)")
- El componente `PropertyMap` espera un objeto `{lat, lng}`
- **Falta parsear** el string al objeto

### ✅ Solución:
Crear helper que parsee `location` de string a coordenadas:
```typescript
function parseLocation(location: string | null) {
  if (!location) return null
  const parts = location.replace(/[()]/g, '').split(',')
  return { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) }
}
```

---

## 4️⃣ VERIFICACIÓN POR FASES

### ❌ Problema:
Actualmente `is_verified` es un solo boolean que se usa para:
- Mostrar badge "Verificado"
- Dar credibilidad

**Pero:**
- TODO usuario registrado aparece como "verificado"
- NO hay distinción entre "usuario común" y "usuario con identidad verificada"

### ✅ Solución Propuesta:
**Sistema de 3 niveles:**

1. **Nivel 1: Registrado** (`is_verified = false`)
   - Badge: Ninguno o "Nuevo"
   - Puede publicar
   
2. **Nivel 2: Email Verificado** (`is_verified = true`)
   - Badge: "✓ Cuenta Verificada"
   - Aparece en todas las cuentas normales
   
3. **Nivel 3: Identidad Verificada** (`is_identity_verified = true`)
   - Badge: "🛡️ Identidad Verificada"
   - Requiere validación manual/documento
   - Mayor confianza

**Implementación:**
- Agregar columna `is_identity_verified` (boolean, default false)
- Agregar columna `verified_at` (timestamp)
- Crear proceso de verificación de identidad (admin o automático con API)

---

## 📊 Prioridad de Implementación

### 🔴 URGENTE (Hoy):
1. ✅ WhatsApp personalizado por publicación
2. ✅ Parseo de ubicación en mapa
3. ✅ Botón de email alternativo

### 🟡 IMPORTANTE (Esta semana):
4. ⚠️ Sistema de verificación de identidad
5. ⚠️ Planes de suscripción

### 🟢 NICE TO HAVE (Backlog):
6. 📧 Plantilla de email mejorada
7. 📊 Dashboard de analytics

---

## 🛠️ Archivos a Modificar

1. **Schema SQL**: `supabase/schema.sql`
   - Agregar `contact_whatsapp`, `contact_email` a properties
   - Agregar `is_identity_verified` a users
   
2. **Types**: `types/types.ts`
   - Actualizar interface Property
   - Actualizar interface User

3. **Property Detail**: `app/property/[id]/page.tsx`
   - Parsear location
   - Mostrar WhatsApp personalizado o email
   
4. **Publish Form**: `app/publish/page.tsx`
   - Agregar campos de contacto opcionales

---

*Por: AI Assistant - Análisis basado en revisión de código*
