# 📊 Análisis Exhaustivo - Vacas en la Costa (Real Estate App)

**Fecha de Análisis:** 2025-11-29  
**Estado Actual:** MVP Code Complete  
**Repositorio:** https://github.com/CortxAgency/vacasenlacostatest

---

## 🏗️ ARQUITECTURA DE LA APLICACIÓN

### Stack Tecnológico
- **Framework:** Next.js 16.0.4 (App Router)
- **React:** 19.2.0
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth (Google OAuth + Magic Link + Password)
- **Almacenamiento:** Cloudflare R2 (S3-compatible)
- **Pagos:** MercadoPago
- **ORM/Cliente DB:** Supabase Client (@supabase/supabase-js)
- **Validación:** Zod 4.1.13
- **UI Components:** Radix UI + Tailwind CSS
- **Animaciones:** Framer Motion
- **Testing:** Playwright
- **Mapa:** Leaflet + React-Leaflet

### Estructura de Directorios
```
RealStateApp/
├── app/                    # Next.js App Router
│   ├── auth/              # Callback OAuth
│   ├── dashboard/         # Mis propiedades
│   ├── edit/[id]/         # Editar propiedad
│   ├── favorites/         # Favoritos del usuario
│   ├── login/             # Login/Registro
│   ├── profile/           # Perfil de usuario
│   ├── property/[id]/     # Detalle propiedad
│   ├── publish/           # Publicar nueva propiedad
│   ├── search/            # Búsqueda de propiedades
│   └── u/[id]/            # Perfil público usuario
├── actions/               # Server Actions
├── components/            # UI Components (30 componentes)
├── lib/                   # Utilidades
├── middleware.ts          # Auth middleware
├── supabase/             # Schemas y migraciones
├── types/                # TypeScript types
└── utils/                # Helpers (Supabase, R2)
```

---

## 🗄️ SCHEMA DE BASE DE DATOS

### Tablas Principales

#### 1. **users** (extends auth.users)
```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'agent', 'admin')),
  whatsapp text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)
```
**RLS Policies:**
- Public read
- Users can insert/update own profile

#### 2. **properties**
```sql
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  currency text DEFAULT 'USD' CHECK (currency IN ('USD', 'ARS')),
  operation_type text NOT NULL CHECK (operation_type IN ('rent', 'sale', 'temporary')),
  location point,  -- PostgreSQL point (lat, lng)
  address text,
  features jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'sold')),
  rooms int DEFAULT 1,          -- Añadido en migración
  bathrooms int DEFAULT 1,      -- Añadido en migración
  is_featured boolean DEFAULT false,     -- Añadido en migración
  featured_until timestamptz,            -- Añadido en migración
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```
**Índices:**
- `idx_properties_featured` on `is_featured`

**RLS Policies:**
- Public read (todos pueden ver propiedades activas)
- Users can CRUD own properties

#### 3. **property_images**
```sql
CREATE TABLE public.property_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  "order" int DEFAULT 0,
  created_at timestamptz DEFAULT now()
)
```
**RLS Policies:**
- Public read
- Users can insert/delete images for own properties

#### 4. **favorites**
```sql
CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, property_id)
)
```
**RLS Policies:**
- Users can view/insert/delete own favorites

### Migraciones Aplicadas
1. `20240523000000_create_favorites.sql` - Tabla de favoritos
2. `20240523000001_add_rooms_bathrooms.sql` - Campos rooms/bathrooms
3. `20240523000002_add_featured.sql` - Sistema de propiedades destacadas

