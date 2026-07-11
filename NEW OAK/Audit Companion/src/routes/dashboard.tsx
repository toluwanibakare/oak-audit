import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useWorkflow } from "@/lib/workflow/store";
import { STAGE_ORDER } from "@/lib/workflow/config";
import { Shield, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — OakAudix" },
      { name: "description", content: "Live enterprise audit dashboard: open audits, CAPA status, overdue actions, compliance score, and risk heat map." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const programmes = useWorkflow(s => s.programmes);

  const open = programmes.filter(p => p.stages.closure.status !== "Approved" && p.stages.closure.status !== "Completed");
  const completed = programmes.length - open.length;
  const allFindings = programmes.flatMap(p => p.findings);
  const allCapas = programmes.flatMap(p => p.capas);
  const overdue = allCapas.filter(c => new Date(c.dueDate) < new Date() && c.status !== "Verified" && c.status !== "Closed");
  const closedRate = allCapas.length ? Math.round(allCapas.filter(c => c.status === "Verified" || c.status === "Closed").length / allCapas.length * 100) : 0;
  const compliance = programmes.length ? Math.round(programmes.reduce((s, p) => {
    const total = p.checklist.length || 1;
    const passed = p.inspection.filter(r => r.value === "Yes" || r.value === "Pass").length;
    return s + (passed / total) * 100;
  }, 0) / programmes.length) : 0;

  // heat map: severity x probability
  const heat = Array.from({length: 5}, () => Array(5).fill(0));
  for (const f of allFindings) heat[5 - f.probability][f.severity - 1]++;

  // dept/site/auditor rank
  const byGroup = (fn: (p: typeof programmes[number]) => string) => {
    const m = new Map<string, number>();
    for (const p of programmes) { const k = fn(p) || "—"; m.set(k, (m.get(k) ?? 0) + 1); }
    return [...m.entries()].sort((a,b) => b[1] - a[1]).slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold"><Shield className="h-5 w-5 text-[var(--teal,#0d9488)]" /> OakAudix</Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/workflow" className="text-slate-600 hover:text-slate-900">Workflow</Link>
            <Link to="/dashboard" className="font-semibold">Dashboard</Link>
            <Link to="/workflow-admin" className="text-slate-600 hover:text-slate-900">Admin</Link>
          </nav>
        </div>
      </header>
      <div className="container-page py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Enterprise dashboard</h1>
          <p className="text-sm text-slate-600">Real-time metrics from the workflow engine.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Widget label="Open audits" value={open.length} />
          <Widget label="Completed audits" value={completed} />
          <Widget label="Open findings" value={allFindings.length} />
          <Widget label="Overdue CAPA" value={overdue.length} tone={overdue.length ? "warn" : "ok"} />
          <Widget label="CAPA closure rate" value={`${closedRate}%`} />
          <Widget label="Compliance score" value={`${compliance}%`} />
          <Widget label="Programmes total" value={programmes.length} />
          <Widget label="Upcoming (next 30d)" value={programmes.filter(p => new Date(p.targetDate) < new Date(Date.now()+30*86400000)).length} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="Risk heat map (probability × severity)">
            <div className="grid grid-cols-5 gap-1">
              {heat.flat().map((n, i) => {
                const intensity = Math.min(1, n / 3);
                return <div key={i} className="flex aspect-square items-center justify-center rounded text-xs font-semibold text-white"
                  style={{ background: `rgba(220, 38, 38, ${0.15 + intensity * 0.85})` }}>{n || ""}</div>;
              })}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">Rows: probability (high→low). Cols: severity (1→5).</p>
          </Panel>
          <Panel title="Stage distribution">
            <ul className="space-y-1 text-xs">
              {STAGE_ORDER.map(sid => {
                const n = programmes.filter(p => p.currentStage === sid).length;
                return <li key={sid} className="flex items-center gap-2">
                  <span className="w-40 text-slate-600">{sid}</span>
                  <div className="h-2 flex-1 rounded bg-slate-100"><div className="h-2 rounded bg-[var(--teal,#0d9488)]" style={{ width: `${programmes.length ? n/programmes.length*100 : 0}%` }} /></div>
                  <span className="w-8 text-right">{n}</span>
                </li>;
              })}
            </ul>
          </Panel>
          <Panel title="Department performance">
            <RankList data={byGroup(p => p.department)} />
          </Panel>
          <Panel title="Site performance">
            <RankList data={byGroup(p => p.site)} />
          </Panel>
          <Panel title="Auditor performance (programmes led)">
            <RankList data={byGroup(p => p.leadAuditor)} />
          </Panel>
          <Panel title="Upcoming audits">
            <ul className="space-y-1 text-xs">
              {[...programmes].sort((a,b) => a.targetDate.localeCompare(b.targetDate)).slice(0, 6).map(p => (
                <li key={p.id} className="flex items-center justify-between border-b border-slate-100 py-1">
                  <span>{p.code} · {p.title}</span>
                  <span className="text-slate-500">{p.targetDate}</span>
                </li>
              ))}
              {programmes.length === 0 && <li className="text-slate-500">No programmes yet — <Link to="/workflow" className="text-[var(--teal,#0d9488)] underline">create one</Link>.</li>}
            </ul>
          </Panel>
        </div>

        <Link to="/workflow" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--teal,#0d9488)]">Go to workflow <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}

function Widget({ label, value, tone }: { label: string; value: string | number; tone?: "warn" | "ok" }) {
  return (
    <div className={`rounded-lg border p-3 ${tone === "warn" ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white"}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (<div className="rounded-lg border border-slate-200 bg-white p-4"><p className="mb-2 text-sm font-semibold">{title}</p>{children}</div>);
}
function RankList({ data }: { data: [string, number][] }) {
  const max = Math.max(1, ...data.map(d => d[1]));
  return (
    <ul className="space-y-1 text-xs">
      {data.map(([k, v]) => (
        <li key={k} className="flex items-center gap-2">
          <span className="w-32 truncate text-slate-700">{k}</span>
          <div className="h-2 flex-1 rounded bg-slate-100"><div className="h-2 rounded bg-[var(--teal,#0d9488)]" style={{ width: `${v/max*100}%` }} /></div>
          <span className="w-6 text-right">{v}</span>
        </li>
      ))}
      {data.length === 0 && <li className="text-slate-500">No data yet.</li>}
    </ul>
  );
}
