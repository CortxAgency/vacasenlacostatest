# 🧪 Manual Testing Checklist - Vacas en la Costa

**Fecha:** 29 Nov 2025  
**Estado:** Listo para pruebas manuales

---

## 🎯 Flujos Críticos a Probar

### 1. Autenticación ✅
- [x] Código implementado
- [ ] **PROBAR:** Registro con Email
- [ ] **PROBAR:** Login con Magic Link
- [ ] **PROBAR:** Login con contraseña
- [ ] **PROBAR:** Login con Google (⚠️ Requiere configurar Client ID/Secret en Supabase)

### 2. Publicar Propiedad ✅
- [x] Código implementado
- [ ] **PROBAR:** Subir 1 imagen
- [ ] **PROBAR:** Subir múltiples imágenes (máximo alcanzado)
- [ ] **PROBAR:** Seleccionar ubicación en mapa
- [ ] **PROBAR:** Guardar con datos mínimos
- [ ] **PROBAR:** Validaciones de formulario (precio = 0, título corto, etc.)

### 3. Editar Propiedad ✅
- [x] Código implementado
- [ ] **PROBAR:** Cambiar precio/título
- [ ] **PROBAR:** Eliminar imagen existente
- [ ] **PROBAR:** Agregar nuevas imágenes
- [ ] **PROBAR:** Mover ubicación en el mapa
- [ ] **PROBAR:** Solo el dueño puede editar (seguridad)

### 4. Buscar y Filtrar ✅
- [x] Código implementado
- [ ] **PROBAR:** Búsqueda por texto (título/dirección)
- [ ] **PROBAR:** Filtro por precio (min/max)
- [ ] **PROBAR:** Filtro por ambientes
- [ ] **PROBAR:** Filtro por tipo de operación (venta/alquiler)
- [ ] **PROBAR:** Sin resultados (empty state)

### 5. Ver Detalle de Propiedad ✅
- [x] Código implementado
- [ ] **PROBAR:** Galería de imágenes funciona
- [ ] **PROBAR:** Botón de WhatsApp genera link correcto
- [ ] **PROBAR:** Mapa muestra ubicación correcta
- [ ] **PROBAR:** Datos completos (ambientes, baños, área)

### 6. Favoritos ✅
- [x] Código implementado
- [ ] **PROBAR:** Agregar a favoritos (corazón)
- [ ] **PROBAR:** Quitar de favoritos
- [ ] **PROBAR:** Ver página de favoritos
- [ ] **PROBAR:** Favoritos persisten al recargar

### 7. Perfil de Usuario ✅
- [x] Código implementado
- [ ] **PROBAR:** Editar nombre completo
- [ ] **PROBAR:** Cambiar número WhatsApp
- [ ] **PROBAR:** Validación de WhatsApp (formato argentino)
- [ ] **PROBAR:** Ver mis publicaciones

### 8. Dashboard ✅
- [x] Código implementado
- [ ] **PROBAR:** Ver lista de mis propiedades
- [ ] **PROBAR:** Botón "Editar" funciona
- [ ] **PROBAR:** Botón "Eliminar" funciona
- [ ] **PROBAR:** Confirmación antes de borrar

---

## 🎨 UX/UI a Revisar

### Responsive Design
- [ ] **PROBAR:** Móvil (iPhone/Android)
- [ ] **PROBAR:** Tablet
- [ ] **PROBAR:** Desktop

### Navegación
- [ ] **PROBAR:** Navbar en todas las páginas
- [ ] **PROBAR:** Links funcionan correctamente
- [ ] **PROBAR:** Botón de logout

### Feedback Visual
- [ ] **PROBAR:** Toast notifications (Sonner)
- [ ] **PROBAR:** Loading states (spinners)
- [ ] **PROBAR:** Error messages (formularios)

---

## 🚨 Edge Cases Críticos

### Manejo de Errores
- [ ] **PROBAR:** Subir imagen demasiado grande
- [ ] **PROBAR:** Sin conexión a internet
- [ ] **PROBAR:** Token de autenticación expirado
- [ ] **PROBAR:** Intentar editar propiedad de otro usuario

### Validaciones
- [ ] **PROBAR:** Publicar sin imágenes
- [ ] **PROBAR:** Precio negativo
- [ ] **PROBAR:** Email inválido en registro
- [ ] **PROBAR:** WhatsApp con letras

---

## ⚙️ Configuración Pendiente

### Google Auth
- [ ] Ir a Supabase Dashboard > Auth > Providers > Google
- [ ] Pegar Client ID: `553057182074-3s7oujl1itp0pl8v7ebhsb9npb6rjoj1.apps.googleusercontent.com`
- [ ] Pegar Client Secret: (el que te dio Google Console)
- [ ] Activar "Enable Sign in with Google"
- [ ] **PROBAR:** Login con Google

### Variables de Entorno (.env.local)
```bash
# Verificar que estén configuradas:
NEXT_PUBLIC_SUPABASE_URL=https://xjjkqmjxuemfdnqogkpa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu_anon_key]
NEXT_PUBLIC_R2_PUBLIC_URL=pub-e01bd23781b441a1a45bda2ab1f5edbe.r2.dev
R2_ACCOUNT_ID=d7768f6e21c37967d6f8b7b6be7d0620
R2_ACCESS_KEY_ID=[tu_r2_key]
R2_SECRET_ACCESS_KEY=[tu_r2_secret]
R2_BUCKET_NAME=media
```

---

## 🚀 Deploy a Vercel (Cuando esté listo)

### Pre-Deploy
- [ ] Todas las pruebas manuales pasadas
- [ ] Google Auth configurado
- [ ] Variables de entorno documentadas

### Deploy Steps
1. Conectar repo a Vercel
2. Configurar variables de entorno en Vercel Dashboard
3. Deploy
4. Verificar URLs de callback en Google Console y Supabase

---

## 📝 Notas

**Estado Actual:** La aplicación está técnicamente lista (backend sólido, sin errores críticos). Falta verificar la UX en uso real y configurar Google Auth.

**Recomendación:** Hacer un smoke test manual de los flujos 1-7 en localhost antes de deploy.