### Trigger: Auto-creación de Usuario
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```
**Función:** Crea automáticamente el perfil en `public.users` cuando un usuario se registra en `auth.users`.

---

## ⚙️ FUNCIONALIDADES IMPLEMENTADAS

### 1. **Autenticación** 🔐
**Métodos soportados:**
- Google OAuth
- Magic Link (OTP sin contraseña)
- Email + Password (Sign up / Sign in)

**Flujo:**
1. Usuario accede a `/login`
2. Elige método de autenticación
3. Callback a `/auth/callback` con code
4. Exchange code por sesión
5. Redirect a dashboard o ruta original

**Middleware de Protección:**
- Rutas protegidas: `/publish`, `/dashboard`, `/edit`, `/profile`
- Redirect a `/login?redirect_to=<ruta>` si no autenticado

### 2. **Gestión de Propiedades** 🏠

#### Publicar Propiedad (`/publish`)
**Workflow:**
1. Usuario llena formulario (título, descripción, precio, tipo operación, dirección, ambientes, baños)
2. Sube imágenes (archivos locales)
3. Al submit:
   - Obtiene presigned URLs de Cloudflare R2
   - Sube imágenes a R2 con `PUT` requests
   - Crea registro en `properties` tabla
   - Inserta URLs de imágenes en `property_images`
4. Redirect a `/dashboard`

**Validación con Zod:**
```typescript
const formSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  price: z.coerce.number().min(1),
  currency: z.enum(['USD', 'ARS']),
  operation_type: z.enum(['rent', 'sale', 'temporary']),
  address: z.string().min(5),
  rooms: z.coerce.number().min(1),
  bathrooms: z.coerce.number().min(1),
})
```

#### Dashboard (`/dashboard`)
- Lista todas las propiedades del usuario actual
- Muestra imagen principal, título, precio
- Botones: Editar, Eliminar, Destacar (con pago MercadoPago)
- Maneja estados de pago (success/failure/pending) con `PaymentStatusHandler`

#### Editar Propiedad (`/edit/[id]`)
- Verifica ownership
- Permite editar todos los campos
- Soporte para agregar/eliminar imágenes

#### Borrar Propiedad
- Verificación de ownership en server action
- Cascade delete automático de imágenes (RLS)

### 3. **Búsqueda y Exploración** 🔍

#### Página de Búsqueda (`/search`)
**Filtros disponibles:**
- Tipo de operación: Alquiler, Venta, Temporal
- Rango de precio (min/max)
- Número de ambientes

**Características:**
- Vista de grilla con tarjetas de propiedades
- Vista de mapa con markers (Leaflet)
- Toggle entre vista lista/mapa
- Filtros en sidebar (desktop) y sheet (mobile)
- Server-side filtering con `getProperties()`

**PropertyCard Features:**
- Imagen con hover para ver segunda foto
- Badge de operación (rent/sale/temporal)
- Badge "Nuevo" si < 7 días
- Badge "Verificado" si usuario verified
- Botón de favorito
- Precio destacado
- Features hardcoded (3 amb, 2 baños, 85 m²) - **⚠️ NO DINÁMICO**

### 4. **Detalle de Propiedad** (`/property/[id]`)
**Elementos:**
- Galería de imágenes tipo grilla premium (imagen principal + 4 thumbnails)
- Información completa (precio, ambientes, baños, descripción)
- Sección de features (WiFi, cocina, etc.)
- Mapa con ubicación
- Sidebar con:
  - Avatar y nombre del propietario
  - Badge verificado
  - Botón WhatsApp con mensaje pre-rellenado
  - Botón de favorito
  - Botón compartir

**SEO:**
- Meta tags dinámicos (Open Graph)
- Title: `{title} | Vacas en la Costa`

### 5. **Sistema de Favoritos** ❤️
**Funcionalidad:**
- Toggle favorito con like button (corazón)
- Página `/favorites` muestra todas las propiedades favoritas
- Usa server actions: `toggleFavorite()`, `getFavoriteStatus()`

### 6. **Perfil de Usuario** 👤
**Funcionalidades:**
- Editar nombre completo
- Editar WhatsApp (con prefijo +54 9)
- Avatar desde OAuth
- Progress bar de completitud del perfil
- Mensaje gamificado "Conviértete en Verificado"
- Badge verificado si `is_verified = true`

### 7. **Monetización - Propiedades Destacadas** 💰

#### Flujo MercadoPago
1. Usuario en Dashboard clickea "Destacar"
2. Server action `createPreference()`:
   - Crea preferencia de pago (ARS 5000)
   - Metadata: `property_id`, `user_id`, `type: 'feature_property'`
   - URLs de callback: success/failure/pending
3. Redirect a MercadoPago checkout
4. Usuario completa pago
5. Redirect a `/dashboard?status=success&property_id={id}`
6. `PaymentStatusHandler` detecta status
7. Llama a `featureProperty()` que:
   - Actualiza `is_featured = true`
   - Set `featured_until = now() + 30 days`
   - Revalidates paths

**⚠️ IMPORTANTE:**
- No hay webhook implementado aún
- No hay verificación real de `payment_id` con MercadoPago API
- Sistema "confiado" basado en query params

### 8. **Cloudflare R2 Storage** ☁️

#### Configuración (utils/r2.ts)
```typescript
export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})
```

#### Workflow de Upload
1. Cliente solicita presigned URL con `getPresignedUrl(fileType, fileSize)`
2. Server genera URL firmada (expira en 1h)
3. Cliente hace `PUT` directo a R2
4. URL pública hardcoded: `https://media.argprop.com/{key}` ⚠️

