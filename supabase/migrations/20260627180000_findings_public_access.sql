-- Migration to allow public select and update on findings for auditee access
CREATE POLICY "findings: public select by id" ON public.findings
  FOR SELECT TO public USING (true);

CREATE POLICY "findings: public update by id" ON public.findings
  FOR UPDATE TO public USING (true) WITH CHECK (true);
