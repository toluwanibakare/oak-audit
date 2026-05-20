
-- ===== Auditors =====
create table public.auditors (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid,
  name text not null,
  email text,
  role text,
  certifications text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.auditors enable row level security;
create policy "auditors: members view" on public.auditors for select using (public.is_org_member(auth.uid(), org_id));
create policy "auditors: admin write" on public.auditors for insert with check (public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin'));
create policy "auditors: admin update" on public.auditors for update using (public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin'));
create policy "auditors: admin delete" on public.auditors for delete using (public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin'));
create trigger touch_auditors before update on public.auditors for each row execute function public.touch_updated_at();

-- ===== Org processes =====
create table public.org_processes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  key text not null,
  name text not null,
  scope text,
  is_custom boolean not null default false,
  created_at timestamptz not null default now(),
  unique (org_id, key)
);
alter table public.org_processes enable row level security;
create policy "processes: members view" on public.org_processes for select using (public.is_org_member(auth.uid(), org_id));
create policy "processes: admin write" on public.org_processes for insert with check (public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin'));
create policy "processes: admin update" on public.org_processes for update using (public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin'));
create policy "processes: admin delete" on public.org_processes for delete using (public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin'));

-- ===== Process assignments =====
create table public.process_assignments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  process_id uuid not null references public.org_processes(id) on delete cascade,
  auditor_id uuid not null references public.auditors(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (process_id, auditor_id)
);
alter table public.process_assignments enable row level security;
create policy "pa: members view" on public.process_assignments for select using (public.is_org_member(auth.uid(), org_id));
create policy "pa: admin write" on public.process_assignments for insert with check (public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin'));
create policy "pa: admin delete" on public.process_assignments for delete using (public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin'));

-- ===== Audit licenses =====
create table public.audit_licenses (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  pack text not null,                          -- '9001'|'14001'|'45001'|'27001'|'hse'|'ims'
  paid_amount_ngn integer not null default 0,
  paystack_ref text,
  purchased_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '12 months'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.audit_licenses enable row level security;
create policy "licenses: members view" on public.audit_licenses for select using (public.is_org_member(auth.uid(), org_id));
create policy "licenses: admin insert" on public.audit_licenses for insert with check (public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin'));

-- ===== Audits =====
create table public.audits (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  standard text not null,                       -- '9001' | '14001' | '45001' | '27001' | 'ims'
  title text not null,
  scope text,
  status text not null default 'planned',       -- planned|in_progress|closed
  lead_auditor_id uuid references public.auditors(id),
  started_at timestamptz,
  closed_at timestamptz,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.audits enable row level security;
create policy "audits: members view" on public.audits for select using (public.is_org_member(auth.uid(), org_id));
create policy "audits: lead+admin write" on public.audits for insert with check (
  public.has_role(auth.uid(), org_id, 'owner')
  or public.has_role(auth.uid(), org_id, 'admin')
  or public.has_role(auth.uid(), org_id, 'lead_auditor')
);
create policy "audits: lead+admin update" on public.audits for update using (
  public.has_role(auth.uid(), org_id, 'owner')
  or public.has_role(auth.uid(), org_id, 'admin')
  or public.has_role(auth.uid(), org_id, 'lead_auditor')
);
create policy "audits: admin delete" on public.audits for delete using (public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin'));
create trigger touch_audits before update on public.audits for each row execute function public.touch_updated_at();

-- ===== Audit processes (scope rows) =====
create table public.audit_processes (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  process_id uuid not null references public.org_processes(id) on delete cascade,
  auditor_id uuid references public.auditors(id),
  created_at timestamptz not null default now(),
  unique (audit_id, process_id)
);
alter table public.audit_processes enable row level security;
create policy "ap: members view" on public.audit_processes for select using (
  exists (select 1 from public.audits a where a.id = audit_id and public.is_org_member(auth.uid(), a.org_id))
);
create policy "ap: lead+admin write" on public.audit_processes for insert with check (
  exists (select 1 from public.audits a where a.id = audit_id and (
    public.has_role(auth.uid(), a.org_id, 'owner')
    or public.has_role(auth.uid(), a.org_id, 'admin')
    or public.has_role(auth.uid(), a.org_id, 'lead_auditor')
  ))
);
create policy "ap: lead+admin delete" on public.audit_processes for delete using (
  exists (select 1 from public.audits a where a.id = audit_id and (
    public.has_role(auth.uid(), a.org_id, 'owner')
    or public.has_role(auth.uid(), a.org_id, 'admin')
    or public.has_role(auth.uid(), a.org_id, 'lead_auditor')
  ))
);

-- ===== Audit answers =====
create table public.audit_answers (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  process_id uuid not null references public.org_processes(id) on delete cascade,
  clause text not null,
  kind text not null default 'generic',        -- generic | specific | custom
  q_ref text,                                  -- index/id of question
  question_text text,
  note text,
  status text not null default 'pending',      -- pending | conform | minor | major | observation | na
  severity text,
  auditor_name text,
  auditee_name text,
  updated_at timestamptz not null default now(),
  unique (audit_id, process_id, clause, kind, q_ref)
);
alter table public.audit_answers enable row level security;
create policy "answers: members view" on public.audit_answers for select using (
  exists (select 1 from public.audits a where a.id = audit_id and public.is_org_member(auth.uid(), a.org_id))
);
create policy "answers: members write" on public.audit_answers for insert with check (
  exists (select 1 from public.audits a where a.id = audit_id and public.is_org_member(auth.uid(), a.org_id))
);
create policy "answers: members update" on public.audit_answers for update using (
  exists (select 1 from public.audits a where a.id = audit_id and public.is_org_member(auth.uid(), a.org_id))
);
create policy "answers: lead delete" on public.audit_answers for delete using (
  exists (select 1 from public.audits a where a.id = audit_id and (
    public.has_role(auth.uid(), a.org_id, 'owner')
    or public.has_role(auth.uid(), a.org_id, 'admin')
    or public.has_role(auth.uid(), a.org_id, 'lead_auditor')
  ))
);
create trigger touch_answers before update on public.audit_answers for each row execute function public.touch_updated_at();

-- ===== Custom questions =====
create table public.custom_questions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  standard text not null,
  process_key text not null,
  clause text not null,
  kind text not null default 'specific',     -- generic | specific
  text text not null,
  evidence text,
  reference text,
  active boolean not null default true,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.custom_questions enable row level security;
create policy "cq: members view" on public.custom_questions for select using (public.is_org_member(auth.uid(), org_id));
create policy "cq: lead+admin write" on public.custom_questions for insert with check (
  public.has_role(auth.uid(), org_id, 'owner')
  or public.has_role(auth.uid(), org_id, 'admin')
  or public.has_role(auth.uid(), org_id, 'lead_auditor')
);
create policy "cq: lead+admin update" on public.custom_questions for update using (
  public.has_role(auth.uid(), org_id, 'owner')
  or public.has_role(auth.uid(), org_id, 'admin')
  or public.has_role(auth.uid(), org_id, 'lead_auditor')
);
create policy "cq: admin delete" on public.custom_questions for delete using (
  public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin')
);
create trigger touch_cq before update on public.custom_questions for each row execute function public.touch_updated_at();

-- ===== Findings =====
create table public.findings (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  clause text,
  type text not null default 'minor',         -- major|minor|observation|opportunity
  description text not null,
  root_cause text,
  capa text,
  owner text,
  due_date date,
  status text not null default 'open',        -- open|in_progress|closed
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.findings enable row level security;
create policy "findings: members view" on public.findings for select using (public.is_org_member(auth.uid(), org_id));
create policy "findings: members insert" on public.findings for insert with check (public.is_org_member(auth.uid(), org_id));
create policy "findings: lead+admin update" on public.findings for update using (
  public.has_role(auth.uid(), org_id, 'owner')
  or public.has_role(auth.uid(), org_id, 'admin')
  or public.has_role(auth.uid(), org_id, 'lead_auditor')
);
create policy "findings: admin delete" on public.findings for delete using (public.has_role(auth.uid(), org_id, 'owner') or public.has_role(auth.uid(), org_id, 'admin'));
create trigger touch_findings before update on public.findings for each row execute function public.touch_updated_at();

-- ===== Paystack transactions =====
create table public.paystack_transactions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null,
  reference text not null unique,
  pack text not null,
  amount_ngn integer not null,
  status text not null default 'pending',
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.paystack_transactions enable row level security;
create policy "ptx: members view" on public.paystack_transactions for select using (public.is_org_member(auth.uid(), org_id));
create policy "ptx: members insert" on public.paystack_transactions for insert with check (public.is_org_member(auth.uid(), org_id) and user_id = auth.uid());
create trigger touch_ptx before update on public.paystack_transactions for each row execute function public.touch_updated_at();

-- ===== Storage bucket: logos =====
insert into storage.buckets (id, name, public) values ('logos', 'logos', true)
  on conflict (id) do nothing;

create policy "logos: public read" on storage.objects for select using (bucket_id = 'logos');
create policy "logos: auth upload" on storage.objects for insert with check (bucket_id = 'logos' and auth.uid() is not null);
create policy "logos: auth update" on storage.objects for update using (bucket_id = 'logos' and auth.uid() is not null);