**Variables necesarias:**
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

**⚠️ PROBLEMAS IDENTIFICADOS:**
- URL pública hardcoded `media.argprop.com` no configurado
- No hay custom domain configurado en R2
- Las imágenes no serán accesibles públicamente sin configurar R2 public bucket o cloudflare worker

---

## 🔄 USER WORKFLOW COMPLETO

### Flujo Usuario Buscador
```
1. Landing Page (/) 
   ↓ Click "Buscar Alquiler" o "Comprar Propiedad"
2. Search Page (/search?op=rent)
   ↓ Aplica filtros
   ↓ Ve lista/mapa de propiedades
   ↓ Click en propiedad
3. Property Detail (/property/[id])
   ↓ Ve galería, features, ubicación
   ↓ Agrega a favoritos (requiere login)
   ↓ Click "Contactar por WhatsApp"
4. WhatsApp (externo)
   → Conversación con propietario
```

### Flujo Usuario Propietario
```
1. Login/Registro (/login)
   ↓ OAuth Google, Magic Link, o Password
2. Dashboard (/dashboard)
   ↓ Click "Nueva Propiedad"
3. Publish Page (/publish)
   ↓ Llena formulario
   ↓ Sube imágenes
   ↓ Submit
4. Dashboard (/dashboard)
   ↓ Ve propiedad publicada
   ↓ [OPCIONAL] Click "Destacar"
5. MercadoPago Checkout
   ↓ Completa pago
6. Dashboard (/dashboard)
   → Propiedad ahora destacada (featured badge)
```

---

## 🚨 EDGE CASES Y PROBLEMAS IDENTIFICADOS

### 🔴 CRÍTICOS

#### 1. **R2 Cloudflare - URLs Públicas No Configuradas**
**Problema:** 
- En `publish/page.tsx` línea 101: `const publicUrl = https://media.argprop.com/${key}`
- Este dominio NO está configurado
- Las imágenes subidas a R2 no serán accesibles

**Solución Necesaria:**
- Configurar custom domain en Cloudflare R2
- O usar R2.dev subdomain público
- O crear Cloudflare Worker para servir archivos

#### 2. **MercadoPago Webhooks No Implementados**
**Problema:**
- Línea 57 de `mercadopago.ts` tiene comentado el webhook URL
- No hay endpoint `/api/webhooks/mercadopago`
- El sistema confía en query params del redirect

**Riesgo:**
- Usuario podría manipular URL para activar destacado sin pagar
- No hay validación contra API de MercadoPago

**Solución Necesaria:**
- Crear API route `/api/webhooks/mercadopago`
- Implementar verificación de firma
- Verificar `payment_id` contra MercadoPago API

#### 3. **Property Card con Features Hardcoded**
**Problema:**
- En `property-card.tsx` líneas 119-130
- Muestra siempre "3 Amb, 2 Baños, 85 m²" sin importar los datos reales

**Solución:**
```tsx
<span className="text-xs font-medium text-muted-foreground">
  {property.rooms || 1} Amb
</span>
```

#### 4. **Schema Desactualizado en Supabase**
**Problema:**
- El archivo `supabase/schema.sql` NO incluye:
  - Campos `rooms`, `bathrooms`
  - Campos `is_featured`, `featured_until`
  - Tabla `favorites`
  - Campos `city`, `state`, `zip_code`, `country` (que están en types.ts)

