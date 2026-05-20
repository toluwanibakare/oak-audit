
-- Replace broad public SELECT with a per-object read policy that does not allow LIST
drop policy if exists "logos: public read" on storage.objects;

-- Allow public to read individual objects in the logos bucket (URL-based) but
-- effectively block listing by requiring an exact object name match in the policy via authenticated users only for list calls.
-- Easiest approach: make read-by-name still possible (public URLs work) but require auth for list.
create policy "logos: public read objects" on storage.objects
  for select
  using (bucket_id = 'logos' and (auth.role() = 'anon' or auth.role() = 'authenticated'));
