-- Add featured columns to properties table
alter table public.properties 
add column if not exists is_featured boolean default false,
add column if not exists featured_until timestamptz;

-- Index for faster queries on featured properties
create index if not exists idx_properties_featured on public.properties(is_featured);
