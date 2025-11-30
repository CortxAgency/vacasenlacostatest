# 🛠️ Plan de Acción para Finalización - Vacas en la Costa

**Fecha:** 2025-11-29  
**Objetivo:** Llevar la app de MVP Code Complete a Production Ready  
**Tiempo estimado total:** 5-7 días laborables

---

## 📋 FASE 1: BLOQUEANTES CRÍTICOS (Días 1-2)

### 🔴 TAREA 1: Configurar Cloudflare R2 para URLs Públicas
**Problema:** Las imágenes subidas no son accesibles públicamente

**Opciones:**

#### Opción A: Custom Domain (Recomendado para producción)
1. **En Cloudflare Dashboard:**
   - Ve a R2 → Settings
   - Agrega custom domain: `media.vacasenlacosta.com`
   - Configura DNS CNAME

2. **Actualizar código:**
```typescript
// app/publish/page.tsx línea 101
const publicUrl = `https://media.vacasenlacosta.com/${key}`
```

3. **Variables de entorno:**
```bash
R2_PUBLIC_DOMAIN=media.vacasenlacosta.com
```

#### Opción B: R2.dev Subdomain (Rápido para staging)
1. **En Cloudflare Dashboard:**
   - Ve a R2 → Buckets → Tu bucket
   - Settings → Public access
   - Habilita "Allow access via r2.dev subdomain"
   - Copia URL: `pub-xxxxxxxx.r2.dev`

2. **Actualizar código:**
```typescript
// app/publish/page.tsx
const publicUrl = `https://${process.env.NEXT_PUBLIC_R2_DEV_URL}/${key}`
```

3. **Variables de entorno:**
```bash
NEXT_PUBLIC_R2_DEV_URL=pub-xxxxxxxx.r2.dev
```

#### Opción C: Cloudflare Worker (Más control)
1. **Crear worker:**
```javascript
// workers/r2-proxy.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const key = url.pathname.slice(1)
    
    const object = await env.R2_BUCKET.get(key)
    if (!object) return new Response('Not Found', { status: 404 })
    
    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('cache-control', 'public, max-age=31536000')
    
    return new Response(object.body, { headers })
  }
}
```

2. **Deploy worker:**
```bash
npx wrangler publish
```

3. **Configurar ruta:**
   - Worker route: `media.vacasenlacosta.com/*`

**Tiempo estimado:** 4-8 horas  
**Prioridad:** 🔴 CRÍTICA

---

### 🔴 TAREA 2: Implementar MercadoPago Webhooks

#### Paso 1: Crear API Route para Webhooks
**Archivo:** `app/api/webhooks/mercadopago/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { featureProperty } from '@/actions/feature-property'
import { MercadoPagoConfig, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 1. Verificar firma (x-signature)
    const xSignature = request.headers.get('x-signature')
    const xRequestId = request.headers.get('x-request-id')
    
    if (!verifyWebhookSignature(body, xSignature, xRequestId)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    
    // 2. Extraer data
    const { type, data } = body
    
    if (type === 'payment') {
      const paymentId = data.id
      
      // 3. Consultar pago a MercadoPago API
      const payment = new Payment(client)
      const paymentData = await payment.get({ id: paymentId })
      
      // 4. Verificar status
      if (paymentData.status === 'approved') {
        const propertyId = paymentData.metadata?.property_id
        
        if (propertyId) {
          // 5. Destacar propiedad
          await featureProperty(propertyId)
          
          console.log(`✅ Property ${propertyId} featured after payment ${paymentId}`)
        }
      }
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

function verifyWebhookSignature(
  body: any,
  xSignature: string | null,
  xRequestId: string | null
): boolean {
  if (!xSignature || !xRequestId) return false
  
  const parts = xSignature.split(',')
  const tsHeader = parts.find(p => p.startsWith('ts='))?.split('=')[1]
  const v1Header = parts.find(p => p.startsWith('v1='))?.split('=')[1]
  
  const secret = process.env.MP_WEBHOOK_SECRET!
  const manifest = `id:${body.data.id};request-id:${xRequestId};ts:${tsHeader};`
  
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(manifest)
  const sha = hmac.digest('hex')
  
  return sha === v1Header
}
```

#### Paso 2: Configurar Webhook en MercadoPago
1. Ve a https://www.mercadopago.com.ar/developers/panel/webhooks
2. Crea nuevo webhook
3. URL: `https://vacasenlacosta.com/api/webhooks/mercadopago`
4. Eventos: `payment` (Pagos)
5. Copia el Secret y agrégalo a `.env`:
```bash
MP_WEBHOOK_SECRET=tu_secret_aqui
```

#### Paso 3: Actualizar mercadopago.ts
```typescript
// actions/mercadopago.ts línea 57
notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`
```

#### Paso 4: Testing Local
1. Usa ngrok para exponer localhost:
```bash
ngrok http 3000
```

2. Configura webhook temporal con URL de ngrok

3. Simula pago en sandbox

**Tiempo estimado:** 6-10 horas  
**Prioridad:** 🔴 CRÍTICA

---

### 🟡 TAREA 3: Sincronizar Schema de Base de Datos

#### Paso 1: Aplicar Migraciones al Schema Principal
```sql
-- supabase/schema.sql

-- Agregar al final del archivo, después de la tabla properties

-- Migration: Add rooms and bathrooms
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS rooms int DEFAULT 1,
ADD COLUMN IF NOT EXISTS bathrooms int DEFAULT 1;

-- Migration: Add featured columns
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_until timestamptz;

CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(is_featured);

-- Migration: Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, property_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propios favoritos"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden agregar favoritos"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus favoritos"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

#### Paso 2: Actualizar Types
```typescript
// types/types.ts
export interface Property {
  id: string
  title: string
  description: string
  price: number
  currency: string
  operation_type: string
  address: string
  location?: string  // PostgreSQL point format
  owner_id: string
  created_at: string
  updated_at: string
  status: string
  rooms: number
  bathrooms: number
  is_featured: boolean
  featured_until?: string
  features?: Record<string, boolean>
  property_images: {
    id: string
    url: string
    order: number
  }[]
  users?: User
}
```

**Tiempo estimado:** 2-4 horas  
**Prioridad:** 🟡 MEDIA

---

## 📈 FASE 2: FIXES IMPORTANTES (Días 3-4)

### 🟡 TAREA 4: Fix PropertyCard Datos Dinámicos

**Archivo:** `components/property-card.tsx`

```tsx
// Líneas 118-130 - Reemplazar sección hardcoded

{/* Features Grid */}
<div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-border/50">
  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-muted/30 group-hover:bg-primary/5 transition-colors duration-300">
    <BedDouble className="h-5 w-5 mb-1 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
    <span className="text-xs font-medium text-muted-foreground">
      {property.rooms || 1} Amb
    </span>
  </div>
  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-muted/30 group-hover:bg-primary/5 transition-colors duration-300">
    <Bath className="h-5 w-5 mb-1 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
    <span className="text-xs font-medium text-muted-foreground">
      {property.bathrooms || 1} Baño{property.bathrooms !== 1 ? 's' : ''}
    </span>
  </div>
  {/* Si quieres mostrar superficie, primero agrégala a la DB */}
  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-muted/30 group-hover:bg-primary/5 transition-colors duration-300">
    <Home className="h-5 w-5 mb-1 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
    <span className="text-xs font-medium text-muted-foreground">
      {property.operation_type === 'rent' ? 'Alquiler' : 'Venta'}
    </span>
  </div>
