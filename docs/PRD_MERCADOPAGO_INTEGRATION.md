# PRD: Sistema de "Destacar Propiedad" con MercadoPago

## 1. Contexto y Objetivo
"Vacas en la Costa" necesita un modelo de monetización sólido y simple. El objetivo es permitir que los propietarios paguen una tarifa única para "Destacar" su propiedad por un periodo determinado (7, 15 o 30 días), obteniendo mayor visibilidad en la plataforma.

## 2. Alcance del Producto
- **Selección de Plan:** El usuario elige entre 3 opciones de duración.
- **Pago Seguro:** Integración con MercadoPago (Checkout Pro).
- **Activación Automática:** La propiedad se destaca automáticamente al confirmarse el pago.
- **Feedback:** El usuario recibe confirmación visual del estado de su pago.

## 3. Especificaciones Técnicas

### 3.1 Base de Datos (Supabase)
Tabla: `properties`
Se requieren las siguientes columnas para manejar la lógica de destacado y auditoría:

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `is_featured` | `boolean` | (Existente) Indica si está destacado visualmente. |
| `featured_until` | `timestamptz` | Fecha de expiración del destacado. |
| `last_payment_id` | `text` | ID del pago de MP para auditoría/soporte. |

### 3.2 Planes de Precios (Configuración)
Estos valores deben ser configurables (constantes en código por ahora).

| Plan ID | Duración | Precio (ARS) | Título |
| :--- | :--- | :--- | :--- |
| `basic_7` | 7 días | $5,000 | Destacado Semanal |
| `standard_15` | 15 días | $9,000 | Destacado Quincenal |
| `premium_30` | 30 días | $15,000 | Destacado Mensual |

### 3.3 Flujo de Integración (MercadoPago)

#### A. Creación de Preferencia (Server Action)
- **Input:** `propertyId`, `planId`
- **Lógica:**
  1. Validar propiedad y dueño.
  2. Calcular precio según `planId`.
  3. Crear Preferencia en MP con:
     - `external_reference`: JSON string `{ property_id, plan_id, user_id }`
     - `notification_url`: `https://[DOMINIO]/api/webhooks/mercadopago`
     - `back_urls`: Redirección al dashboard con estado.
     - `auto_return`: "approved"

#### B. Webhook Handler (API Route)
- **Endpoint:** `POST /api/webhooks/mercadopago`
- **Seguridad:** Validar `x-signature` de MercadoPago para evitar ataques de spoofing.
- **Lógica:**
  1. Recibir notificación `topic: payment`.
  2. Consultar API de MP para obtener estado del pago.
  3. Si `status === 'approved'`:
     - Leer `external_reference`.
     - Calcular nueva fecha `featured_until` (Fecha actual + Días del plan).
     - Actualizar DB (`is_featured = true`, `featured_until`, `last_payment_id`).
  4. Responder `200 OK` rápidamente.

## 4. Edge Cases y Manejo de Errores

1.  **Pago Pendiente:**
    - Si el usuario paga con Rapipago/PagoFácil, la activación no es inmediata.
    - El webhook llegará horas/días después. El sistema debe soportarlo sin intervención manual.

2.  **Doble Pago:**
    - Si un usuario paga dos veces por error, el sistema extenderá la fecha (lógica aditiva) o sobrescribirá (lógica simple).
    - *Decisión MVP:* Sobrescribir fecha desde el momento del nuevo pago.

3.  **Fallo de Webhook:**
    - MercadoPago reintenta el envío. Nuestro endpoint debe ser **idempotente** (procesar el mismo ID de pago dos veces no debe duplicar beneficios ni dar error 500).

4.  **Seguridad:**
    - Nunca confiar en el frontend para activar el destacado. Solo el Webhook o una verificación server-side post-pago pueden activar la feature.

## 5. Plan de Implementación Automatizado

1.  **Database:** Crear migración para agregar `featured_until` y `last_payment_id`.
2.  **Config:** Configurar variables de entorno (`MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`).
3.  **Backend:**
    - Actualizar `actions/mercadopago.ts` para soportar planes dinámicos.
    - Crear `app/api/webhooks/mercadopago/route.ts` con validación de firma.
4.  **Frontend:**
    - Crear componente `FeaturedPlanSelector.tsx`.
    - Integrarlo en el Dashboard de Propiedades.

---
**Estado:** Pendiente de Aprobación
**Autor:** Antigravity AI
