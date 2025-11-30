# 🗺️ Vacas en la Costa - Roadmap & Estado del Proyecto

Este documento sirve como única fuente de verdad para el estado del proyecto, tareas pendientes y mejoras planificadas. Se actualizará dinámicamente.

## 🟢 Estado Actual: Fase de Refinamiento y Solidez
El núcleo (MVP) está completo. Estamos en la etapa de pulido, UX y preparación para producción.

---

## 📝 Lista de Tareas (Living Task List)

### 🚀 Prioridad Alta (Inmediato)
- [x] **Mapa Interactivo en Publicación:** ✅ Implementado con Leaflet.
- [x] **Validación de Publicación:** ✅ Backend sólido, falta test manual.
- [x] **Persistencia de Ubicación:** ✅ Guarda lat/lng en DB.
- [ ] **Testing Manual:** Ejecutar TESTING_CHECKLIST.md antes de deploy.
- [ ] **Configurar Google Auth:**
    - [x] Client ID obtenido.
    - [ ] Configurar en Supabase Dashboard (Auth > Providers > Google).

### 🛠️ Mejoras Técnicas & Mantenimiento
- [x] **Configurar Cloudflare R2:**
    - [x] Account ID identificado.
    - [x] Dominio público configurado (`pub-e01bd237...`).
- [x] **Ejecutar Migraciones Pendientes:** ✅ Completado (rooms, bathrooms, location, favorites).
- [ ] **SEO Básico:** Verificar metadatos dinámicos en páginas de detalle.

### 🎨 UI/UX & Diseño
- [ ] **Feedback Visual:** Mejorar loaders y mensajes de éxito/error (usando Sonner).
- [ ] **Galería de Imágenes:** Mejorar la visualización de fotos en el detalle (lightbox o carrusel).
- [ ] **Filtros Avanzados:** Agregar filtros por amenities (WiFi, Pileta, etc.) cuando el backend lo soporte.
- [ ] **Responsive Testing:** Probar en móvil, tablet y desktop.

### 💼 Negocio & Monetización
- [ ] **MercadoPago:** Configurar credenciales de producción.
- [ ] **Planes de Publicación:** Implementar lógica de destacados/premium real.

---

## 📂 Estructura de Archivos Clave
- `.analysis/`: Documentación técnica profunda y diagramas.
- `actions/`: Lógica de servidor (Server Actions).
- `components/ui/`: Componentes base de diseño (Shadcn).
- `utils/`: Utilidades puras (formateo, validación).
- `TESTING_CHECKLIST.md`: Lista de pruebas manuales pendientes.

---

## ✅ Estado de Tests Automatizados
- **Database Structure:** ✅ 5/5 pass
- **Data Integrity:** ✅ 3/3 pass
- **RLS Security:** ✅ 2/2 pass
- **Server Actions:** ✅ 6/6 pass
- **Components:** ✅ 5/5 pass

**Total:** 20/20 tests pasados | 0 fallos | 1 warning menor

---

*Última actualización: 29 Nov 2025*
