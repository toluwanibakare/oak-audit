import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ModulePage, WCard, WPlaceholder, WBadge, Annotation } from "@/components/module-page";
import { useAuditStore } from "@/lib/audit-store";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics — AuditOS" }, { name: "description", content: "Generate audit, NC, CAPA, risk and executive reports." }] }),
  component: Page,
});

type Fmt = "PDF" | "Excel" | "Word" | "PPT";

function Page() {
  const state = useAuditStore((s) => s);
  const plans = useMemo(() => Object.values(state.plans), [state.plans]);
  const ncs = useMemo(() => Object.values(state.collections.nonconformities ?? {}), [state.collections.nonconformities]);
  const actions = useMemo(() => Object.values(state.collections.actions ?? {}), [state.collections.actions]);

  const REPORTS = [
    { key: "audit",     name: "Audit Report",              desc: "Complete report for a selected audit including scope, findings and coverage.",  fn: () => auditReport(plans, ncs) },
    { key: "nc",        name: "Nonconformity Report",      desc: "All open, in-progress and closed nonconformities by severity.",                    fn: () => ncReport(ncs) },
    { key: "capa",      name: "Corrective Action Report",  desc: "CAPA aging, ownership and effectiveness verification status.",                     fn: () => capaReport(actions) },
    { key: "risk",      name: "Risk Report",               desc: "Risk register with inherent/residual scoring and treatment status.",               fn: () => genericReport("Risk Report", state.collections.risks ?? {}) },
    { key: "mrm",       name: "Management Review Report",  desc: "Consolidated inputs and outputs for management review meetings.",                  fn: () => mrmReport(plans, ncs, actions) },
    { key: "supplier",  name: "Supplier Audit Report",     desc: "Second-party audits with supplier scorecards and improvement plans.",              fn: () => genericReport("Supplier Audits", state.collections.suppliers ?? {}) },
  ];

  return (
    <ModulePage title="Reports & Analytics">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {REPORTS.map((r) => (
          <ReportCard key={r.key} name={r.name} desc={r.desc} onGenerate={(fmt) => download(r.name, fmt, r.fn())} />
        ))}
      </div>

      <WCard title="Executive Compliance Dashboard" hint="High-level view for leadership">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ["Compliance",       `${Math.round(100 - (ncs.filter((n: any) => n.severity === "Major").length * 3))}%`],
            ["Audit Completion", `${Math.round((plans.filter((p) => p.status === "Approved").length / Math.max(plans.length, 1)) * 100)}%`],
            ["Open NCs",         String(ncs.filter((n: any) => n.status !== "Closed").length)],
            ["Overdue Actions",  String(actions.filter((a: any) => a.status !== "Closed" && a.due < new Date().toISOString().slice(0, 10)).length)],
          ].map(([l, v]) => (
            <div key={l} className="rounded-md border border-border p-3"><Annotation>{l}</Annotation><div className="text-xl font-semibold mt-1">{v}</div></div>
          ))}
        </div>
        <div className="grid grid-cols-12 gap-3 mt-3">
          <WPlaceholder className="col-span-12 md:col-span-8" label="AUDIT TRENDS" height={180} />
          <WPlaceholder className="col-span-12 md:col-span-4" label="DEPT PERFORMANCE" height={180} />
        </div>
      </WCard>
    </ModulePage>
  );
}

function ReportCard({ name, desc, onGenerate }: { name: string; desc: string; onGenerate: (fmt: Fmt) => void }) {
  const [fmt, setFmt] = useState<Fmt>("PDF");
  return (
    <WCard title={name} hint={desc}>
      <div className="rounded-md border border-dashed border-border h-[140px] grid place-items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-2"><FileText className="h-4 w-4" /> Report preview</div>
      </div>
      <div className="flex gap-2 mt-3 items-center">
        {(["PDF", "Excel", "Word", "PPT"] as Fmt[]).map((f) => (
          <button key={f} onClick={() => setFmt(f)}
            className={`h-7 px-2 rounded border text-[11px] ${fmt === f ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"}`}>
            {f}
          </button>
        ))}
        <button onClick={() => onGenerate(fmt)} className="ml-auto h-8 px-3 rounded bg-foreground text-background text-xs font-medium inline-flex items-center gap-1.5">
          <Download className="h-3.5 w-3.5" /> Generate
        </button>
      </div>
    </WCard>
  );
}

// ---- content builders ----
function auditReport(plans: any[], ncs: any[]) {
  const lines = ["AUDIT REPORT", "="],
    now = new Date().toISOString().slice(0, 10);
  lines.push(`Generated: ${now}`, "");
  plans.forEach((p) => {
    lines.push(`# ${p.id} · ${p.title}`, `Standard: ${p.standard} · Lead: ${p.lead} · ${p.startDate} → ${p.endDate}`);
    lines.push(`Departments: ${p.department}`, `Status: ${p.status}`);
    const findings = ncs.filter((n: any) => n.auditor === p.lead);
    lines.push(`Findings: ${findings.length}`, "");
  });
  return lines.join("\n");
}
function ncReport(ncs: any[]) {
  const rows = [["ID", "Clause", "Severity", "Department", "Owner", "Due", "Status"].join("\t")];
  ncs.forEach((n: any) => rows.push([n.id, n.clause, n.severity, n.department, n.owner, n.due, n.status].join("\t")));
  return "NONCONFORMITY REPORT\n" + rows.join("\n");
}
function capaReport(actions: any[]) {
  const rows = [["ID", "Title", "Owner", "Priority", "Due", "Status"].join("\t")];
  actions.forEach((a: any) => rows.push([a.id, a.title, a.owner, a.priority, a.due, a.status].join("\t")));
  return "CORRECTIVE ACTION REPORT\n" + rows.join("\n");
}
function mrmReport(plans: any[], ncs: any[], actions: any[]) {
  return [
    "MANAGEMENT REVIEW REPORT",
    `Audits total: ${plans.length}`,
    `Open NCs: ${ncs.filter((n: any) => n.status !== "Closed").length}`,
    `Open Actions: ${actions.filter((a: any) => a.status !== "Closed").length}`,
    "",
    "Inputs: audit results, customer feedback, process performance, corrective actions, risks.",
    "Outputs: improvement opportunities, resource needs, changes to the QMS.",
  ].join("\n");
}
function genericReport(title: string, coll: Record<string, any>) {
  const items = Object.values(coll);
  return `${title.toUpperCase()}\nTotal: ${items.length}\n\n` + items.map((i) => JSON.stringify(i)).join("\n");
}

function download(name: string, fmt: Fmt, content: string) {
  const ext = fmt === "Excel" ? "csv" : fmt === "Word" ? "doc" : fmt === "PPT" ? "txt" : "txt";
  const mime = "text/plain;charset=utf-8";
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.${ext}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast.success(`${name} generated as ${fmt}`);
}
