import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ALL_ITEMS, STATUS_META, type Status } from "@/data/iso9001";

type Props = {
  meta: {
    organization: string;
    site: string;
    leadAuditor: string;
    date: string;
  };
  setMeta: (m: Props["meta"]) => void;
  statuses: Record<string, Status>;
  onExport: () => void;
  onReset: () => void;
};

export function AuditHeader({ meta, setMeta, statuses, onExport, onReset }: Props) {
  const counts = useMemo(() => {
    const c: Record<Status, number> = {
      pending: 0, conformant: 0, ofi: 0, minor: 0, major: 0, na: 0,
    };
    for (const item of ALL_ITEMS) {
      const s = statuses[item.clause] ?? "pending";
      c[s]++;
    }
    return c;
  }, [statuses]);

  const total = ALL_ITEMS.length;
  const assessed = total - counts.pending;
  const denom = total - counts.pending - counts.na;
  const conformity = denom > 0 ? Math.round((counts.conformant / denom) * 100) : 0;

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1400px] px-6 pt-8 pb-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                ISO 9001:2015 · Internal Audit
              </span>
              <span className="h-px w-12 bg-foreground/30" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                Workspace
              </span>
            </div>
            <h1 className="mt-3 font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
              Conformia<span className="text-accent">.</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              A clause-by-clause workspace to plan, conduct, and record an ISO 9001:2015
              internal audit — questions, expected evidence, effectiveness, and findings in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/processes"
              className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              Process audits →
            </Link>
            <Link
              to="/gap"
              className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              Port Gap Assessment →
            </Link>
            <Link
              to="/legal"
              className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              Nigeria Legal →
            </Link>
            <Link
              to="/kpi"
              className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              KPI Monitoring →
            </Link>
            <Link
              to="/risk-opportunity"
              className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              Risks & Opportunities →
            </Link>
            <Link
              to="/iso27001"
              className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              ISO 27001 audit →
            </Link>
            <button
              onClick={onExport}
              className="rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-card transition hover:bg-primary/90"
            >
              Export audit report
            </button>
            <button
              onClick={onReset}
              className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-4">
          {[
            { k: "organization", l: "Organization", ph: "Acme Manufacturing Ltd." },
            { k: "site", l: "Site / scope", ph: "Lyon — Plant 1" },
            { k: "leadAuditor", l: "Lead auditor", ph: "M. Laurent" },
            { k: "date", l: "Audit date", ph: "2026-05-02" },
          ].map((f) => (
            <label key={f.k} className="block">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {f.l}
              </span>
              <input
                value={(meta as Record<string, string>)[f.k]}
                onChange={(e) => setMeta({ ...meta, [f.k]: e.target.value })}
                placeholder={f.ph}
                className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
              />
            </label>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Audit progress · {assessed}/{total} clauses
              </span>
              <span className="font-display text-2xl font-medium text-foreground">
                {conformity}
                <span className="text-base text-muted-foreground">% conformity</span>
              </span>
            </div>
            <div className="mt-2 flex h-2 overflow-hidden rounded-sm bg-muted">
              {(["conformant", "ofi", "minor", "major", "na"] as Status[]).map((s) =>
                counts[s] > 0 ? (
                  <div
                    key={s}
                    className={`${STATUS_META[s].bar} h-full`}
                    style={{ width: `${(counts[s] / total) * 100}%` }}
                    title={`${STATUS_META[s].label}: ${counts[s]}`}
                  />
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
  );
}