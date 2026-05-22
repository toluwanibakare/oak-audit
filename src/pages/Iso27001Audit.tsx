import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ISO27001_ALL_ITEMS,
  ISO27001_GROUPS,
  ANNEX_A_THEMES,
  STATUS_META,
  type Status,
} from "@/data/iso27001";
import { ClauseCard } from "@/components/audit/ClauseCard";
import { exportReport27001 } from "@/lib/exportReport27001";

const STORAGE_KEY = "conformia-audit-27001-v1";

type State = {
  meta: {
    organization: string;
    site: string;
    leadAuditor: string;
    date: string;
    auditTeam?: string;
    reportRef?: string;
    objectives?: string;
    scope?: string;
    methodology?: string;
    conclusions?: string;
    strengths?: string;
  };
  statuses: Record<string, Status>;
  notes: Record<string, string>;
  findings: Record<string, string>;
  findingsMeta?: Record<string, {
    owner?: string;
    containment?: string;
    rootCauseDue?: string;
    correctiveActionDue?: string;
    effectivenessVerification?: string;
  }>;
};

const DEFAULT_META = {
  organization: "Helios Cloud Services Ltd.",
  site: "Headquarters + EU-West data centre (Dublin)",
  leadAuditor: "M. Laurent (Lead Auditor, IRCA cert. 2024-LA-3187)",
  date: "2026-05-13",
  auditTeam: "S. Okafor (auditor), A. Bianchi (technical expert – cloud)",
  reportRef: "AUD-ISMS-2026-01",
  objectives: "Determine the extent of conformity of the ISMS with ISO/IEC 27001:2022 requirements; evaluate the ability of the ISMS to ensure the organization meets applicable legal, regulatory and contractual information-security requirements; and identify opportunities for improvement.",
  scope: "All ISMS processes within the certified scope (HQ and EU-West data centre, HelioOps SaaS platform). Annex A controls assessed by sampling, traced through the SoA.",
  methodology: "Document review, interviews with control owners (CISO, SecOps lead, IT Manager, HR Manager, Procurement Lead, DPO), walk-throughs of incident response, change management, access provisioning, vulnerability management and supplier on-boarding, and sample testing of records (n=55 across processes). Classification of findings: Major NC — failure of a system requirement; Minor NC — isolated lapse; OFI — opportunity for improvement.",
  conclusions: "The ISMS of Helios Cloud Services Ltd. is, in the opinion of the audit team, suitable, adequate and broadly effective in achieving its intended outcomes, with the exception of the Major nonconformity raised against clause 8.3 (overdue High-residual risk-treatment actions). Closure of this Major NC, together with the 2 Minor NCs, is required before the next external surveillance audit.",
  strengths: "• Management commitment and resourcing\n• Maturity of the monitoring and measurement programme (clause 9.1)\n• Integration of incident learnings into the improvement register (clause 10.1)"
};

const EMPTY: State = {
  meta: DEFAULT_META,
  statuses: {},
  notes: {},
  findings: {},
  findingsMeta: {},
};

