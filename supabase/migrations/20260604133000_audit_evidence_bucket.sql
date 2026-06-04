-- ===== Storage bucket: audit-evidence =====
insert into storage.buckets (id, name, public) values ('audit-evidence', 'audit-evidence', true)
  on conflict (id) do nothing;

create policy "audit-evidence: public read objects" on storage.objects
  for select
  using (bucket_id = 'audit-evidence' and (auth.role() = 'anon' or auth.role() = 'authenticated'));

create policy "audit-evidence: auth upload" on storage.objects
  for insert
  with check (bucket_id = 'audit-evidence' and auth.uid() is not null);

create policy "audit-evidence: auth update" on storage.objects
  for update
  using (bucket_id = 'audit-evidence' and auth.uid() is not null);

create policy "audit-evidence: auth delete" on storage.objects
  for delete
  using (bucket_id = 'audit-evidence' and auth.uid() is not null);
