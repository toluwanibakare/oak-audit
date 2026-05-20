import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  RISK_OPP_LIBRARY,
  RISK_OPP_STORAGE_KEY,
  RISK_OPP_STATUS_META,
  effectivenessScore,
  EFFECTIVENESS_META,
  inferDirection,
  type RiskOppState,
  type RiskOppStatus,
  type RiskOppType,
} from "@/data/riskOpportunity";
import { PROCESS_FAMILIES, type ProcessFamily } from "@/data/imsKpis";

const TYPES: ("All" | RiskOppType)[] = ["All", "Risk", "Opportunity"];
const STATUSES: RiskOppStatus[] = ["Open", "In progress", "Effective", "Not effective"];

function loadState(): RiskOppState {
  try {
    const raw = localStorage.getItem(RISK_OPP_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as RiskOppState;
  } catch { /* noop */ }
  return { records: {} };
}

export default function RiskOpportunity() {
  const [state, setState] = useState<RiskOppState>(loadState);
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [processes, setProcesses] = useState<ProcessFamily[]>([]);
  const [processQuery, setProcessQuery] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(RISK_OPP_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const filtered = useMemo(
    () => RISK_OPP_LIBRARY
      .filter((r) => type === "All" || r.type === type)
      .filter((r) => processes.length === 0 || processes.includes(r.process))
      .filter((r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase())),
    [type, processes, search],
  );

  function setRecord(id: string, patch: Partial<RiskOppState["records"][string]>) {
    setState((s) => ({ ...s, records: { ...s.records, [id]: { ...s.records[id], ...patch } } }));
  }

  function toggleProcess(p: ProcessFamily) {
    setProcesses((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
  }

  const stats = useMemo(() => {
    let risks = 0, opps = 0, effective = 0, notEffective = 0, inProgress = 0, open = 0;
    let on = 0, watch = 0, off = 0, pending = 0, scoreSum = 0, scored = 0;
    for (const r of filtered) {
      if (r.type === "Risk") risks++; else opps++;
      const st = state.records[r.id]?.status ?? "Open";
      if (st === "Effective") effective++;
      else if (st === "Not effective") notEffective++;
      else if (st === "In progress") inProgress++;
      else open++;
      const eff = effectivenessScore(r.kpiName, r.target, state.records[r.id]?.actualKpi, state.records[r.id]?.directionOverride);
      if (eff.level === "On") on++;
      else if (eff.level === "Watch") watch++;
      else if (eff.level === "Off") off++;
      else pending++;
      if (eff.level !== "Pending") { scoreSum += eff.score; scored++; }
    }
    const avgScore = scored ? Math.round(scoreSum / scored) : 0;
    return { risks, opps, effective, notEffective, inProgress, open, total: filtered.length, on, watch, off, pending, avgScore };
  }, [filtered, state.records]);

  function exportCsv() {
    const head = ["ID","Process","Type","Title","Context","Action","Evaluation method","KPI","Target","Owner","Due","Status","Actual KPI","Effectiveness score","Effectiveness level","Evaluation rule","Evidence label","Evidence URL","Notes"];
    const rows = filtered.map((r) => {
      const rec = state.records[r.id] ?? {};
      const eff = effectivenessScore(r.kpiName, r.target, rec.actualKpi);
      const effExp = effectivenessScore(r.kpiName, r.target, rec.actualKpi, rec.directionOverride);
      return [r.id,r.process,r.type,r.title,r.context,r.action,r.evaluation,r.kpiName,r.target, rec.owner ?? "", rec.dueDate ?? "", rec.status ?? "Open", rec.actualKpi ?? "", effExp.level === "Pending" ? "" : effExp.score, effExp.level, effExp.rule, rec.evidenceLabel ?? "", rec.evidenceUrl ?? "", rec.notes ?? ""];
    });
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `risks-opportunities.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 pt-8 pb-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">IMS · Risks & Opportunities</span>
                <span className="h-px w-12 bg-foreground/30" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Workspace</span>
              </div>
              <h1 className="mt-3 font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
                Conformia<span className="text-accent">.RiskOpp</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                Risks and opportunities for every IMS process — actions to address them and a clear method to evaluate the effectiveness of those actions (ISO 9001 §6.1, ISO 14001 §6.1, ISO 45001 §6.1).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/" className="rounded-sm border border-border px-4 py-2.5 text-sm hover:bg-secondary">← Audit</Link>
              <Link to="/kpi" className="rounded-sm border border-border px-4 py-2.5 text-sm hover:bg-secondary">KPI</Link>
              <button onClick={exportCsv} className="rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Export CSV</button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Type</span>
              <select value={type} onChange={(e) => setType(e.target.value as (typeof TYPES)[number])} className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Search</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Title or ID" className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm" />
            </label>
          </div>

          <div className="mt-4 rounded-sm border border-border bg-card p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Processes</span>
                <span className="text-xs text-muted-foreground">{processes.length === 0 ? "All processes" : `${processes.length} selected`}</span>
              </div>
              <div className="flex items-center gap-2">
                <input value={processQuery} onChange={(e) => setProcessQuery(e.target.value)} placeholder="Filter processes…" className="rounded-sm border border-border bg-background px-2 py-1 text-xs" />
                <button onClick={() => setProcesses([])} className="rounded-sm border border-border px-2 py-1 text-xs hover:bg-secondary">Clear</button>
                <button onClick={() => setProcesses([...PROCESS_FAMILIES])} className="rounded-sm border border-border px-2 py-1 text-xs hover:bg-secondary">Select all</button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PROCESS_FAMILIES.filter((p) => !processQuery || p.toLowerCase().includes(processQuery.toLowerCase())).map((p) => {
                const active = processes.includes(p);
                return (
                  <button key={p} onClick={() => toggleProcess(p)} className={`rounded-full border px-2.5 py-1 text-xs transition ${active ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background hover:bg-secondary"}`}>{p}</button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4 lg:grid-cols-7">
            {[
              { l: "Total", v: stats.total },
              { l: "Risks", v: stats.risks },
              { l: "Opportunities", v: stats.opps },
              { l: "Avg score", v: `${stats.avgScore}` },
              { l: "On target", v: stats.on, c: "bg-emerald-500" },
              { l: "Watch", v: stats.watch, c: "bg-amber-500" },
              { l: "Off target", v: stats.off, c: "bg-rose-500" },
            ].map((s) => (
              <div key={s.l} className="rounded-sm border border-border bg-card px-3 py-3">
                <div className="flex items-center gap-2">
                  {s.c && <span className={`h-1.5 w-1.5 rounded-full ${s.c}`} />}
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{s.l}</span>
                </div>
                <div className="mt-1 font-display text-2xl font-medium tabular-nums">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">
        <div className="overflow-auto rounded-sm border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left">
              <tr>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">ID</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Process / Item</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Action</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Effectiveness method</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Owner / Due</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">KPI / Actual</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Effectiveness</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const rec = state.records[r.id] ?? {};
                const status = rec.status ?? "Open";
                const meta = RISK_OPP_STATUS_META[status];
                const inferred = inferDirection(r.kpiName);
                const effectiveDir = rec.directionOverride ?? inferred;
                const eff = effectivenessScore(r.kpiName, r.target, rec.actualKpi, rec.directionOverride);
                const effMeta = EFFECTIVENESS_META[eff.level];
                const needsEvidence = eff.level === "On" || eff.level === "Watch";
                const hasEvidence = !!(rec.evidenceUrl && rec.evidenceUrl.trim());
                const safeUrl = hasEvidence && /^(https?:|mailto:|\/)/i.test(rec.evidenceUrl!.trim()) ? rec.evidenceUrl!.trim() : "";
                return (
                  <tr key={r.id} className="border-t border-border align-top">
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                      {r.id}
                      <div className={`mt-1 inline-flex rounded-sm border border-border px-1.5 py-0.5 text-[10px] ${r.type === "Risk" ? "text-rose-500" : "text-emerald-500"}`}>{r.type}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{r.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{r.process}{r.context ? ` · ${r.context}` : ""}</div>
                    </td>
                    <td className="px-3 py-3 text-sm">{r.action}</td>
                    <td className="px-3 py-3 text-xs">
                      <div>{r.evaluation}</div>
                      <div className="mt-1 text-muted-foreground">Target: {r.target} · {r.kpiName}</div>
                    </td>
                    <td className="px-3 py-3">
                      <input value={rec.owner ?? ""} onChange={(e) => setRecord(r.id, { owner: e.target.value })} placeholder="Owner" className="w-32 rounded-sm border border-border bg-card px-2 py-1 text-sm" />
                      <input type="date" value={rec.dueDate ?? ""} onChange={(e) => setRecord(r.id, { dueDate: e.target.value })} className="mt-1 block w-36 rounded-sm border border-border bg-card px-2 py-1 text-xs" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs text-muted-foreground">{r.kpiName}</div>
                      <input type="number" step="any" value={rec.actualKpi ?? ""} onChange={(e) => setRecord(r.id, { actualKpi: e.target.value === "" ? "" : Number(e.target.value) })} placeholder="Actual" className="mt-1 w-24 rounded-sm border border-border bg-card px-2 py-1 text-sm tabular-nums" />
                    </td>
                    <td className="px-3 py-3">
                      <div className={`inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 text-xs ${effMeta.chip}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${effMeta.dot}`} />
                        {effMeta.label}
                      </div>
                      <div className="mt-1 text-xs tabular-nums">
                        {eff.level === "Pending" ? <span className="text-muted-foreground">— / 100</span> : <span><span className="font-medium">{eff.score}</span><span className="text-muted-foreground"> / 100</span></span>}
                      </div>
                      <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-secondary">
                        <div className={`h-full ${eff.level === "On" ? "bg-emerald-500" : eff.level === "Watch" ? "bg-amber-500" : eff.level === "Off" ? "bg-rose-500" : "bg-muted-foreground/40"}`} style={{ width: `${eff.level === "Pending" ? 0 : eff.score}%` }} />
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground" title={eff.rule}>
                        On {eff.thresholds.on} · Watch {eff.thresholds.watch}
                      </div>
                      <div className="mt-2">
                        <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Direction</span>
                        <div className="mt-1 inline-flex overflow-hidden rounded-sm border border-border text-[10px]">
                          {(["higher","lower"] as const).map((d) => {
                            const active = effectiveDir === d;
                            return (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setRecord(r.id, { directionOverride: d })}
                                className={`px-2 py-0.5 ${active ? "bg-accent text-accent-foreground" : "bg-card hover:bg-secondary"}`}
                                title={d === "higher" ? "Higher actual is better" : "Lower actual is better"}
                              >
                                {d === "higher" ? "↑ higher" : "↓ lower"}
                              </button>
                            );
                          })}
                          {rec.directionOverride && (
                            <button
                              type="button"
                              onClick={() => setRecord(r.id, { directionOverride: undefined })}
                              className="border-l border-border bg-card px-2 py-0.5 hover:bg-secondary"
                              title={`Reset to inferred (${inferred})`}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <div className="mt-0.5 text-[9px] text-muted-foreground">
                          {rec.directionOverride ? "Manual override" : `Inferred: ${inferred}`}
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        <input
                          value={rec.evidenceLabel ?? ""}
                          onChange={(e) => setRecord(r.id, { evidenceLabel: e.target.value })}
                          placeholder="Evidence label (e.g. CAPA-2026-04)"
                          maxLength={120}
                          className="block w-44 rounded-sm border border-border bg-card px-2 py-1 text-[11px]"
                        />
                        <input
                          type="url"
                          value={rec.evidenceUrl ?? ""}
                          onChange={(e) => setRecord(r.id, { evidenceUrl: e.target.value })}
                          placeholder="Evidence URL (https://…)"
                          maxLength={2048}
                          className="block w-44 rounded-sm border border-border bg-card px-2 py-1 text-[11px]"
                        />
                        {hasEvidence ? (
                          safeUrl ? (
                            <a
                              href={safeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-accent underline-offset-2 hover:underline"
                            >
                              ↗ {rec.evidenceLabel?.trim() || "Open evidence"}
                            </a>
                          ) : (
                            <span className="text-[11px] text-rose-500">Invalid URL</span>
                          )
                        ) : needsEvidence ? (
                          <span className="text-[11px] text-amber-500">Evidence required to verify</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <select value={status} onChange={(e) => setRecord(r.id, { status: e.target.value as RiskOppStatus })} className="rounded-sm border border-border bg-card px-2 py-1 text-xs">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div className="mt-1 inline-flex items-center gap-1.5 text-xs"><span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />{meta.label}</div>
                      <textarea value={rec.notes ?? ""} onChange={(e) => setRecord(r.id, { notes: e.target.value })} placeholder="Effectiveness verification notes" className="mt-1 block w-48 rounded-sm border border-border bg-card px-2 py-1 text-xs" rows={2} />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">No items match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
