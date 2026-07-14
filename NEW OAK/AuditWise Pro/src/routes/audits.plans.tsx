import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ModulePage, WCard, WBadge, Annotation } from "@/components/module-page";
import { auditStore, useAuditStore, type AuditPlan } from "@/lib/audit-store";
import { auditsApi, auditRecordToPlan } from "@/lib/api/audits";
import { orgsApi } from "@/lib/api/orgs";
import { EntityDialog, type FieldDef } from "@/components/entity";
import { Pencil, Trash2, Plus, CheckCircle2, XCircle, Send } from "lucide-react";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/audits/plans")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Audit Plans — AuditOS" }, { name: "description", content: "Manage audit plans across ISO standards." }] }),
  component: Page,
});

const STATUSES: AuditPlan["status"][] = ["Draft", "Pending Approval", "Approved", "Rejected"];

const FIELDS: FieldDef[] = [
  { key: "title", label: "Audit Title", required: true },
  { key: "standard", label: "ISO Standard", required: true },
  { key: "department", label: "Department" },
  { key: "location", label: "Location" },
  { key: "lead", label: "Lead Auditor" },
  { key: "teamCount", label: "Team Size", type: "number" },
  { key: "startDate", label: "Start Date", type: "date", required: true },
  { key: "endDate", label: "End Date", type: "date", required: true },
  { key: "status", label: "Status", type: "select", options: STATUSES as unknown as string[] },
];

function Page() {
  const navigate = useNavigate();
  const plans = useAuditStore((s) => Object.values(s.plans));
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("All");
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
        console.error("[plans] failed to load audits from API", e);
      }
    })();
  }, []);

  const filtered = useMemo(() => plans
    .filter((p) => status === "All" || p.status === status)
    .filter((p) => !q || (p.title + p.id + p.standard + p.department).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [plans, q, status]);

  function changeStatus(p: AuditPlan, next: AuditPlan["status"]) {
    auditStore.upsertPlan({ ...p, status: next });
    auditStore.notify({ channel: "in-app", to: p.lead, subject: `Audit ${p.id} → ${next}`, body: p.title });
  }

  const counts = STATUSES.map((s) => ({ s, n: plans.filter((p) => p.status === s).length }));

  return (
    <ModulePage title="Audit Plans" description="All audit plans created via the wizard or directly here. Status changes notify the lead auditor.">
      <div className="grid grid-cols-4 gap-3">
        {counts.map((c) => (
          <WCard key={c.s} title={c.s}><div className="text-2xl font-semibold">{c.n}</div><Annotation>PLANS</Annotation></WCard>
        ))}
      </div>

      <div className="wire-card rounded-lg p-3 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, ID, standard…" className="h-8 px-2 rounded-md border border-input bg-muted/30 text-xs min-w-[260px]" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-8 px-2 rounded-md border border-input bg-muted/30 text-xs">
          <option>All</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <Annotation>{filtered.length} of {plans.length}</Annotation>
        <div className="ml-auto flex gap-2">
          <Link to="/audits/calendar" className="h-8 px-3 inline-flex items-center rounded-md border border-border text-xs hover:bg-muted">Open Calendar</Link>
          <Link to="/audits/new" className="h-8 px-3 inline-flex items-center gap-1 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90">
            <Plus className="h-3.5 w-3.5" /> New Audit
          </Link>
        </div>
      </div>

      <div className="wire-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 border-b border-border">
              <tr className="text-left">
                {["ID", "Title", "Standard", "Department", "Lead", "Dates", "Status", "Actions"].map((h) => (
                  <th key={h} className="py-2.5 px-3 annotation font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-10 text-center text-muted-foreground">No plans yet. Launch the wizard to create one.</td></tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-dashed border-border hover:bg-muted/30">
                  <td className="py-2.5 px-3 font-mono text-[11px]">{p.id}</td>
                  <td className="py-2.5 px-3 font-medium">{p.title}</td>
                  <td className="py-2.5 px-3">{p.standard}</td>
                  <td className="py-2.5 px-3">{p.department}</td>
                  <td className="py-2.5 px-3">{p.lead}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">{p.startDate} → {p.endDate}</td>
                  <td className="py-2.5 px-3">
                    <WBadge tone={p.status === "Approved" ? "strong" : "outline"}>{p.status}</WBadge>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex gap-1">
                      {p.status === "Draft" && (
                        <button onClick={() => changeStatus(p, "Pending Approval")} className="h-7 px-2 rounded border border-border text-[11px] hover:bg-muted inline-flex items-center gap-1" title="Submit">
                          <Send className="h-3 w-3" /> Submit
                        </button>
                      )}
                      {p.status === "Pending Approval" && (
                        <>
                          <button onClick={() => changeStatus(p, "Approved")} className="h-7 px-2 rounded border border-border text-[11px] hover:bg-muted inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Approve
                          </button>
                          <button onClick={() => changeStatus(p, "Rejected")} className="h-7 px-2 rounded border border-border text-[11px] hover:bg-muted inline-flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Reject
                          </button>
                        </>
                      )}
                      <button onClick={() => navigate({ to: "/execution/conduct" })} className="h-7 px-2 rounded border border-border text-[11px] hover:bg-muted">Conduct</button>
                      {p.status === "Draft" ? (
                        <button onClick={() => navigate({ to: "/audits/new", search: { planId: p.id } })} className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-muted" title="Open in wizard">
                          <Pencil className="h-3 w-3" />
                        </button>
                      ) : (
                        <button onClick={() => setEditing(p)} className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-muted"><Pencil className="h-3 w-3" /></button>
                      )}
                      <button onClick={() => { if (confirm(`Delete ${p.id}?`)) auditStore.removePlan(p.id); }} className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-muted"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <EntityDialog
          fields={FIELDS}
          item={editing as any}
          title={`Edit ${editing.id}`}
          onClose={() => setEditing(null)}
          onSubmit={(values) => {
            auditStore.upsertPlan({ ...editing, ...(values as any), teamCount: Number(values.teamCount ?? editing.teamCount ?? 0) });
            setEditing(null);
          }}
        />
      )}
    </ModulePage>
  );
}
