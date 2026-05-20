import { supabase } from "@/integrations/supabase/client";
import { PROCESSES } from "@/data/processAudit";

/** Idempotently inserts the 18 standard processes for an org. */
export async function seedStandardProcesses(orgId: string) {
  const { data: existing } = await supabase
    .from("org_processes").select("key").eq("org_id", orgId);
  const have = new Set((existing ?? []).map((r) => r.key));
  const rows = PROCESSES.filter((p) => !have.has(p.key)).map((p) => ({
    org_id: orgId, key: p.key, name: p.name, scope: p.scope, is_custom: false,
  }));
  if (rows.length) await supabase.from("org_processes").insert(rows);
}