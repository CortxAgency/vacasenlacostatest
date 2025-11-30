-- =============================================
-- ESQUEMA COMPLETO DE LA BASE DE DATOS - VACAS EN LA COSTA
-- Fecha de Generación: 29 Nov 2025
-- =============================================

-- 1. Extensiones
create extension if not exists "uuid-ossp";

-- 2. Tabla USERS (Extiende Supabase Auth)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'agent', 'admin')),
  whatsapp text,
  is_verified boolean default false, -- Verificación de email
  is_identity_verified boolean default false, -- Verificación de identidad (DNI/Pasaporte)
  verified_at timestamptz,
  verification_method text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'basic', 'premium')),
  subscription_expires_at timestamptz,
  max_listings int default 3,
  listings_count int default 0,
  created_at timestamptz default now()
);

-- RLS para Users
alter table public.users enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.users for select
  using ( true );

create policy "Users can insert their own profile."
  on public.users for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.users for update
  using ( auth.uid() = id );

-- 3. Tabla PROPERTIES
create table if not exists public.properties (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  price numeric not null,
  currency text default 'USD' check (currency in ('USD', 'ARS')),
  operation_type text not null check (operation_type in ('rent', 'sale', 'temporary')),
  location point, -- PostgreSQL point type (lat, long)
  address text,
  features jsonb default '{}'::jsonb,
  status text default 'active' check (status in ('active', 'paused', 'sold')),
  rooms int default 1,
  bathrooms int default 1,
  is_featured boolean default false,
  featured_until timestamptz,
  contact_whatsapp text, -- Contacto específico para esta propiedad
  contact_email text, -- Contacto específico para esta propiedad
  contact_preference text default 'whatsapp' check (contact_preference in ('whatsapp', 'email', 'both')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS para Properties
alter table public.properties enable row level security;

create policy "Properties are viewable by everyone."
  on public.properties for select
  using ( true );

create policy "Users can insert their own properties."
  on public.properties for insert
  with check ( auth.uid() = owner_id );

create policy "Users can update their own properties."
  on public.properties for update
  using ( auth.uid() = owner_id );

create policy "Users can delete their own properties."
  on public.properties for delete
  using ( auth.uid() = owner_id );

-- Índices para Properties
create index if not exists idx_properties_featured on public.properties(is_featured);
create index if not exists idx_properties_contact_whatsapp on public.properties(contact_whatsapp) where contact_whatsapp is not null;

-- 4. Tabla PROPERTY IMAGES
create table if not exists public.property_images (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  url text not null,
  "order" int default 0,
  created_at timestamptz default now()
);

-- RLS para Property Images
alter table public.property_images enable row level security;

create policy "Images are viewable by everyone."
  on public.property_images for select
  using ( true );

create policy "Users can insert images for their properties."
  on public.property_images for insert
  with check ( 
    exists (
      select 1 from public.properties
      where id = property_id and owner_id = auth.uid()
    )
  );

create policy "Users can delete images for their properties."
  on public.property_images for delete
  using (
    exists (
      select 1 from public.properties
      where id = property_id and owner_id = auth.uid()
    )
  );

-- 5. Tabla FAVORITES
create table if not exists favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  property_id uuid references properties(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, property_id)
);

-- RLS para Favorites
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

-- 6. Triggers y Funciones
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Índice para usuarios verificados
create index if not exists idx_users_identity_verified on public.users(is_identity_verified) where is_identity_verified = true;

-- 7. Tabla REVIEWS (Sistema de Reseñas)
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  reviewer_id uuid references public.users(id) on delete cascade not null, -- Quien escribe
  reviewed_id uuid references public.users(id) on delete cascade not null, -- Quien recibe
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Restricción: No auto-reseñas
  constraint no_self_review check (reviewer_id != reviewed_id),
  
  -- Restricción: Una sola reseña por pareja de usuarios (Anti-Spam)
  constraint unique_review_per_user unique (reviewer_id, reviewed_id)
);

-- RLS para Reviews
alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

create policy "Authenticated users can create reviews"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

create policy "Users can delete their own reviews"
  on public.reviews for delete
  using (auth.uid() = reviewer_id);

-- Índices para Reviews
create index if not exists idx_reviews_reviewed_id on public.reviews(reviewed_id);
create index if not exists idx_reviews_reviewer_id on public.reviews(reviewer_id);