**Solución:**
- Aplicar las migraciones al schema principal
- O regenerar schema desde DB activa

#### 5. **TypeScript Types vs Database Mismatch**
**Problema:**
- `types/types.ts` define:
```typescript
interface Property {
  city: string
  state: string
  zip_code: string
  country: string
  latitude?: number
  longitude?: number
  is_active: boolean  // No existe en DB
}
```
- Estos campos NO existen en la tabla `properties` real

**Solución:**
- Agregar campos a DB o eliminar de types
- Usar solo `location` point para coordenadas

### ⚠️ ADVERTENCIAS

#### 6. **Ubicación/Mapa Placeholder**
**Problema:**
- En `property.ts` línea 62: `location: '(0,0)'` hardcoded
- No hay integración con geocoding API
- El mapa en property detail usa fallback a Mar del Plata

**Solución:**
- Integrar Google Geocoding API o similar
- Convertir dirección a coordenadas en el publish flow

#### 7. **Falta Búsqueda por Texto/Ciudad**
**Problema:**
- El search input en `/search` no hace nada
- Solo se filtran por tipo operación, precio, rooms

**Solución:**
- Agregar campo `city` a properties
- Implementar full-text search en título/descripción/dirección

#### 8. **No Hay Página de Usuario Público**
**Problema:**
- `/u/[id]/page.tsx` existe pero falta implementación

**Solución:**
- Crear página que muestre:
  - Perfil del usuario
  - Lista de sus propiedades publicadas
  - Ratings/reviews (futuro)

#### 9. **No Hay Gestión de Imágenes en Edit**
**Problema:**
- `edit-form.tsx` existe pero no vi implementación de manejo de imágenes
- Usuario no puede eliminar/reordenar fotos después de publicar

#### 10. **Falta Validación de Formato WhatsApp**
**Problema:**
- Solo valida largo mínimo
- No valida formato argentino real

**Regex sugerido:**
```typescript
whatsapp: z.string().regex(/^(?:11|2[2-9]|3[0-9]|4[0-9]|5[0-9])[0-9]{8}$/)
```

#### 11. **No Hay Rate Limiting**
**Problema:**
- API routes sin protección contra abuso
- Posible spam de publicaciones/favoritos

**Solución:**
- Implementar rate limiting (Upstash, Redis)

#### 12. **Falta Mobile Image Upload**
**Problema:**
- Input de tipo file puede tener problemas en mobile
- No hay compresión de imágenes antes de subir

**Solución:**
- Implementar compresión client-side
- Usar libraries como `browser-image-compression`

### ℹ️ MEJORAS SUGERIDAS

#### 13. **SEO Incompleto**
- Falta sitemap dinámico con todas las propiedades
- Falta robots.txt con reglas
- No hay schema markup (JSON-LD) para Rich Results

#### 14. **Analytics No Implementados**
- No hay Google Analytics
- No hay tracking de conversiones
- No hay heatmaps

#### 15. **Testing Incompleto**
- Hay Playwright config pero tests básicos
- No hay tests E2E del flujo completo
- No hay tests unitarios

#### 16. **No Hay Sistema de Mensajería Interno**
- Todo depende de WhatsApp externo
- No hay historial de conversaciones
- No hay notificaciones

#### 17. **Falta Sistema de Reviews/Ratings**
- No hay manera de calificar propiedades
- No hay reviews de usuarios

---

## ✅ CHECKLIST PARA FINALIZACIÓN

### 🔴 CRÍTICO (Bloqueante para producción)
- [ ] **Configurar R2 Custom Domain o Worker**
  - [ ] Crear worker en Cloudflare para servir imágenes
  - [ ] Actualizar `publicUrl` en publish.tsx
  - [ ] Probar upload completo end-to-end

- [ ] **Implementar MercadoPago Webhooks**
  - [ ] Crear `/app/api/webhooks/mercadopago/route.ts`
  - [ ] Verificar firma del webhook
  - [ ] Validar `payment_id` contra API MP
  - [ ] Actualizar `is_featured` solo si pago approved

- [ ] **Sincronizar Schema de DB**
  - [ ] Aplicar las 3 migraciones al schema principal
  - [ ] Agregar campos faltantes o limpiar types.ts

