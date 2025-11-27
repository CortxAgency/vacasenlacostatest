-- Add rooms and bathrooms columns to properties table
alter table public.properties 
add column if not exists rooms int default 1,
add column if not exists bathrooms int default 1;

-- Update existing rows to have default values if null (though default handles new ones)
update public.properties set rooms = 1 where rooms is null;
update public.properties set bathrooms = 1 where bathrooms is null;
