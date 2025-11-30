# 🚀 ACTIVACIÓN DEL SISTEMA DE RESEÑAS

Para que el nuevo sistema de reseñas funcione, debes ejecutar una migración en tu base de datos Supabase.

## Pasos:

1.  Ve al **SQL Editor** de tu proyecto en Supabase.
2.  Copia y pega el siguiente código SQL:

```sql
-- Crear tabla de reseñas
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  reviewer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  reviewed_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT no_self_review CHECK (reviewer_id != reviewed_id)
);

-- Habilitar seguridad
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON public.reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
```

3.  Haz clic en **RUN**.

## ¿Qué incluye el sistema?

*   **Perfil Público:** Ahora muestra el promedio de estrellas y el total de opiniones.
*   **Formulario:** Los usuarios pueden dejar reseñas (estrellas + comentario) en perfiles ajenos.
*   **Listado:** Se muestran todas las reseñas recibidas con fecha y autor.
*   **Validaciones:** Un usuario no puede reseñarse a sí mismo.

¡Listo! Tu app ahora tiene un sistema de reputación completo.
