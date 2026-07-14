import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, WCard, WBadge, Annotation } from "@/components/module-page";
import { auditStore, useAuditStore, nextAuditId, type AuditPlan } from "@/lib/audit-store";
import { auditsApi, auditRecordToPlan } from "@/lib/api/audits";
import { orgsApi } from "@/lib/api/orgs";
import { EntityDialog, type FieldDef } from "@/components/entity";
import { Pencil, Trash2 } from "lucide-react";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/audits/schedule")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Audit Schedule — AuditOS" }, { name: "description", content: "Time-boxed audit schedule across the program." }] }),
  component: Page,
});

const FIELDS: FieldDef[] = [
  { key: "title", label: "Title", required: true },
  { key: "standard", label: "Standard", required: true },
  { key: "department", label: "Department" },
  { key: "lead", label: "Lead" },
  { key: "startDate", label: "Start", type: "date", required: true },
  { key: "endDate", label: "End", type: "date", required: true },
];

function Page() {
  const navigate = useNavigate();
  const plans = useAuditStore((s) => Object.values(s.plans))
    .slice()
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const [editing, setEditing] = useState<AuditPlan | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const orgs = await orgsApi.list();
        if (orgs.length === 0) return;
        const records = await auditsApi.list(orgs[0].id);
        const existing = auditStore.getSnapshot().plans;
        const existingArr = Object.values(existing);
        for (const r of records) {
          const byServerId = existingArr.find((p) => p.serverId === r.id);
          if (byServerId) {
            if (existing[r.id]) auditStore.removePlan(r.id);
            continue;
          }
          if (existing[r.id]) {
            auditStore.removePlan(r.id);
          }
          auditStore.upsertPlan({ ...auditRecordToPlan(r), id: nextAuditId() } as any);
        }
      } catch (e) {
        console.error("[schedule] failed to load audits from API", e);
      }
    })();
  }, []);

  return (
    <ModulePage title="Audit Schedule" description="Timeline view of all audits. Reschedule by editing dates inline.">
      <div className="wire-card rounded-lg p-3 flex items-center gap-3">
        <Annotation>{plans.length} scheduled audits</Annotation>
        <div className="ml-auto">
          <Link to="/audits/new" className="h-8 px-3 inline-flex items-center rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90">+ New Audit</Link>
        </div>
      </div>

      <WCard title="Schedule">
        {plans.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-sm">No audits scheduled yet.</div>
        ) : (
          <div className="space-y-2">
            {plans.map((p) => (
              <div key={p.id} className="grid grid-cols-12 gap-3 items-center border-b border-dashed border-border py-2">
                <div className="col-span-2 font-mono text-[11px]">{p.id}</div>
                <div className="col-span-3 text-xs font-medium truncate">{p.title}</div>
                <div className="col-span-2 text-xs text-muted-foreground">{p.standard.split(":")[0]} · {p.department}</div>
                <div className="col-span-2 text-xs whitespace-nowrap">{p.startDate} → {p.endDate}</div>
                <div className="col-span-1"><WBadge tone={p.status === "Approved" ? "strong" : "outline"}>{p.status}</WBadge></div>
                <div className="col-span-2 flex gap-1 justify-end">
                  {p.status === "Draft" ? (
                    <button onClick={() => navigate({ to: "/audits/new", search: { planId: p.id } })} className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-muted" title="Open in wizard">
                      <Pencil className="h-3 w-3" />
                    </button>
                  ) : (
                    <button onClick={() => setEditing(p)} className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-muted"><Pencil className="h-3 w-3" /></button>
                  )}
                  <button onClick={async () => { if (!confirm(`Delete ${p.id}?`)) return; const orgs = await orgsApi.list(); if (orgs.length) try { await auditsApi.delete(orgs[0].id, p.serverId || p.id); } catch {} auditStore.removePlan(p.id); }} className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-muted"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </WCard>

      {editing && (
        <EntityDialog
          fields={FIELDS}
          item={editing as any}
          title={`Reschedule ${editing.id}`}
          onClose={() => setEditing(null)}
          onSubmit={(values) => { auditStore.upsertPlan({ ...editing, ...(values as any) }); setEditing(null); }}
        />
      )}
    </ModulePage>
  );
}
