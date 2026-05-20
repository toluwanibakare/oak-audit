
-- Roles enum
create type public.app_role as enum ('owner','admin','lead_auditor','auditor','auditee','viewer');

-- Org type enum
create type public.org_type as enum ('individual','organization');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  job_title text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- Organizations
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  type public.org_type not null default 'individual',
  name text not null,
  industry text,
  address text,
  logo_url text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.organizations enable row level security;

-- Organization members
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  invited_email text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);
alter table public.organization_members enable row level security;

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, org_id, role)
);
alter table public.user_roles enable row level security;

-- has_role helper (security definer, avoids recursive RLS)
create or replace function public.has_role(_user_id uuid, _org_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and org_id = _org_id and role = _role
  )
$$;

-- is_org_member helper
create or replace function public.is_org_member(_user_id uuid, _org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members
    where user_id = _user_id and org_id = _org_id and status = 'active'
  )
$$;

-- Org policies
create policy "Orgs: members can view" on public.organizations
  for select using (public.is_org_member(auth.uid(), id));
create policy "Orgs: creator can insert" on public.organizations
  for insert with check (auth.uid() = created_by);
create policy "Orgs: owners/admins can update" on public.organizations
  for update using (public.has_role(auth.uid(), id, 'owner') or public.has_role(auth.uid(), id, 'admin'));

-- Org members policies
create policy "Members: see own membership rows" on public.organization_members
  for select using (user_id = auth.uid() or public.is_org_member(auth.uid(), org_id));
create policy "Members: owner/admin can insert" on public.organization_members
  for insert with check (
    public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin')
  );
create policy "Members: owner/admin can update" on public.organization_members
  for update using (
    public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin')
  );
create policy "Members: owner/admin can delete" on public.organization_members
  for delete using (
    public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin')
  );

-- User roles policies
create policy "Roles: members can view" on public.user_roles
  for select using (user_id = auth.uid() or public.is_org_member(auth.uid(), org_id));
create policy "Roles: owner/admin can insert" on public.user_roles
  for insert with check (
    public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin')
  );
create policy "Roles: owner/admin can delete" on public.user_roles
  for delete using (
    public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin')
  );

-- Trigger: on new auth user, create profile + personal individual org + owner role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  display_name text;
begin
  display_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, full_name, job_title, phone)
  values (
    new.id,
    display_name,
    new.raw_user_meta_data ->> 'job_title',
    new.raw_user_meta_data ->> 'phone'
  );

  -- Always create a personal individual workspace
  insert into public.organizations (type, name, created_by)
  values ('individual', display_name || '''s workspace', new.id)
  returning id into new_org_id;

  insert into public.organization_members (org_id, user_id, status)
  values (new_org_id, new.id, 'active');

  insert into public.user_roles (user_id, org_id, role)
  values (new.id, new_org_id, 'owner');

  -- If signup metadata flagged this as an organization, also create the org
  if (new.raw_user_meta_data ->> 'account_type') = 'organization' then
    insert into public.organizations (type, name, industry, address, created_by)
    values (
      'organization',
      coalesce(new.raw_user_meta_data ->> 'org_name', 'My organization'),
      new.raw_user_meta_data ->> 'industry',
      new.raw_user_meta_data ->> 'address',
      new.id
    )
    returning id into new_org_id;

    insert into public.organization_members (org_id, user_id, status)
    values (new_org_id, new.id, 'active');

    insert into public.user_roles (user_id, org_id, role)
    values (new.id, new_org_id, 'owner');
    insert into public.user_roles (user_id, org_id, role)
    values (new.id, new_org_id, 'admin');
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at triggers
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger organizations_touch before update on public.organizations
  for each row execute function public.touch_updated_at();
