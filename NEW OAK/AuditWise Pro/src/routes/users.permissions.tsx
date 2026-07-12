import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ModulePage, WCard, WBadge, Annotation } from "@/components/module-page";
import { auditStore, useAuditStore, type EntityItem } from "@/lib/audit-store";
import { entitiesApi } from "@/lib/api/entities";
import { orgsApi } from "@/lib/api/orgs";
import { requireAuth } from "@/lib/require-auth";
import { RefreshCw } from "lucide-react";

export const Route = createFileRoute("/users/permissions")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Permissions Matrix — AuditOS" }, { name: "description", content: "Role × module access matrix." }] }),
  component: Page,
});

const MODULES = ["Audits", "Findings", "Corrective Actions", "Risk", "Reports", "Organization", "Users", "Settings"];
const LEVELS = ["—", "R", "RW", "Full"] as const;

function Page() {
  const roles = useAuditStore((s) => Object.values(s.collections.roles ?? {}));
  const matrix = useAuditStore((s) => s.collections.permissions ?? {});
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const orgs = await orgsApi.list();
        if (orgs.length === 0) return;
        const orgId = orgs[0].id;

        const [remoteRoles, remotePerms] = await Promise.all([
          entitiesApi.list(orgId, "roles").catch(() => []),
          entitiesApi.list(orgId, "permissions").catch(() => []),
        ]);

        // Populate roles store if empty
        const localRoles = Object.values(auditStore.list("roles"));
        if (localRoles.length === 0 && remoteRoles.length > 0) {
          for (const r of remoteRoles) {
            auditStore.create("roles", r as any, "R");
          }
        }

        // Populate permissions store
        for (const p of remotePerms) {
          const key = `${p.role}__${p.module}`;
          const existing = auditStore.get("permissions", key);
          if (!existing) {
            auditStore.create("permissions", { ...p, id: key } as any, "PERM");
          }
        }
      } catch {}
      setSyncing(false);
    })();
  }, []);

  const lookup = useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    for (const k of Object.keys(matrix)) {
      const it: any = matrix[k];
      if (!m[it.role]) m[it.role] = {};
      m[it.role][it.module] = Number(it.level ?? 0);
    }
    return m;
  }, [matrix]);

  async function setLevel(role: string, mod: string, lvl: number) {
    const id = `${role}__${mod}`;
    const cur = matrix[id] as EntityItem | undefined;
    if (cur) auditStore.update("permissions", id, { level: lvl });
    else auditStore.create("permissions", { id, role, module: mod, level: lvl }, "PERM");

    // Sync to backend
    try {
      const orgs = await orgsApi.list();
      if (orgs.length === 0) return;
      const orgId = orgs[0].id;
      if (cur) {
        await entitiesApi.update(orgId, "permissions", cur.id, { role, module: mod, level: lvl });
      } else {
        await entitiesApi.create(orgId, "permissions", { id, role, module: mod, level: lvl });
      }
    } catch {}
  }

  return (
    <ModulePage title="Permissions Matrix" description="Click a cell to cycle access level: — · R · RW · Full">
      {syncing && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-xs text-muted-foreground mb-3">
          <RefreshCw className="h-3 w-3 animate-spin" /> Syncing permissions...
        </div>
      )}
      <WCard title="Roles × Modules">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-2 pr-3 annotation">MODULE</th>
                {roles.map((r) => <th key={r.id} className="py-2 px-2 annotation text-center">{r.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m) => (
                <tr key={m} className="border-b border-dashed border-border">
                  <td className="py-2 pr-3 font-medium">{m}</td>
                  {roles.map((r) => {
                    const lvl = lookup[r.name]?.[m] ?? 0;
                    return (
                      <td key={r.id} className="py-2 px-2 text-center">
                        <button
                          onClick={() => setLevel(r.name, m, (lvl + 1) % 4)}
                          className={"h-7 min-w-[44px] rounded text-[11px] font-medium border " +
                            (lvl >= 3 ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted")}
                        >{LEVELS[lvl]}</button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex gap-3 text-[11px] text-muted-foreground items-center">
          <Annotation>LEGEND</Annotation>
          <WBadge tone="outline">—</WBadge> No access
          <WBadge tone="outline">R</WBadge> Read
          <WBadge tone="outline">RW</WBadge> Read / Write
          <WBadge tone="strong">Full</WBadge> Full control
        </div>
      </WCard>
    </ModulePage>
  );
}
