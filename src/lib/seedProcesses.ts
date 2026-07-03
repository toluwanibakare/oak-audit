import { processesApi } from "@/api/processes";
import { PROCESSES } from "@/data/processAudit";

/** Idempotently inserts the 18 standard processes for an org. */
export async function seedStandardProcesses(orgId: string) {
  try {
    const existing = await processesApi.list(orgId);
    const have = new Set(existing.map((r: any) => r.key));
    const rows = PROCESSES.filter((p) => !have.has(p.key));
    for (const row of rows) {
      await processesApi.create(orgId, {
        key: row.key, name: row.name, scope: row.scope, is_custom: false,
      });
    }
  } catch (err) {
    console.error("Failed to seed processes", err);
  }
}