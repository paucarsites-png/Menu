create table if not exists menu_data (
  id text primary key default 'default',
  settings jsonb not null default '{}'::jsonb,
  categories jsonb not null default '[]'::jsonb,
  products jsonb not null default '[]'::jsonb,
  recommended jsonb not null default '[]'::jsonb,
  popular jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table menu_data enable row level security;

create policy "menu_data_public_read"
on menu_data for select
using (true);

create policy "menu_data_public_write"
on menu_data for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- Nueva migración de seguridad: solo usuarios autenticados pueden escribir en la tabla
create policy "menu_data_authenticated_write_only"
on menu_data for insert
with check (auth.role() = 'authenticated');

create policy "menu_data_authenticated_update_only"
on menu_data for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "menu_data_authenticated_delete_only"
on menu_data for delete
using (auth.role() = 'authenticated');
