import { useEffect, useMemo, useState } from "react";
import { ALL_ITEMS, ISO_GROUPS, type Status } from "@/data/iso9001";
import { AuditHeader } from "@/components/audit/AuditHeader";
import { ClauseSidebar } from "@/components/audit/ClauseSidebar";
import { ClauseCard } from "@/components/audit/ClauseCard";
import { exportReport } from "@/lib/exportReport";

const STORAGE_KEY = "conformia-audit-v1";

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
  leadAuditor: "M. Laurent (Lead Auditor, IRCA cert. 2024-LA-9001)",
  date: "2026-05-13",
  auditTeam: "S. Okafor (auditor), A. Bianchi (technical expert)",
  reportRef: "AUD-QMS-2026-01",
  objectives: "Determine the extent of conformity of the QMS with ISO 9001:2015 requirements; evaluate the ability of the QMS to ensure the organization consistently provides products and services that meet customer and applicable statutory and regulatory requirements; and identify opportunities for improvement.",
  scope: "Provision of cloud engineering, SaaS products operations, and Customer Support across Headquarters and EU data centres.",
  methodology: "Document review, interviews with process owners (CEO, QMS Lead, Support Manager, Engineering Director, HR Manager), walk-throughs of software release process, customer onboarding, change management, training records, and sample testing of records (n=48 across processes). Classification of findings: Major NC — failure of a system requirement; Minor NC — isolated lapse; OFI — opportunity for improvement.",
  conclusions: "The QMS of Helios Cloud Services Ltd. is, in the opinion of the audit team, suitable, adequate and broadly effective in achieving its intended outcomes, with the exception of any Major nonconformities raised. Closure of NCs is required before the next external surveillance audit.",
  strengths: "• Strong leadership commitment to QMS maintenance\n• Highly refined automated deployment pipeline ensuring product quality\n• Customer support team demonstrates excellent response SLAs"
};

const EMPTY: State = {
  meta: DEFAULT_META,
  statuses: {},
  notes: {},
  findings: {},
  findingsMeta: {},
};

const Index = () => {
  const [state, setState] = useState<State>(EMPTY);
  const [active, setActive] = useState<string>(ALL_ITEMS[0].clause);
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
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

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
            owner: "QMS Manager (to assign)",
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
    if (confirm("Clear all audit data? This cannot be undone.")) {
      setState(EMPTY);
      setActive(ALL_ITEMS[0].clause);
    }
  };

  const onExport = () =>
    exportReport({
      meta: state.meta,
      statuses: state.statuses,
      notes: state.notes,
      findings: state.findings,
      findingsMeta: state.findingsMeta || {},
    });

  const groupsForRender = useMemo(() => ISO_GROUPS, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AuditHeader
        meta={state.meta}
        setMeta={(m) => setState((p) => ({ ...p, meta: m }))}
        statuses={state.statuses}
        onExport={onExport}
        onReset={onReset}
      />

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 mt-4">
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

      <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <ClauseSidebar
            statuses={state.statuses}
            active={active}
            onSelect={(c) => setActive(c)}
          />

          <div className="space-y-12">
            {groupsForRender.map((g) => (
              <section key={g.number}>
                <div className="mb-5 flex items-end gap-4">
                  <span className="font-display text-7xl font-medium leading-none text-accent">
                    {g.number}
                  </span>
                  <div className="flex-1 pb-2">
                    <h2 className="font-display text-3xl font-medium tracking-tight">
                      {g.title}
                    </h2>
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
                        owner: "QMS Manager (to assign)",
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
              <h2 className="mt-1 font-display text-2xl font-medium">Generate the audit report</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Exports an editorial, print-ready audit report in a new tab — including
                executive summary, clause coverage, and detailed findings. Use your browser&rsquo;s print dialog to save as PDF.
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
          <span className="font-mono uppercase tracking-[0.18em]">Conformia · ISO 9001 audit workspace</span>
          <span>Data is saved locally in your browser only.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
