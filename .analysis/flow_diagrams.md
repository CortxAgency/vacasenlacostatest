# 🗺️ Diagrama de Flujos - Vacas en la Costa

## 📋 ÍNDICE
1. [Diagrama de Base de Datos](#diagrama-de-base-de-datos)
2. [Flujo de Autenticación](#flujo-de-autenticación)
3. [Flujo de Publicación](#flujo-de-publicación)
4. [Flujo de Pago MercadoPago](#flujo-de-pago-mercadopago)
5. [Arquitectura de Componentes](#arquitectura-de-componentes)

---

## 📊 DIAGRAMA DE BASE DE DATOS

```mermaid
erDiagram
    auth_users ||--|| users : extends
    users ||--o{ properties : owns
    properties ||--o{ property_images : has
    users ||--o{ favorites : creates
    properties ||--o{ favorites : referenced_by
    
    auth_users {
        uuid id PK
        text email
        jsonb raw_user_meta_data
        timestamptz created_at
    }
    
    users {
        uuid id PK,FK
        text email
        text full_name
        text avatar_url
        text role
        text whatsapp
        boolean is_verified
        timestamptz created_at
    }
    
    properties {
        uuid id PK
        uuid owner_id FK
        text title
        text description
        numeric price
        text currency
        text operation_type
        point location
        text address
        jsonb features
        text status
        int rooms
        int bathrooms
        boolean is_featured
        timestamptz featured_until
        timestamptz created_at
        timestamptz updated_at
    }
    
    property_images {
        uuid id PK
        uuid property_id FK
        text url
        int order
        timestamptz created_at
    }
    
    favorites {
        uuid id PK
        uuid user_id FK
        uuid property_id FK
        timestamptz created_at
    }
```

---

## 🔐 FLUJO DE AUTENTICACIÓN

```mermaid
sequenceDiagram
    actor Usuario
    participant LoginPage
    participant Supabase
    participant OAuth
    participant Middleware
    participant Dashboard
    
    Usuario->>LoginPage: Accede a /login
    
    alt Google OAuth
        Usuario->>LoginPage: Click "Continuar con Google"
        LoginPage->>Supabase: signInWithOAuth('google')
        Supabase->>OAuth: Redirect a Google
        OAuth->>Usuario: Autorizar app
        Usuario->>OAuth: Acepta
        OAuth->>Supabase: Redirect con code
        Supabase->>LoginPage: Callback /auth/callback?code=xxx
        LoginPage->>Supabase: exchangeCodeForSession(code)
        Supabase-->>LoginPage: Session + User
        LoginPage->>Middleware: Redirect a /dashboard
    else Magic Link
        Usuario->>LoginPage: Ingresa email
        Usuario->>LoginPage: Click "Enviar enlace"
        LoginPage->>Supabase: signInWithOtp(email)
        Supabase->>Usuario: Envía email con link
        Usuario->>Email: Click en link
        Email->>Supabase: Callback con token
        Supabase->>Middleware: Redirect a /auth/callback
        Middleware->>Dashboard: Sesión activa
    else Password
        Usuario->>LoginPage: Email + Password
        LoginPage->>Supabase: signInWithPassword()
        Supabase-->>LoginPage: Session + User
        LoginPage->>Dashboard: Redirect
    end
    
    Middleware->>Middleware: Check auth.uid()
    Middleware->>Dashboard: Allow access
    Dashboard-->>Usuario: Muestra propiedades
```

---

## 📤 FLUJO DE PUBLICACIÓN DE PROPIEDAD

```mermaid
sequenceDiagram
    actor Propietario
    participant PublishPage
    participant R2Action
    participant CloudflareR2
    participant PropertyAction
    participant Supabase
    participant Dashboard
    
    Propietario->>PublishPage: Llena formulario
    Propietario->>PublishPage: Selecciona imágenes (Files)
    Propietario->>PublishPage: Click "Publicar Aviso"
    
    PublishPage->>PublishPage: Valida con Zod
    
    loop Para cada imagen
        PublishPage->>R2Action: getPresignedUrl(type, size)
        R2Action->>R2Action: Genera key: userId/uuid.ext
        R2Action->>CloudflareR2: getSignedUrl(PutObjectCommand)
        CloudflareR2-->>R2Action: signedUrl (1h expiry)
        R2Action-->>PublishPage: { signedUrl, key }
        PublishPage->>CloudflareR2: PUT file to signedUrl
        CloudflareR2-->>PublishPage: 200 OK
        PublishPage->>PublishPage: Guarda publicUrl
    end
    
    PublishPage->>PropertyAction: createProperty(data + images[])
    PropertyAction->>Supabase: INSERT INTO properties
    Supabase-->>PropertyAction: property.id
    
    loop Para cada URL de imagen
        PropertyAction->>Supabase: INSERT INTO property_images
    end
    
    PropertyAction-->>PublishPage: { success: true }
    PublishPage->>Dashboard: router.push('/dashboard')
    Dashboard-->>Propietario: Propiedad visible
    
    Note over CloudflareR2: ⚠️ PROBLEMA: publicUrl usa dominio hardcoded<br/>que NO está configurado
```

---

## 💳 FLUJO DE PAGO MERCADOPAGO (Destacar Propiedad)

```mermaid
sequenceDiagram
    actor Propietario
    participant Dashboard
    participant MPAction
    participant MercadoPago
    participant Callback
    participant FeatureAction
    participant Supabase
    
    Propietario->>Dashboard: Click "Destacar" en propiedad
    Dashboard->>MPAction: createPreference(propertyId)
    MPAction->>Supabase: Verifica ownership
    Supabase-->>MPAction: property data
    
    MPAction->>MercadoPago: preference.create({<br/>  items: [{ title, price: 5000 ARS }],<br/>  back_urls: { success, failure, pending },<br/>  metadata: { property_id, user_id }<br/>})
    MercadoPago-->>MPAction: { init_point: "https://mpago.li/xxx" }
    MPAction-->>Dashboard: { url }
    Dashboard->>MercadoPago: window.location = url
    
    MercadoPago->>Propietario: Muestra checkout
    Propietario->>MercadoPago: Completa pago
    
    alt Pago Exitoso
        MercadoPago->>Callback: Redirect a /dashboard?status=success&property_id=xxx
        Callback->>Callback: PaymentStatusHandler detecta params
        Callback->>FeatureAction: featureProperty(propertyId)
        FeatureAction->>Supabase: UPDATE properties SET <br/>is_featured=true,<br/>featured_until=now()+30days
        Supabase-->>FeatureAction: Success
        FeatureAction->>FeatureAction: revalidatePath('/dashboard')
        Callback->>Propietario: Toast "¡Propiedad destacada! 🚀"
    else Pago Fallido
        MercadoPago->>Callback: Redirect a /dashboard?status=failure
        Callback->>Propietario: Toast error
    end
    
    Note over MercadoPago,Callback: ⚠️ RIESGO DE SEGURIDAD:<br/>No hay webhooks implementados<br/>No hay validación del payment_id<br/>Sistema confiado en query params
```

---

## 🔄 WORKFLOW USUARIO COMPLETO

```mermaid
flowchart TD
    Start([Usuario visita<br/>vacasenlacosta.com])
    
    Start --> Home[Landing Page]
    
    Home --> |Click Hero CTA| Search{Tipo operación}
    Search --> |Alquiler| SearchRent[/search?op=rent]
    Search --> |Venta| SearchSale[/search?op=sale]
    Search --> |Explorar| SearchAll[/search]
    
    SearchRent --> Filters[Aplica Filtros]
    SearchSale --> Filters
    SearchAll --> Filters
    
    Filters --> ViewMode{Vista}
    ViewMode --> |Lista| CardGrid[Grilla de<br/>PropertyCards]
    ViewMode --> |Mapa| MapView[Mapa con<br/>Markers]
    
    CardGrid --> PropDetail[Detalle Propiedad<br/>/property/[id]]
    MapView --> PropDetail
    
    PropDetail --> AddFav{¿Agregar a<br/>favoritos?}
    AddFav --> |Sí, requiere login| Login[/login]
    AddFav --> |No| Contact
    
    PropDetail --> Contact{¿Contactar?}
    Contact --> |WhatsApp| WA[Abre WhatsApp<br/>con mensaje]
    Contact --> |Compartir| Share[Share Dialog]
    
    Login --> |OAuth/Magic/Pass| AuthFlow[Autenticación]
    AuthFlow --> Dashboard[Dashboard]
    
    Dashboard --> Actions{Acción}
    Actions --> |Nueva| Publish[/publish]
    Actions --> |Editar| Edit[/edit/[id]]
    Actions --> |Destacar| Payment[MercadoPago<br/>Checkout]
    
    Publish --> |Sube imgs + form| CreateProp[createProperty]
    CreateProp --> UploadR2[Upload a R2]
    UploadR2 --> SaveDB[Guarda en DB]
    SaveDB --> Dashboard
    
    Payment --> |Paga| PaymentOK{Pago OK?}
    PaymentOK --> |Sí| Feature[Marca is_featured=true]
    PaymentOK --> |No| Dashboard
    Feature --> Dashboard
    
    style Start fill:#e1f5ff
    style Dashboard fill:#fff4e1
    style PropDetail fill:#ffe1f5
    style Payment fill:#f5e1ff
    style Login fill:#e1ffe1
```

---

## 🏗️ ARQUITECTURA DE COMPONENTES

```mermaid
graph TB
    subgraph "App Router Pages"
        HomePage[page.tsx<br/>Landing]
        SearchPage[search/page.tsx]
        PropertyPage[property/[id]/page.tsx]
        LoginPage[login/page.tsx]
        DashboardPage[dashboard/page.tsx]
        PublishPage[publish/page.tsx]
        ProfilePage[profile/page.tsx]
    end
    
    subgraph "Server Actions"
        PropertyActions[actions/property.ts<br/>createProperty<br/>deleteProperty]
        UploadActions[actions/upload.ts<br/>getPresignedUrl]
        FavoriteActions[actions/favorites.ts<br/>toggleFavorite]
        MPActions[actions/mercadopago.ts<br/>createPreference]
        FeatureActions[actions/feature-property.ts<br/>featureProperty]
        ProfileActions[actions/profile.ts<br/>updateProfile]
    end
    
    subgraph "UI Components"
        Navbar[Navbar]
        PropertyCard[PropertyCard]
        SearchFilters[SearchFilters]
        PropertyMap[PropertyMap]
        LikeButton[LikeButton]
        PaymentHandler[PaymentStatusHandler]
    end
    
    subgraph "Utils & Config"
        SupabaseClient[utils/supabase/client.ts]
        SupabaseServer[utils/supabase/server.ts]
        R2Config[utils/r2.ts]
    end
    
    subgraph "External Services"
        Supabase[(Supabase<br/>PostgreSQL)]
        CloudflareR2[(Cloudflare R2)]
        MercadoPago[MercadoPago API]
        GoogleOAuth[Google OAuth]
    end
    
    HomePage --> Navbar
    SearchPage --> Navbar
    SearchPage --> PropertyCard
    SearchPage --> SearchFilters
    SearchPage --> PropertyMap
    
    PropertyPage --> LikeButton
    PropertyPage --> PropertyMap
    
    DashboardPage --> PaymentHandler
    
    PublishPage --> UploadActions
    PublishPage --> PropertyActions
    
    PropertyActions --> SupabaseServer
    UploadActions --> R2Config
    FavoriteActions --> SupabaseServer
    MPActions --> MercadoPago
    FeatureActions --> SupabaseServer
    
    SupabaseServer --> Supabase
    SupabaseClient --> Supabase
    R2Config --> CloudflareR2
    
    LoginPage --> GoogleOAuth
    
    style Supabase fill:#3ecf8e
    style CloudflareR2 fill:#f6821f
    style MercadoPago fill:#00b1ea
    style GoogleOAuth fill:#4285f4
```

---

## 🔍 MAPA DE EDGE CASES CRÍTICOS

```mermaid
mindmap
    root((Edge Cases))
        R2 Storage
            URLs públicas hardcoded
            Dominio media.argprop.com no configurado
            Imágenes inaccesibles
            Falta worker de Cloudflare
        MercadoPago
            Sin webhooks
            Sin validación payment_id
            Riesgo manipulación query params
            Confianza en redirect URL
        Base de Datos
            Schema desactualizado
            Types vs DB mismatch
            Campos city/state/country faltantes
            Coordenadas location placeholder
        UI/UX
            PropertyCard features hardcoded
            Rooms/bathrooms no dinámicos
            Búsqueda texto no implementada
            Edit form sin gestión imágenes
        Seguridad
            Sin rate limiting
            Sin validación formato WhatsApp
            Sin compresión imágenes
            Mobile upload issues
        Features Faltantes
            Geocoding API
            Sistema reviews
            Mensajería interna
            Analytics
            SEO schema markup
```

---

## 📝 RESUMEN EJECUTIVO DE GAPS

| Categoría | Problema | Severidad | Bloqueante | Estimación |
|-----------|----------|-----------|------------|------------|
| **Infraestructura** | R2 URLs públicas no configuradas | 🔴 Crítica | ✅ Sí | 4-8h |
| **Pagos** | MercadoPago sin webhooks | 🔴 Crítica | ✅ Sí | 6-10h |
| **Database** | Schema desactualizado | 🟡 Media | ❌ No | 2-4h |
| **UI** | PropertyCard hardcoded | 🟡 Media | ❌ No | 1h |
| **Features** | Geocoding faltante | 🟡 Media | ❌ No | 8-12h |
| **Features** | Búsqueda texto | 🟡 Media | ❌ No | 4-6h |
| **Features** | Edit form incompleto | 🟢 Baja | ❌ No | 6-8h |
| **Seguridad** | Rate limiting | 🟡 Media | ❌ No | 4h |
| **SEO** | Schema markup | 🟢 Baja | ❌ No | 2-3h |

**Total estimado para MVP Production-Ready:** 37-54 horas (~5-7 días)

---

## 🎯 ROADMAP SUGERIDO

### Fase 1: BLOQUEANTES (Semana 1)
- [x] Setup inicial Next.js + Supabase
- [x] Implementar autenticación
- [x] CRUD propiedades básico
- [ ] **🔴 Configurar R2 custom domain/worker**
- [ ] **🔴 Implementar MercadoPago webhooks**
- [ ] Deploy a Vercel staging

### Fase 2: CORE FEATURES (Semana 2)
- [ ] Integrar Geocoding API
- [ ] Implementar búsqueda por texto
- [ ] Completar edit de propiedades
- [ ] Fix PropertyCard dinámico
- [ ] Testing E2E básico
- [ ] Deploy a producción

### Fase 3: MEJORAS (Semana 3-4)
- [ ] Sistema de reviews
- [ ] Rate limiting
- [ ] Analytics
- [ ] SEO avanzado
- [ ] Compresión imágenes
- [ ] Página usuario público

### Fase 4: ESCALABILIDAD (Mes 2+)
- [ ] Mensajería interna
- [ ] Notificaciones push
- [ ] Panel admin
- [ ] Internacionalización
- [ ] App móvil (React Native)

