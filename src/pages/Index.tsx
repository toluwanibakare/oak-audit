import { useEffect, useMemo, useState } from "react";
import { ALL_ITEMS, ISO_GROUPS, type Status } from "@/data/iso9001";
import { AuditHeader } from "@/components/audit/AuditHeader";
import { ClauseSidebar } from "@/components/audit/ClauseSidebar";
import { ClauseCard } from "@/components/audit/ClauseCard";
import { exportReport } from "@/lib/exportReport";

const STORAGE_KEY = "conformia-audit-v1";

type State = {
  meta: { organization: string; site: string; leadAuditor: string; date: string };
  statuses: Record<string, Status>;
  notes: Record<string, string>;
  findings: Record<string, string>;
};

const EMPTY: State = {
  meta: { organization: "", site: "", leadAuditor: "", date: "" },
  statuses: {},
  notes: {},
  findings: {},
};

const Index = () => {
  const [state, setState] = useState<State>(EMPTY);
  const [active, setActive] = useState<string>(ALL_ITEMS[0].clause);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
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
