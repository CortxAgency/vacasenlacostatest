# 📋 Vacas en la Costa - Próximos Pasos

Estado Actual: **MVP Code Complete**
Repositorio: `https://github.com/CortxAgency/vacasenlacostatest`

## 🚀 Infraestructura y Despliegue
- [ ] **Deploy a Vercel**: Conectar el repositorio a Vercel para tener una URL pública.
- [ ] **Variables de Entorno**: Configurar en Vercel las variables críticas:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `MP_ACCESS_TOKEN` (MercadoPago)
    - `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` (Cloudflare R2)

## 🔐 Autenticación y Usuarios
- [ ] **Configurar Google Auth**:
    - Crear proyecto en Google Cloud Console.
    - Obtener `Client ID` y `Client Secret`.
    - Configurar en Supabase Auth -> Providers -> Google.
- [ ] **Desactivar Confirmación de Email** (Opcional pero recomendado para inicio rápido):
    - En Supabase Dashboard -> Auth -> Providers -> Email -> Desmarcar "Confirm email".

## 💳 Monetización (MercadoPago)
- [ ] **Credenciales Reales**: Reemplazar el token de prueba por el `MP_ACCESS_TOKEN` de producción del cliente.
- [ ] **Webhooks**: Configurar webhooks en MercadoPago para que notifiquen a `https://vacasenlacosta.com/api/webhooks/mercadopago` (cuando tengamos dominio).

## 🧪 Testing y Calidad
- [ ] **Smoke Test en Producción**: Una vez desplegado, registrar un usuario real y publicar una propiedad.
- [ ] **Carga de Datos Iniciales**: Usar la App desplegada para cargar las primeras 5-10 propiedades manualmente (ya que el script de seed local falló por red).

## 🎨 Diseño y Marca
- [ ] **Logo Final**: Reemplazar el texto "Vacas en la Costa" por el logo SVG/PNG cuando el diseñador lo entregue.
- [ ] **Favicon**: Actualizar el favicon.ico.
