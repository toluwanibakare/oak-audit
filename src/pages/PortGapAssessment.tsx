import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  GAP_ITEMS,
  GAP_STORAGE_KEY,
  STANDARD_META,
  AREA_META,
  MATURITY_LEVELS,
  EMPTY_ENTRY,
  classifyGap,
  type GapEntry,
  type GapStandard,
  type MaturityValue,
} from "@/data/portGapAssessment";

type StdFilter = "all" | GapStandard;

type Store = Record<string, GapEntry>;

const GAP_TONE: Record<ReturnType<typeof classifyGap>, string> = {
  none:  "bg-muted text-muted-foreground border-border",
  major: "bg-destructive/10 text-destructive border-destructive/30",
  minor: "bg-warning/15 text-[hsl(35_85%_28%)] border-warning/40",
  ok:    "bg-success/10 text-success border-success/30",
  best:  "bg-info/10 text-info border-info/30",
};

const GAP_LABEL: Record<ReturnType<typeof classifyGap>, string> = {
  none: "Not assessed", major: "Major gap", minor: "Minor gap", ok: "Conformant", best: "Best practice",
};

const PortGapAssessment = () => {
  const [std, setStd] = useState<StdFilter>("all");
  const [meta, setMeta] = useState({
    organization: "", port: "", terminal: "", assessor: "", date: "",
  });
  const [store, setStore] = useState<Store>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(GAP_STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setStore(p.store ?? {});
        setMeta(p.meta ?? meta);
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(GAP_STORAGE_KEY, JSON.stringify({ meta, store }));
    } catch { /* ignore */ }
  }, [meta, store]);

  const items = useMemo(
    () => (std === "all" ? GAP_ITEMS : GAP_ITEMS.filter((i) => i.standard === std)),
    [std],
  );

  const get = (id: string): GapEntry => store[id] ?? EMPTY_ENTRY;
  const update = (id: string, patch: Partial<GapEntry>) =>
    setStore((p) => ({ ...p, [id]: { ...EMPTY_ENTRY, ...p[id], ...patch } }));

  // ------- Stats -------
  const stats = useMemo(() => {
    const counts = { none: 0, major: 0, minor: 0, ok: 0, best: 0 };
    let scored = 0, sumCurrent = 0, sumTarget = 0;
    for (const it of items) {
      const e = get(it.id);
      const c = classifyGap(e.current);
      counts[c]++;
      if (e.current !== null) { scored++; sumCurrent += e.current; }
      sumTarget += e.target ?? 3;
    }
    const total = items.length;
    const avgCurrent = scored ? sumCurrent / scored : 0;
    const avgTarget = total ? sumTarget / total : 0;
    const conformity = total - counts.none > 0
      ? Math.round(((counts.ok + counts.best) / (total - counts.none)) * 100)
      : 0;
    return { ...counts, total, scored, avgCurrent, avgTarget, conformity };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, store]);

  // ------- Per-area breakdown for radar-ish bars -------
  const areaStats = useMemo(() => {
    const map: Record<string, { count: number; sum: number; scored: number }> = {};
    for (const it of items) {
      const k = it.area;
      const e = get(it.id);
      map[k] ??= { count: 0, sum: 0, scored: 0 };
      map[k].count++;
      if (e.current !== null) { map[k].sum += e.current; map[k].scored++; }
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, store]);

  const reset = () => {
    if (confirm("Clear all gap assessment data?")) {
      setStore({});
      setMeta({ organization: "", port: "", terminal: "", assessor: "", date: "" });
    }
  };

  const exportCsv = () => {
    const rows: string[] = [];
    rows.push([
      "Standard","Clause","Area","Requirement","Port context","Expected evidence",
      "Current","Target","Gap level","Owner","Due","Action","Evidence reviewed",
    ].map(csvEscape).join(","));
    for (const it of items) {
      const e = get(it.id);
      const c = classifyGap(e.current);
      rows.push([
        STANDARD_META[it.standard].code,
        it.clause,
        AREA_META[it.area].number + " " + AREA_META[it.area].title,
        it.requirement,
        it.portContext,
        it.expectedEvidence,
        e.current === null ? "" : String(e.current),
        e.target === null ? "" : String(e.target),
        GAP_LABEL[c],
        e.owner, e.due, e.action, e.evidence,
      ].map(csvEscape).join(","));
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const tag = std === "all" ? "IMS" : STANDARD_META[std].code.replace(/[^0-9]/g, "");
    a.download = `Port_Gap_Assessment_${tag}_${meta.date || "draft"}.csv`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  };

  // group by area for display
  const grouped = useMemo(() => {
    const g: Record<string, typeof items> = {};
    for (const it of items) (g[it.area] ??= []).push(it);
    return g;
  }, [items]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-[1400px] px-6 pt-8 pb-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  IMS Gap Assessment
                </span>
                <span className="h-px w-12 bg-foreground/30" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  Port · Cargo · Logistics
                </span>
              </div>
              <h1 className="mt-3 font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
                Conformia<span className="text-accent">.</span> Gap
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                ISO 9001 · 14001 · 45001 gap assessment tailored for Port Operations,
                Cargo Handling and Logistics Support Services. Score current maturity (0–4),
                set target, capture closure actions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link to="/" className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary">← Audit workspace</Link>
              <Link to="/processes" className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary">Process audits</Link>
              <button onClick={exportCsv} className="rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-card transition hover:bg-primary/90">Export CSV</button>
              <button onClick={reset} className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary">Reset</button>
            </div>
          </div>

          {/* Org meta */}
          <div className="mt-8 grid gap-3 md:grid-cols-5">
            {[
              { k: "organization", l: "Organization", ph: "Acme Port Services Ltd." },
              { k: "port",         l: "Port",         ph: "Port of Lagos" },
              { k: "terminal",     l: "Terminal / scope", ph: "Container Terminal A" },
              { k: "assessor",     l: "Lead assessor", ph: "M. Adeyemi" },
              { k: "date",         l: "Assessment date", ph: "2026-05-04" },
            ].map((f) => (
              <label key={f.k} className="block">
                <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{f.l}</span>
                <input
                  value={(meta as Record<string,string>)[f.k]}
                  onChange={(e) => setMeta({ ...meta, [f.k]: e.target.value })}
                  placeholder={f.ph}
                  className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
                />
              </label>
            ))}
          </div>

          {/* Standard switcher */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Standard</span>
            {(["all","9001","14001","45001"] as StdFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStd(s)}
                className={`rounded-sm border px-3 py-1.5 text-xs font-medium transition ${
                  std === s
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-foreground hover:bg-secondary"
                }`}
              >
                {s === "all" ? "Integrated (IMS)" : STANDARD_META[s].code}
              </button>
            ))}
          </div>

          {/* Summary cards */}
          <div className="mt-6 grid gap-3 md:grid-cols-6">
            <Card label="Items" value={String(stats.total)} />
            <Card label="Assessed" value={`${stats.scored}/${stats.total}`} />
            <Card label="Conformity" value={`${stats.conformity}%`} />
            <Card label="Avg current" value={stats.avgCurrent.toFixed(2)} />
            <Card label="Avg target" value={stats.avgTarget.toFixed(2)} />
            <Card label="Gap (avg)" value={(stats.avgTarget - stats.avgCurrent).toFixed(2)} />
          </div>

          {/* Bar */}
          <div className="mt-4 flex h-2 overflow-hidden rounded-sm bg-muted">
            {(["best","ok","minor","major"] as const).map((k) =>
              stats[k] > 0 ? (
                <div
                  key={k}
                  className={
                    k === "best"  ? "bg-info h-full" :
                    k === "ok"    ? "bg-success h-full" :
                    k === "minor" ? "bg-warning h-full" :
                                    "bg-destructive h-full"
                  }
                  style={{ width: `${(stats[k] / Math.max(stats.total, 1)) * 100}%` }}
                  title={`${GAP_LABEL[k]}: ${stats[k]}`}
                />
              ) : null,
            )}
          </div>

          {/* Area breakdown */}
          <div className="mt-6 grid gap-2 md:grid-cols-7">
            {Object.entries(AREA_META).map(([k, m]) => {
              const a = areaStats[k];
              const avg = a && a.scored ? a.sum / a.scored : 0;
              const pct = (avg / 4) * 100;
              return (
                <div key={k} className="rounded-sm border border-border bg-card px-3 py-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-xl font-medium text-accent">{m.number}</span>
                    <span className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{m.title}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-sm bg-muted overflow-hidden">
                    <div className="h-full bg-foreground/70" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1 font-mono text-[10px] tabular-nums text-muted-foreground">
                    {avg.toFixed(2)} / 4 · {a?.count ?? 0} items
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">
        {Object.entries(grouped).map(([area, list]) => (
          <section key={area} className="mb-10">
            <div className="mb-3 flex items-baseline gap-3">
              <span className="font-display text-3xl font-medium text-accent">
                {AREA_META[area as keyof typeof AREA_META].number}
              </span>
              <h2 className="font-display text-xl font-medium">
                {AREA_META[area as keyof typeof AREA_META].title}
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {list.length} requirement{list.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="space-y-3">
              {list.map((it) => {
                const e = get(it.id);
                const c = classifyGap(e.current);
                return (
                  <article key={it.id} className="rounded-sm border border-border bg-card shadow-card">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-secondary/60 px-4 py-3">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="rounded-sm border border-border bg-background px-2 py-0.5 font-mono text-[10px] tabular-nums">
                          {STANDARD_META[it.standard].code}
                        </span>
                        <span className="font-mono text-sm tabular-nums text-foreground/80">{it.clause}</span>
                        <span className="font-display text-base font-medium">{it.requirement}</span>
                      </div>
                      <span className={`rounded-sm border px-2 py-0.5 text-[11px] font-medium ${GAP_TONE[c]}`}>
                        {GAP_LABEL[c]}
                      </span>
                    </div>

                    <div className="grid gap-4 p-4 md:grid-cols-2">
                      <div>
                        <Label>Port / cargo / logistics context</Label>
                        <p className="mt-1 text-sm leading-relaxed text-foreground/90">{it.portContext}</p>
                      </div>
                      <div>
                        <Label>Expected evidence</Label>
                        <p className="mt-1 text-sm leading-relaxed text-foreground/90">{it.expectedEvidence}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 border-t border-border bg-background/60 p-4 md:grid-cols-[1fr_1fr_1fr_1fr]">
                      <Selector
                        label="Current maturity"
                        value={e.current}
                        onChange={(v) => update(it.id, { current: v })}
                      />
                      <Selector
                        label="Target maturity"
                        value={e.target}
                        onChange={(v) => update(it.id, { target: v })}
                      />
                      <FieldInput
                        label="Action owner"
                        value={e.owner}
                        onChange={(v) => update(it.id, { owner: v })}
                        placeholder="e.g. HSE Manager"
                      />
                      <FieldInput
                        label="Due date"
                        value={e.due}
                        onChange={(v) => update(it.id, { due: v })}
                        placeholder="YYYY-MM-DD"
                        type="date"
                      />
                    </div>

                    <div className="grid gap-3 border-t border-border p-4 md:grid-cols-2">
                      <FieldArea
                        label="Closure / corrective action"
                        value={e.action}
                        onChange={(v) => update(it.id, { action: v })}
                        placeholder="What will be done to close the gap to the target maturity..."
                      />
                      <FieldArea
                        label="Evidence reviewed / notes"
                        value={e.evidence}
                        onChange={(v) => update(it.id, { evidence: v })}
                        placeholder="Documents, records, observations seen during the assessment..."
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Maturity scale: 0 None · 1 Initial · 2 Developing · 3 Implemented · 4 Optimized.
          Gap classification: 0–1 Major · 2 Minor · 3 Conformant · 4 Best practice.
        </p>
      </main>
    </div>
  );
};

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-card px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-display text-2xl font-medium tabular-nums">{value}</div>
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{children}</span>;
}
function Selector({ label, value, onChange }: {
  label: string; value: MaturityValue | null; onChange: (v: MaturityValue | null) => void;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select
        value={value === null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value === "" ? null : (Number(e.target.value) as MaturityValue))}
        className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm focus:border-foreground focus:outline-none"
      >
        <option value="">— Not assessed —</option>
        {MATURITY_LEVELS.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
    </label>
  );
}
function FieldInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm focus:border-foreground focus:outline-none"
      />
    </label>
  );
}
function FieldArea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="mt-1 w-full resize-y rounded-sm border border-border bg-card px-3 py-2 text-sm focus:border-foreground focus:outline-none"
      />
    </label>
  );
}

function csvEscape(v: string): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default PortGapAssessment;
