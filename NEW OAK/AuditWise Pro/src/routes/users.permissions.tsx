import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage, WCard, WBadge, Annotation } from "@/components/module-page";
import { auditStore, useAuditStore, type EntityItem } from "@/lib/audit-store";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/users/permissions")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Permissions Matrix — AuditOS" }, { name: "description", content: "Role × module access matrix." }] }),
  component: Page,
});

const MODULES = ["Audits", "Findings", "Corrective Actions", "Risk", "Reports", "Organization", "Users", "Settings"];
const LEVELS = ["—", "R", "RW", "Full"] as const;

const SEED: Record<string, Record<string, number>> = {
  Admin: Object.fromEntries(MODULES.map((m) => [m, 3])),
  "Lead Auditor": { Audits: 3, Findings: 3, "Corrective Actions": 2, Risk: 2, Reports: 2, Organization: 1, Users: 0, Settings: 0 },
  Auditor: { Audits: 2, Findings: 2, "Corrective Actions": 1, Risk: 1, Reports: 1, Organization: 1, Users: 0, Settings: 0 },
  Manager: { Audits: 1, Findings: 2, "Corrective Actions": 2, Risk: 2, Reports: 2, Organization: 1, Users: 0, Settings: 0 },
  Viewer: Object.fromEntries(MODULES.map((m) => [m, 1])),
};

function Page() {
  const roles = useAuditStore((s) => Object.values(s.collections.roles ?? {}));
  const matrix = useAuditStore((s) => s.collections.permissions ?? {});

  const lookup = useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    for (const r of roles) {
      m[r.name] = { ...(SEED[r.name] ?? Object.fromEntries(MODULES.map((x) => [x, 1]))) };
    }
    for (const k of Object.keys(matrix)) {
      const it: any = matrix[k];
      if (!m[it.role]) m[it.role] = {};
      m[it.role][it.module] = Number(it.level ?? 0);
    }
    return m;
  }, [roles, matrix]);

  function setLevel(role: string, mod: string, lvl: number) {
    const id = `${role}__${mod}`;
    const cur = matrix[id] as EntityItem | undefined;
    if (cur) auditStore.update("permissions", id, { level: lvl });
    else auditStore.create("permissions", { id, role, module: mod, level: lvl }, "PERM");
  }

  return (
    <ModulePage annotation="08 · PERMISSIONS" title="Permissions Matrix" description="Click a cell to cycle access level: — · R · RW · Full">
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
