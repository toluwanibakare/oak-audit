import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ModulePage, WCard, WBadge, Annotation } from "@/components/module-page";
import { auditStore, useAuditStore, type AuditPlan } from "@/lib/audit-store";
import { EntityDialog, type FieldDef } from "@/components/entity";
import { Pencil, Trash2 } from "lucide-react";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/audits/schedule")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Audit Schedule — AuditOS" }, { name: "description", content: "Time-boxed audit schedule across the program." }] }),
  component: Page,
});

const STANDARDS = ["ISO 9001:2015", "ISO 14001:2015", "ISO 45001:2018", "ISO/IEC 27001:2022", "ISO 22301:2019"];
const DEPARTMENTS = ["Operations", "HSE", "IT & Security", "Quality", "Logistics", "HR"];
const LEADS = ["M. Chen", "R. Patel", "L. Okafor", "S. Müller", "J. Auditor"];

const FIELDS: FieldDef[] = [
  { key: "title", label: "Title", required: true },
  { key: "standard", label: "Standard", type: "select", options: STANDARDS, required: true },
  { key: "department", label: "Department", type: "select", options: DEPARTMENTS },
  { key: "lead", label: "Lead", type: "select", options: LEADS },
  { key: "startDate", label: "Start", type: "date", required: true },
  { key: "endDate", label: "End", type: "date", required: true },
];

function Page() {
  const plans = useAuditStore((s) => Object.values(s.plans))
    .slice()
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const [editing, setEditing] = useState<AuditPlan | null>(null);

  return (
    <ModulePage annotation="02 · SCHEDULE" title="Audit Schedule" description="Timeline view of all audits. Reschedule by editing dates inline.">
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
                  <button onClick={() => setEditing(p)} className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-muted"><Pencil className="h-3 w-3" /></button>
                  <button onClick={() => { if (confirm(`Delete ${p.id}?`)) auditStore.removePlan(p.id); }} className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-muted"><Trash2 className="h-3 w-3" /></button>
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