const Iso27001Audit = () => {
  const [state, setState] = useState<State>(EMPTY);
  const [active, setActive] = useState<string>(ISO27001_ALL_ITEMS[0].clause);
  const [showNarratives, setShowNarratives] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({
          ...EMPTY,
          ...parsed,
          meta: { ...DEFAULT_META, ...parsed.meta }
        });
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const counts = useMemo(() => {
    const c: Record<Status, number> = { pending: 0, conformant: 0, ofi: 0, minor: 0, major: 0, na: 0 };
    for (const it of ISO27001_ALL_ITEMS) c[state.statuses[it.clause] ?? "pending"]++;
    return c;
  }, [state.statuses]);

  const total = ISO27001_ALL_ITEMS.length;
  const denom = total - counts.pending - counts.na;
  const conformity = denom > 0 ? Math.round((counts.conformant / denom) * 100) : 0;

  const setStatus = (clause: string, s: Status) =>
    setState((p) => ({ ...p, statuses: { ...p.statuses, [clause]: s } }));
  const setNotes = (clause: string, n: string) =>
    setState((p) => ({ ...p, notes: { ...p.notes, [clause]: n } }));
  const setFinding = (clause: string, f: string) =>
    setState((p) => ({ ...p, findings: { ...p.findings, [clause]: f } }));
  const setFindingMeta = (clause: string, key: string, val: string) => {
    setState((p) => ({
      ...p,
      findingsMeta: {
        ...p.findingsMeta,
        [clause]: {
          ...(p.findingsMeta?.[clause] || {
            owner: "CISO (to assign)",
            containment: "—",
            rootCauseDue: "Within 14 days of report acceptance",
            correctiveActionDue: "Within 60 days (Minor / OFI) · 30 days (Major)",
            effectivenessVerification: "At next surveillance audit or earlier (Major)"
          }),
          [key]: val
        }
      }
    }));
  };

  const onReset = () => {
    if (confirm("Clear all ISO 27001 audit data? This cannot be undone.")) {
      setState(EMPTY); setActive(ISO27001_ALL_ITEMS[0].clause);
    }
  };

  const onExport = () => exportReport27001({
    meta: state.meta,
    statuses: state.statuses,
    notes: state.notes,
    findings: state.findings,
    findingsMeta: state.findingsMeta || {},
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-[1400px] px-6 pt-8 pb-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  ISO/IEC 27001:2022 · Internal Audit
                </span>
                <span className="h-px w-12 bg-foreground/30" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  ISMS workspace
                </span>
              </div>
              <h1 className="mt-3 font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
                Conformia · ISMS<span className="text-accent">.</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                A clause-by-clause workspace to plan, conduct and record an
                ISO/IEC 27001:2022 internal audit — questions, expected evidence,
                effectiveness criteria and findings in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link to="/" className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary">
                ← ISO 9001 audit
              </Link>
              <Link to="/processes" className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary">
                Process audits →
              </Link>
              <button onClick={onExport} className="rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-card transition hover:bg-primary/90">
                Export audit report
              </button>
              <button onClick={onReset} className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary">
                Reset
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {[
              { k: "organization", l: "Organization", ph: "Acme Tech Ltd." },
              { k: "site", l: "Site / scope", ph: "HQ + EU data centre" },
              { k: "leadAuditor", l: "Lead auditor", ph: "M. Laurent" },
              { k: "date", l: "Audit date", ph: "2026-05-13" },
            ].map((f) => (
              <label key={f.k} className="block">
                <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {f.l}
                </span>
                <input
                  value={(state.meta as Record<string, any>)[f.k] || ""}
                  onChange={(e) => setState((p) => ({ ...p, meta: { ...p.meta, [f.k]: e.target.value } }))}
                  placeholder={f.ph}
                  className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
                />
              </label>
            ))}
          </div>

          <div className="mt-4 border-t border-border/40 pt-4">
            <button
              onClick={() => setShowNarratives(!showNarratives)}
              className="flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary shadow-sm"
            >
              <span>{showNarratives ? "Hide" : "Edit"} Audit Parameters & Narrative Templates</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${showNarratives ? "rotate-180" : ""}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            
            {showNarratives && (
              <div className="mt-4 grid gap-4 rounded-sm border border-border bg-card/60 p-4 animate-fade-in-up">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Audit Team</span>
                    <input
                      value={state.meta.auditTeam || ""}
                      onChange={(e) => setState((p) => ({ ...p, meta: { ...p.meta, auditTeam: e.target.value } }))}
                      className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Report Reference</span>
                    <input
                      value={state.meta.reportRef || ""}
                      onChange={(e) => setState((p) => ({ ...p, meta: { ...p.meta, reportRef: e.target.value } }))}
                      className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none"
                    />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Audit Objectives</span>
                    <textarea
                      value={state.meta.objectives || ""}
                      onChange={(e) => setState((p) => ({ ...p, meta: { ...p.meta, objectives: e.target.value } }))}
                      rows={3}
                      className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none resize-none leading-relaxed"
                    />
                  </label>
                  <label className="block">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Audit Scope</span>
                    <textarea
                      value={state.meta.scope || ""}
                      onChange={(e) => setState((p) => ({ ...p, meta: { ...p.meta, scope: e.target.value } }))}
                      rows={3}
                      className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none resize-none leading-relaxed"
                    />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Audit Methodology</span>
                    <textarea
                      value={state.meta.methodology || ""}
                      onChange={(e) => setState((p) => ({ ...p, meta: { ...p.meta, methodology: e.target.value } }))}
                      rows={4}
                      className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none resize-none leading-relaxed"
                    />
                  </label>
                  <label className="block">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Audit Conclusions</span>
                    <textarea
                      value={state.meta.conclusions || ""}
                      onChange={(e) => setState((p) => ({ ...p, meta: { ...p.meta, conclusions: e.target.value } }))}
                      rows={4}
                      className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none resize-none leading-relaxed"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Particular Strengths</span>
                  <textarea
                    value={state.meta.strengths || ""}
                    onChange={(e) => setState((p) => ({ ...p, meta: { ...p.meta, strengths: e.target.value } }))}
                    rows={3}
                    placeholder="e.g. • Strength one&#10;• Strength two"
                    className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none resize-none leading-relaxed"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Audit progress · {total - counts.pending}/{total} clauses
                </span>
                <span className="font-display text-2xl font-medium text-foreground">
                  {conformity}<span className="text-base text-muted-foreground">% conformity</span>
                </span>
              </div>
              <div className="mt-2 flex h-2 overflow-hidden rounded-sm bg-muted">
                {(["conformant", "ofi", "minor", "major", "na"] as Status[]).map((s) =>
                  counts[s] > 0 ? (
                    <div key={s} className={`${STATUS_META[s].bar} h-full`}
                      style={{ width: `${(counts[s] / total) * 100}%` }}
                      title={`${STATUS_META[s].label}: ${counts[s]}`} />
                  ) : null,
                )}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {(["conformant", "ofi", "minor", "major", "na"] as Status[]).map((s) => (
                <div key={s} className="rounded-sm border border-border bg-card px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[s].dot}`} />
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      {STATUS_META[s].label}
                    </span>
                  </div>
                  <div className="mt-0.5 font-display text-xl font-medium tabular-nums">{counts[s]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            <div className="rounded-sm border border-border bg-card shadow-card">
              <div className="border-b border-border bg-secondary px-4 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Index</span>
                <h2 className="font-display text-lg font-medium">ISO 27001:2022 clauses</h2>
              </div>
              <nav className="divide-y divide-border">
                {ISO27001_GROUPS.map((g) => (
                  <div key={g.number} className="px-4 py-3">
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="font-display text-2xl font-medium text-accent">{g.number}</span>
                      <span className="font-display text-sm font-medium text-foreground">{g.title}</span>
                    </div>
                    <ul className="space-y-1">
                      {g.items.map((it) => {
                        const s = state.statuses[it.clause] ?? "pending";
                        const isActive = active === it.clause;
                        return (
                          <li key={it.clause}>
                            <button
                              onClick={() => setActive(it.clause)}
                              className={`group flex w-full items-center justify-between gap-2 rounded-sm border px-2 py-1.5 text-left text-xs transition ${
                                isActive
                                  ? "border-foreground/80 bg-foreground/[0.04]"
                                  : "border-transparent hover:border-border hover:bg-secondary"
                              }`}
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_META[s].dot}`} />
                                <span className="font-mono text-[11px] tabular-nums text-foreground/80">{it.clause}</span>
                                <span className="truncate text-foreground/90">{it.title}</span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}

                <div className="px-4 py-3">
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="font-display text-2xl font-medium text-accent">A</span>
                    <span className="font-display text-sm font-medium text-foreground">Annex A · 93 controls</span>
                  </div>
                  <ul className="space-y-1">
                    {ANNEX_A_THEMES.map((t) => (
                      <li key={t.code} className="rounded-sm border border-transparent px-2 py-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-foreground/80">{t.code}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{t.count} ctrls</span>
                        </div>
                        <div className="text-foreground/90">{t.name}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>
            </div>
          </aside>

          <div className="space-y-12">
            {ISO27001_GROUPS.map((g) => (
              <section key={g.number}>
                <div className="mb-5 flex items-end gap-4">
                  <span className="font-display text-7xl font-medium leading-none text-accent">{g.number}</span>
                  <div className="flex-1 pb-2">
                    <h2 className="font-display text-3xl font-medium tracking-tight">{g.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{g.intent}</p>
                  </div>
                </div>
                <div className="editorial-rule mb-6" />
                <div className="space-y-6">
                  {g.items.map((it) => (
                    <ClauseCard
                      key={it.clause}
                      item={it}
                      status={state.statuses[it.clause] ?? "pending"}
                      notes={state.notes[it.clause] ?? ""}
                      finding={state.findings[it.clause] ?? ""}
                      isActive={active === it.clause}
                      onStatus={(s) => setStatus(it.clause, s)}
                      onNotes={(n) => setNotes(it.clause, n)}
                      onFinding={(f) => setFinding(it.clause, f)}
                      findingMeta={state.findingsMeta?.[it.clause] || {
                        owner: "CISO (to assign)",
                        containment: "—",
                        rootCauseDue: "Within 14 days of report acceptance",
                        correctiveActionDue: "Within 60 days (Minor / OFI) · 30 days (Major)",
                        effectivenessVerification: "At next surveillance audit or earlier (Major)"
                      }}
                      onFindingMetaChange={(key, val) => setFindingMeta(it.clause, key, val)}
                    />
                  ))}
                </div>
              </section>
            ))}

            <section className="rounded-sm border border-border bg-card p-6 shadow-card">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Ready to publish
              </span>
              <h2 className="mt-1 font-display text-2xl font-medium">Generate the ISMS audit report</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Exports an editorial, print-ready ISO/IEC 27001:2022 audit report in a new tab — executive
                summary, Annex A theme reference, clause coverage and detailed findings.
              </p>
              <button
                onClick={onExport}
                className="mt-4 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Export audit report
              </button>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-secondary/40">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground lg:px-10">
          <span className="font-mono uppercase tracking-[0.18em]">Conformia · ISO/IEC 27001:2022 audit workspace</span>
          <span>Data is saved locally in your browser only.</span>
        </div>
      </footer>
    </div>
  );
};

export default Iso27001Audit;