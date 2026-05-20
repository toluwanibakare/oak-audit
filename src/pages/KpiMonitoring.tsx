import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  KPI_LIBRARY,
  KPI_STORAGE_KEY,
  PROCESS_FAMILIES,
  STATUS_META,
  currentPeriod,
  evaluateStatus,
  evaluationMethod,
  lastNPeriods,
  type KpiState,
  type KpiReading,
  type ProcessFamily,
  type Standard,
} from "@/data/imsKpis";

const SCOPES = ["All", "Generic", "Port"] as const;
const STANDARDS: (Standard | "All")[] = ["All", "ISO 9001", "ISO 14001", "ISO 45001", "IMS"];

function loadState(): KpiState {
  try {
    const raw = localStorage.getItem(KPI_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as KpiState;
  } catch {
    /* noop */
  }
  return { owners: {}, readings: [] };
}

export default function KpiMonitoring() {
  const [state, setState] = useState<KpiState>(loadState);
  const [period, setPeriod] = useState<string>(currentPeriod());
  const [scope, setScope] = useState<(typeof SCOPES)[number]>("All");
  const [standard, setStandard] = useState<Standard | "All">("All");
  const [processes, setProcesses] = useState<ProcessFamily[]>([]);
  const [processQuery, setProcessQuery] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(KPI_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const periods = useMemo(() => lastNPeriods(12), []);

  const filtered = useMemo(
    () =>
      KPI_LIBRARY.filter((k) => scope === "All" || k.scope === scope)
        .filter((k) => standard === "All" || k.standards.includes(standard))
        .filter((k) => processes.length === 0 || processes.includes(k.process))
        .filter(
          (k) =>
            !search ||
            k.name.toLowerCase().includes(search.toLowerCase()) ||
            k.id.toLowerCase().includes(search.toLowerCase()),
        ),
    [scope, standard, processes, search],
  );

  const readingMap = useMemo(() => {
    const m = new Map<string, KpiReading>();
    for (const r of state.readings) m.set(`${r.kpiId}|${r.period}`, r);
    return m;
  }, [state.readings]);

  function setReading(kpiId: string, value: string, note?: string) {
    const actual = value === "" ? "" : Number(value);
    setState((s) => {
      const others = s.readings.filter((r) => !(r.kpiId === kpiId && r.period === period));
      return { ...s, readings: [...others, { kpiId, period, actual, note }] };
    });
  }

  function setOwner(kpiId: string, owner: string) {
    setState((s) => ({ ...s, owners: { ...s.owners, [kpiId]: owner } }));
  }

  const stats = useMemo(() => {
    let on = 0,
      watch = 0,
      off = 0,
      none = 0;
    for (const k of filtered) {
      const r = readingMap.get(`${k.id}|${period}`);
      if (!r || r.actual === "" || Number.isNaN(r.actual as number)) {
        none++;
        continue;
      }
      const s = evaluateStatus(r.actual as number, k.target, k.direction);
      if (s === "on") on++;
      else if (s === "watch") watch++;
      else off++;
    }
    const measured = on + watch + off;
    const pct = measured > 0 ? Math.round((on / measured) * 100) : 0;
    return { on, watch, off, none, total: filtered.length, measured, pct };
  }, [filtered, readingMap, period]);

  function exportCsv() {
    const head = ["ID", "Process", "Scope", "KPI", "Formula", "Unit", "Target", "Direction", "Evaluation rule", "On target", "Watch", "Off target", "Standards", "Owner", "Period", "Actual", "Status", "Note"];
    const rows = filtered.map((k) => {
      const r = readingMap.get(`${k.id}|${period}`);
      const status =
        r && r.actual !== "" && !Number.isNaN(r.actual as number)
          ? evaluateStatus(r.actual as number, k.target, k.direction)
          : "none";
      const m = evaluationMethod(k.target, k.direction, k.unit);
      return [
        k.id,
        k.process,
        k.scope,
        k.name,
        k.formula,
        k.unit,
        k.target,
        k.direction,
        m.rule,
        m.on,
        m.watch,
        m.off,
        k.standards.join("|"),
        state.owners[k.id] ?? "",
        period,
        r?.actual ?? "",
        status,
        r?.note ?? "",
      ];
    });
    const csv = [head, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kpi-monitoring-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleProcess(p: ProcessFamily) {
    setProcesses((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
  }

  function trendFor(kpiId: string): number[] {
    return periods.map((p) => {
      const r = readingMap.get(`${kpiId}|${p}`);
      return r && r.actual !== "" && !Number.isNaN(r.actual as number) ? (r.actual as number) : NaN;
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 pt-8 pb-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  IMS Objectives · KPI Monitoring
                </span>
                <span className="h-px w-12 bg-foreground/30" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Workspace</span>
              </div>
              <h1 className="mt-3 font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
                Conformia<span className="text-accent">.KPI</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                Measurable IMS objectives across QHSE, environment, port operations and support processes — with monthly
                readings, target tracking, trend, and status.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/" className="rounded-sm border border-border px-4 py-2.5 text-sm hover:bg-secondary">
                ← Audit
              </Link>
              <Link to="/legal" className="rounded-sm border border-border px-4 py-2.5 text-sm hover:bg-secondary">
                Legal
              </Link>
              <button
                onClick={exportCsv}
                className="rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-4">
            <label className="block">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Period</span>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm"
              >
                {periods.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Scope</span>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as (typeof SCOPES)[number])}
                className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm"
              >
                {SCOPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Standard</span>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value as Standard | "All")}
                className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm"
              >
                {STANDARDS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="KPI name or ID"
                className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="mt-4 rounded-sm border border-border bg-card p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Processes
                </span>
                <span className="text-xs text-muted-foreground">
                  {processes.length === 0 ? "All processes" : `${processes.length} selected`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={processQuery}
                  onChange={(e) => setProcessQuery(e.target.value)}
                  placeholder="Filter processes…"
                  className="rounded-sm border border-border bg-background px-2 py-1 text-xs"
                />
                <button
                  onClick={() => setProcesses([])}
                  className="rounded-sm border border-border px-2 py-1 text-xs hover:bg-secondary"
                >
                  Clear
                </button>
                <button
                  onClick={() => setProcesses([...PROCESS_FAMILIES])}
                  className="rounded-sm border border-border px-2 py-1 text-xs hover:bg-secondary"
                >
                  Select all
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PROCESS_FAMILIES.filter((p) =>
                !processQuery || p.toLowerCase().includes(processQuery.toLowerCase()),
              ).map((p) => {
                const active = processes.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => toggleProcess(p)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition ${
                      active
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background hover:bg-secondary"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {[
              { l: "KPIs", v: stats.total, c: "" },
              { l: "On target", v: stats.on, c: STATUS_META.on.dot },
              { l: "Watch", v: stats.watch, c: STATUS_META.watch.dot },
              { l: "Off target", v: stats.off, c: STATUS_META.off.dot },
              { l: "% On target", v: `${stats.pct}%`, c: "" },
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
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Process / KPI</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Target</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Actual ({period})</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Status</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Evaluation method</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Trend (12m)</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Owner</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((k) => {
                const r = readingMap.get(`${k.id}|${period}`);
                const hasVal = r && r.actual !== "" && !Number.isNaN(r.actual as number);
                const status = hasVal ? evaluateStatus(r!.actual as number, k.target, k.direction) : "none";
                const meta = STATUS_META[status];
                const evalM = evaluationMethod(k.target, k.direction, k.unit);
                const trend = trendFor(k.id);
                const valid = trend.filter((n) => !Number.isNaN(n));
                const min = valid.length ? Math.min(...valid) : 0;
                const max = valid.length ? Math.max(...valid) : 1;
                return (
                  <tr key={k.id} className="border-t border-border align-top">
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{k.id}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{k.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {k.process} · {k.scope} · {k.standards.join(", ")} · {k.frequency}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground/80">ƒ {k.formula}</div>
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      <div>
                        {k.direction === "higher" ? "≥ " : "≤ "}
                        {k.target} {k.unit}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        step="any"
                        value={r?.actual ?? ""}
                        onChange={(e) => setReading(k.id, e.target.value, r?.note)}
                        className="w-28 rounded-sm border border-border bg-card px-2 py-1 text-sm tabular-nums"
                      />
                      <input
                        type="text"
                        placeholder="note"
                        value={r?.note ?? ""}
                        onChange={(e) => setReading(k.id, String(r?.actual ?? ""), e.target.value)}
                        className="mt-1 block w-44 rounded-sm border border-border bg-card px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2 py-0.5 text-xs">
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <div className="font-medium text-foreground/90">{evalM.rule}</div>
                      <div className="mt-1 space-y-0.5 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META.on.dot}`} />
                          <span>{evalM.on}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META.watch.dot}`} />
                          <span>{evalM.watch}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META.off.dot}`} />
                          <span>{evalM.off}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex h-8 items-end gap-0.5">
                        {trend.map((v, i) => {
                          if (Number.isNaN(v)) {
                            return <div key={i} className="w-1.5 bg-muted" style={{ height: "8%" }} />;
                          }
                          const range = max - min || 1;
                          const h = 20 + ((v - min) / range) * 80;
                          const s = evaluateStatus(v, k.target, k.direction);
                          return (
                            <div
                              key={i}
                              title={`${periods[i]}: ${v}`}
                              className={`w-1.5 ${STATUS_META[s].bar}`}
                              style={{ height: `${h}%` }}
                            />
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        value={state.owners[k.id] ?? ""}
                        onChange={(e) => setOwner(k.id, e.target.value)}
                        placeholder="Owner"
                        className="w-32 rounded-sm border border-border bg-card px-2 py-1 text-sm"
                      />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No KPIs match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
