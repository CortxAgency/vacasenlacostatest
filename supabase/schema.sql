-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS Table (Extends Supabase Auth)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'agent', 'admin')),
  whatsapp text,
  is_verified boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS for users
alter table public.users enable row level security;

-- Policies for users
create policy "Public profiles are viewable by everyone."
  on public.users for select
  using ( true );

create policy "Users can insert their own profile."
  on public.users for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.users for update
  using ( auth.uid() = id );

-- PROPERTIES Table
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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for properties
alter table public.properties enable row level security;

-- Policies for properties
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

-- PROPERTY IMAGES Table
create table if not exists public.property_images (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  url text not null,
  "order" int default 0,
  created_at timestamptz default now()
);

-- Enable RLS for property_images
alter table public.property_images enable row level security;

-- Policies for property_images
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

-- FAVORITES Table
create table if not exists favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  property_id uuid references properties(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, property_id)
);

-- RLS for Favorites
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

-- Trigger to handle new user creation from Auth
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