</div>
```

**Tiempo estimado:** 1 hora  
**Prioridad:** 🟡 MEDIA

---

### 🟡 TAREA 5: Integrar Geocoding API

#### Opción A: Google Geocoding API

**Paso 1: Obtener API Key**
1. Ve a https://console.cloud.google.com
2. Habilita "Geocoding API"
3. Crea API Key
4. Agrega a `.env.local`:
```bash
GOOGLE_GEOCODING_API_KEY=tu_key_aqui
```

**Paso 2: Crear Utility**
```typescript
// utils/geocoding.ts
export async function geocodeAddress(address: string): Promise<{
  lat: number
  lng: number
} | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_GEOCODING_API_KEY}`
    )
    const data = await response.json()
    
    if (data.status === 'OK' && data.results[0]) {
      const { lat, lng } = data.results[0].geometry.location
      return { lat, lng }
    }
    
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}
```

**Paso 3: Integrar en createProperty**
```typescript
// actions/property.ts
import { geocodeAddress } from '@/utils/geocoding'

export async function createProperty(data: z.infer<typeof propertySchema>) {
  // ... existing code
  
  // Geocode address
  const coords = await geocodeAddress(data.address)
  const location = coords ? `(${coords.lat},${coords.lng})` : '(0,0)'
  
  const { data: property, error: propError } = await supabase
    .from('properties')
    .insert({
      // ... existing fields
      location,
    })
    .select()
    .single()
  
  // ...
}
```