- [ ] **Variables de Entorno en Vercel**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `MP_ACCESS_TOKEN` (producción)
  - [ ] `R2_ACCOUNT_ID`
  - [ ] `R2_ACCESS_KEY_ID`
  - [ ] `R2_SECRET_ACCESS_KEY`
  - [ ] `R2_BUCKET_NAME`
  - [ ] `NEXT_PUBLIC_BASE_URL`

- [ ] **Fix PropertyCard Features**
  - [ ] Usar `property.rooms`, `property.bathrooms` reales
  - [ ] Agregar campo `surface_m2` a DB si se quiere mostrar

### ⚠️ IMPORTANTE (Pre-lanzamiento)
- [ ] **Configurar Google OAuth en Producción**
  - [ ] Crear proyecto en Google Cloud Console
  - [ ] Configurar redirect URIs
  - [ ] Actualizar Supabase Auth con credenciales

- [ ] **Desactivar Email Confirmation** (opcional)
  - [ ] Supabase Dashboard → Auth → Email → Disable confirmation

- [ ] **Implementar Geocoding**
  - [ ] Elegir API (Google, Mapbox, etc.)
  - [ ] Convertir dirección a coordenadas en publish
  - [ ] Actualizar campo `location` correctamente

- [ ] **Agregar Búsqueda por Texto**
  - [ ] Agregar campo `city` a properties
  - [ ] Implementar text search en `getProperties()`
  - [ ] Conectar search input en /search

- [ ] **Completar Edit Form**
  - [ ] Permitir eliminar imágenes
  - [ ] Permitir reordenar imágenes
  - [ ] Permitir agregar nuevas imágenes

- [ ] **Tests de Humo**
  - [ ] Registro de usuario
  - [ ] Publicar propiedad
  - [ ] Búsqueda y filtros
  - [ ] Pago MercadoPago sandbox

### 📈 MEJORAS POST-LAUNCH
- [ ] Implementar página de usuario público `/u/[id]`
- [ ] Sistema de reviews/ratings
- [ ] Sistema de mensajería interna
- [ ] Notificaciones push/email
- [ ] Panel admin para moderar
- [ ] Analytics (Google Analytics, Hotjar)
- [ ] SEO avanzado (schema markup, sitemap dinámico)
- [ ] Rate limiting
- [ ] Compresión de imágenes client-side
- [ ] Tests E2E completos
- [ ] Internacionalización (i18n)

---

## 📦 DEPENDENCIES IMPORTANTES

### Production
- `@supabase/supabase-js` - Cliente DB
- `@aws-sdk/client-s3` - R2 uploads
- `mercadopago` - Pagos
- `leaflet` - Mapas
- `framer-motion` - Animaciones
- `zod` - Validación
- `react-hook-form` - Formularios

### Dev
- `@playwright/test` - Testing E2E
- `typescript` - Type safety
- `tailwindcss` - Styling

---

## 🎯 CONCLUSIÓN

### Estado Actual: **MVP Funcional con Gaps Críticos**

**Lo que FUNCIONA:**
✅ Autenticación completa (Google, Magic Link, Password)
✅ CRUD de propiedades
✅ Sistema de favoritos
✅ Búsqueda con filtros básicos
✅ UI/UX premium con animaciones
✅ RLS correctamente implementado
✅ Middleware de protección de rutas

**Lo que NECESITA ATENCIÓN URGENTE:**
🔴 R2 URLs públicas no configuradas → **Bloqueante**
🔴 MercadoPago sin webhooks → **Riesgo de fraude**
🔴 Schema desactualizado → **Confusión en desarrollo**
🔴 PropertyCard con datos hardcoded → **Mala UX**
🟡 Ubicación sin geocoding → **Mapas inútiles**
🟡 Búsqueda por texto faltante → **Funcionalidad core incompleta**

**Tiempo estimado para Production-Ready:** 
- Con urgencia: **3-5 días** (solo críticos)
- Con mejoras importantes: **1-2 semanas**
- Con post-launch features: **1 mes**

**Prioridad #1:** Resolver integración de R2 Cloudflare para que las imágenes funcionen.
