-- Tabla de Favoritos
create table if not exists favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  property_id uuid references properties(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, property_id)
);

-- RLS para Favoritos
alter table favorites enable row level security;

create policy "Usuarios pueden ver sus propios favoritos"
  on favorites for select
  using (auth.uid() = user_id);

create policy "Usuarios pueden agregar favoritos"
  on favorites for insert
  with check (auth.uid() = user_id);

create policy "Usuarios pueden eliminar sus favoritos"
  on favorites for delete
  using (auth.uid() = user_id);