**Tiempo estimado:** 8-12 horas  
**Prioridad:** 🟡 MEDIA

---

### 🟡 TAREA 6: Implementar Búsqueda por Texto

**Paso 1: Agregar campo city a properties**
```sql
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS city text;

-- Opcional: agregar índice GIN para full-text search
CREATE INDEX IF NOT EXISTS idx_properties_search 
ON public.properties 
USING gin(to_tsvector('spanish', title || ' ' || description || ' ' || address || ' ' || COALESCE(city, '')));
```

**Paso 2: Actualizar getProperties**
```typescript
// actions/get-properties.ts
export async function getProperties(filters?: {
  operation_type?: string
  minPrice?: number
  maxPrice?: number
  rooms?: number
  search?: string  // NUEVO
}) {
  const supabase = await createClient()

  let query = supabase
    .from('properties')
    .select(`
      *,
      property_images ( url )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // ... filtros existentes
  
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,address.ilike.%${filters.search}%,city.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  // ...
}
```

**Paso 3: Conectar Search Input**
```tsx
// app/search/page.tsx
'use client'

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm) {
      params.set('search', searchTerm)
    } else {
      params.delete('search')
    }
    router.push(`/search?${params.toString()}`)
  }
  
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar por ciudad, zona o barrio..."
        className="pl-10 h-12 rounded-xl"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
    </div>
  )
}
```

**Tiempo estimado:** 4-6 horas  
**Prioridad:** 🟡 MEDIA

---

## 🔒 FASE 3: SEGURIDAD Y OPTIMIZACIÓN (Día 5)

### 🟡 TAREA 7: Implementar Rate Limiting

**Opción A: Con Upstash Redis (Recomendado)**

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
})
```

**Aplicar en Server Actions:**
```typescript
// actions/property.ts
import { ratelimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

export async function createProperty(data: z.infer<typeof propertySchema>) {
  const ip = headers().get('x-forwarded-for') ?? 'unknown'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    throw new Error('Rate limit exceeded. Please try again later.')
  }
  
  // ... resto del código
}
```

**Tiempo estimado:** 4 horas  
**Prioridad:** 🟡 MEDIA

---

### 🟢 TAREA 8: Validar Formato WhatsApp

```typescript
// actions/profile.ts
const profileSchema = z.object({
  full_name: z.string().min(2),
  whatsapp: z.string()
    .min(10, "El número debe tener al menos 10 dígitos")
    .regex(
      /^(?:11|2[2-9]|3[0-9]|4[0-9]|5[0-9])[0-9]{8}$/,
      "Formato inválido. Ingresa sin 0 ni 15. Ej: 1123456789"
    ),
})
```

**Tiempo estimado:** 30 minutos  
**Prioridad:** 🟢 BAJA

---

## 🚀 FASE 4: DEPLOY Y TESTING (Días 6-7)

### 🔧 TAREA 9: Configurar Variables de Entorno en Vercel

**Ir a Vercel Dashboard → Settings → Environment Variables**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# R2 Cloudflare
R2_ACCOUNT_ID=tu_account_id
R2_ACCESS_KEY_ID=tu_access_key
R2_SECRET_ACCESS_KEY=tu_secret_key
R2_BUCKET_NAME=nombre_bucket
NEXT_PUBLIC_R2_DEV_URL=pub-xxxxxxxx.r2.dev

# MercadoPago
MP_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxxxxxx (PRODUCCIÓN)
MP_WEBHOOK_SECRET=tu_webhook_secret

# Google
GOOGLE_GEOCODING_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX

# Upstash (si usas rate limiting)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXXXxxxxxxxxxxxxxxx

# Base URL
NEXT_PUBLIC_BASE_URL=https://vacasenlacosta.com
```

---

### ✅ TAREA 10: Testing End-to-End

**Crear test completo:**

```typescript
// tests/complete-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Complete User Flow', () => {
  test('should allow user to register, publish property, and pay', async ({ page }) => {
    // 1. Landing
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Tu lugar en')
    
    // 2. Login
    await page.click('text=Crear Cuenta')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.click('button:has-text("Continuar con Google")')
    // ... continue flow
    
    // 3. Publish
    await page.goto('/publish')
    await page.fill('input[name="title"]', 'Casa de prueba')
    await page.fill('textarea[name="description"]', 'Esta es una descripción de prueba larga para el test')
    await page.fill('input[name="price"]', '100000')
    await page.fill('input[name="address"]', 'Av. Corrientes 1234, Buenos Aires')
    await page.setInputFiles('input[type="file"]', './tests/fixtures/house.jpg')
    await page.click('button:has-text("Publicar Aviso")')
    
    // 4. Verify in dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Casa de prueba')).toBeVisible()
    
    // 5. Feature property
    await page.click('button:has-text("Destacar")')
    // ... complete MercadoPago flow in test mode
  })
})
```

**Ejecutar:**
```bash
npx playwright test --ui
```

**Tiempo estimado:** 6-8 horas  
**Prioridad:** 🔴 CRÍTICA

---

## 📊 CHECKLIST FINAL PRE-DEPLOY

### Infraestructura
- [ ] R2 custom domain configurado y URLs funcionando
- [ ] Variables de entorno en Vercel configuradas
- [ ] Base datos en Supabase con schema actualizado
- [ ] Google OAuth configurado para producción
- [ ] MercadoPago en modo producción

### Funcionalidades Core
- [ ] Registro/login funciona (3 métodos)
- [ ] Publicar propiedad con imágenes completo
- [ ] Búsqueda y filtros funcionan
- [ ] Favoritos persisten
- [ ] Editar propiedad funciona
- [ ] Pago MercadoPago + webhooks verificados

### Calidad
- [ ] Tests E2E pasan
- [ ] No hay console.errors en producción
- [ ] Performance Lighthouse > 80
- [ ] Mobile responsive verificado
- [ ] SEO meta tags correctos

### Seguridad
- [ ] RLS policies activas
- [ ] Rate limiting implementado
- [ ] Webhooks con firma verificada
- [ ] Inputs validados con Zod

### Monitoring
- [ ] Sentry o similar para error tracking
- [ ] Google Analytics configurado
- [ ] Vercel Analytics habilitado
- [ ] Logs en Supabase Dashboard revisables

---

## 🎯 MÉTRICAS DE ÉXITO

| Métrica | Target | Verificación |
|---------|--------|--------------|
| **Uptime** | 99.5% | Vercel Status |
| **Page Load** | < 3s | Lighthouse |
| **Property Publish** | < 30s | Manual test |
| **Image Upload** | < 10s por imagen | R2 metrics |
| **Search Results** | < 2s | Manual test |
| **Payment Success Rate** | > 95% | MP Dashboard |

---

## 🆘 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: Imágenes no se ven después de subir

**Diagnóstico:**
```bash
# Verificar que el bucket es accesible
curl -I https://pub-xxxxxxxx.r2.dev/user-id/test-image.jpg
```

**Solución:**
- Verificar que R2 bucket tiene public access
- Verificar CORS en R2 settings
- Verificar que la URL es correcta en DB

### Problema 2: Webhook de MercadoPago no llega

**Diagnóstico:**
1. Ve a MercadoPago → Developers → Webhooks → Logs
2. Revisa si hay intentos de entrega
3. Chequea Vercel Logs

**Solución:**
- Verificar que la URL es accesible públicamente
- Verificar que no hay auth en el route
- Verificar que la firma es correcta

### Problema 3: Error "Location is invalid" al crear propiedad

**Diagnóstico:**
- Mirar console.error en server logs
- Verificar formato de location: debe ser `(lat,lng)`

**Solución:**
```typescript
// Formato correcto PostgreSQL point
location: `(${lat},${lng})`  // ✅
location: `${lat},${lng}`     // ❌
```

---

## 📞 CONTACTOS Y RECURSOS

- **Documentación Supabase:** https://supabase.com/docs
- **Cloudflare R2 Docs:** https://developers.cloudflare.com/r2/
- **MercadoPago API:** https://www.mercadopago.com.ar/developers/
- **Next.js Docs:** https://nextjs.org/docs
- **Playwright Docs:** https://playwright.dev/

---

**Última actualización:** 2025-11-29  
**Mantenedor:** CortxAgency  
**Proyecto:** Vacas en la Costa - Real Estate Platform
