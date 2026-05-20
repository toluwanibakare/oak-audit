import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LEGAL_ITEMS, LEGAL_STORAGE_KEY, DOMAIN_META, DOMAIN_ORDER, STATUS_META,
  SEVERITY_META, FREQUENCY_LABEL, EMPTY_EVAL,
  type ComplianceStatus, type Severity, type EvaluationEntry, type LegalDomain,
} from "@/data/legalCompliance";

type Store = Record<string, EvaluationEntry>;
type DomainFilter = "all" | LegalDomain;

const STATUS_ORDER: ComplianceStatus[] = ["compliant","partial","non_compliant","not_applicable","pending"];
const SEV_ORDER: Severity[] = ["low","medium","high","critical"];

function csvEscape(v: string) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const LegalCompliance = () => {
  const [meta, setMeta] = useState({
    organization: "", sector: "", site: "", officer: "", period: "",
  });
  const [store, setStore] = useState<Store>({});
  const [filter, setFilter] = useState<DomainFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LEGAL_STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setStore(p.store ?? {});
        setMeta(p.meta ?? meta);
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try { localStorage.setItem(LEGAL_STORAGE_KEY, JSON.stringify({ meta, store })); } catch { /* ignore */ }
  }, [meta, store]);

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return LEGAL_ITEMS.filter((i) =>
      (filter === "all" || i.domain === filter) &&
      (q === "" ||
        i.instrument.toLowerCase().includes(q) ||
        i.regulator.toLowerCase().includes(q) ||
        i.obligation.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q))
    );
  }, [filter, search]);

  const get = (id: string): EvaluationEntry => store[id] ?? EMPTY_EVAL;
  const update = (id: string, patch: Partial<EvaluationEntry>) =>
    setStore((p) => ({ ...p, [id]: { ...EMPTY_EVAL, ...p[id], ...patch } }));

  const stats = useMemo(() => {
    const c: Record<ComplianceStatus, number> = {
      pending: 0, compliant: 0, partial: 0, non_compliant: 0, not_applicable: 0,
    };
    let riskScore = 0, riskMax = 0;
    for (const it of LEGAL_ITEMS) {
      const e = get(it.id);
      c[e.status]++;
      const sev = e.severity ? SEVERITY_META[e.severity].score : 2;
      riskMax += 4;
      if (e.status === "non_compliant") riskScore += sev;
      else if (e.status === "partial") riskScore += sev * 0.5;
    }
    const total = LEGAL_ITEMS.length;
    const denom = total - c.pending - c.not_applicable;
    const conformity = denom > 0 ? Math.round((c.compliant / denom) * 100) : 0;
    const riskIndex = riskMax ? Math.round((riskScore / riskMax) * 100) : 0;
    return { ...c, total, conformity, riskIndex };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  const grouped = useMemo(() => {
    const g: Record<string, typeof items> = {};
    for (const it of items) (g[it.domain] ??= []).push(it);
    return g;
  }, [items]);

  const reset = () => {
    if (confirm("Clear all legal compliance data?")) {
      setStore({});
      setMeta({ organization: "", sector: "", site: "", officer: "", period: "" });
    }
  };

  const exportCsv = () => {
    const header = [
      "ID","Domain","Jurisdiction","Regulator","Instrument","Citation","Obligation",
      "Applicability","Evidence required","Frequency","Penalty",
      "Status","Severity","Risk score","Evidence reference","Owner","Last review","Next due","Action / CAPA","Notes",
    ];
    const rows = [header.map(csvEscape).join(",")];
    for (const it of LEGAL_ITEMS) {
      const e = get(it.id);
      const sev = e.severity ? SEVERITY_META[e.severity] : null;
      const risk = e.status === "non_compliant" ? (sev?.score ?? 2)
                 : e.status === "partial" ? (sev?.score ?? 2) * 0.5 : 0;
      rows.push([
        it.id, DOMAIN_META[it.domain].label, it.jurisdiction, it.regulator,
        it.instrument, it.citation, it.obligation, it.applicability, it.evidence,
        FREQUENCY_LABEL[it.frequency], it.penalty,
        STATUS_META[e.status].label, sev?.label ?? "", String(risk),
        e.evidenceRef, e.owner, e.lastReview, e.nextDue, e.action, e.notes,
      ].map(csvEscape).join(","));
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Nigeria_Legal_Compliance_${meta.organization || "register"}_${meta.period || "draft"}.csv`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-[1400px] px-6 pt-8 pb-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Nigeria · Legal & Regulatory Compliance
                </span>
                <span className="h-px w-12 bg-foreground/30" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  Cross-sector
                </span>
              </div>
              <h1 className="mt-3 font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
                Conformia<span className="text-accent">.</span> Lex
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                Monitor, measure and evaluate compliance against Nigerian statutory and
                regulatory obligations — corporate, tax, labour, HSE, environment, data,
                consumer, sector, anti-corruption and immigration.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/" className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary">← Audit workspace</Link>
              <Link to="/processes" className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary">Process audits</Link>
              <Link to="/gap" className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary">Gap assessment</Link>
              <button onClick={exportCsv} className="rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-card transition hover:bg-primary/90">Export register</button>
              <button onClick={reset} className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary">Reset</button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-5">
            {[
              { k: "organization", l: "Organization", ph: "Acme Manufacturing Nigeria Ltd." },
              { k: "sector",       l: "Sector",       ph: "Food & beverage" },
              { k: "site",         l: "Site / scope", ph: "Lagos plant" },
              { k: "officer",      l: "Compliance officer", ph: "Mrs. Okonkwo" },
              { k: "period",       l: "Reporting period", ph: "2026 Q2" },
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

          <div className="mt-6 grid gap-3 md:grid-cols-7">
            <Card label="Obligations" value={String(stats.total)} />
            <Card label="Compliant" value={String(stats.compliant)} tone="text-success" />
            <Card label="Partial" value={String(stats.partial)} tone="text-[hsl(35_85%_28%)]" />
            <Card label="Non-compliant" value={String(stats.non_compliant)} tone="text-destructive" />
            <Card label="N/A" value={String(stats.not_applicable)} />
            <Card label="Conformity" value={`${stats.conformity}%`} />
            <Card label="Risk index" value={`${stats.riskIndex}%`} tone={stats.riskIndex >= 40 ? "text-destructive" : stats.riskIndex >= 15 ? "text-[hsl(35_85%_28%)]" : "text-success"} />
          </div>

          <div className="mt-4 flex h-2 overflow-hidden rounded-sm bg-muted">
            {STATUS_ORDER.map((s) =>
              stats[s] > 0 ? (
                <div key={s} className={`${STATUS_META[s].bar} h-full`}
                     style={{ width: `${(stats[s] / stats.total) * 100}%` }}
                     title={`${STATUS_META[s].label}: ${stats[s]}`} />
              ) : null,
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Domain</span>
            <button onClick={() => setFilter("all")}
              className={`rounded-sm border px-3 py-1.5 text-xs font-medium transition ${filter === "all" ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:bg-secondary"}`}>
              All ({LEGAL_ITEMS.length})
            </button>
            {DOMAIN_ORDER.map((d) => {
              const n = LEGAL_ITEMS.filter((i) => i.domain === d).length;
              return (
                <button key={d} onClick={() => setFilter(d)}
                  className={`rounded-sm border px-3 py-1.5 text-xs font-medium transition ${filter === d ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:bg-secondary"}`}>
                  {DOMAIN_META[d].label} ({n})
                </button>
              );
            })}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search obligation, regulator, instrument…"
              className="ml-auto w-72 rounded-sm border border-border bg-card px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10 space-y-10">
        {DOMAIN_ORDER.filter((d) => grouped[d]?.length).map((d) => (
          <section key={d}>
            <div className="mb-4 flex items-baseline gap-3">
              <span className={`h-2 w-2 rounded-full ${DOMAIN_META[d].dot}`} />
              <h2 className="font-display text-3xl font-medium tracking-tight">{DOMAIN_META[d].label}</h2>
              <span className="font-mono text-xs text-muted-foreground">{grouped[d].length} obligation{grouped[d].length > 1 ? "s" : ""}</span>
            </div>

            <div className="space-y-3">
              {grouped[d].map((it) => {
                const e = get(it.id);
                return (
                  <article key={it.id} className="overflow-hidden rounded-sm border border-border bg-card shadow-card">
                    <div className="border-b border-border bg-secondary/60 px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{it.id}</span>
                          <span className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${DOMAIN_META[it.domain].tone}`}>
                            {it.jurisdiction}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            {FREQUENCY_LABEL[it.frequency]}
                          </span>
                          <span className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${STATUS_META[e.status].tone}`}>
                            {STATUS_META[e.status].label}
                          </span>
                        </div>
                        <h3 className="mt-1 font-display text-lg font-medium leading-tight text-foreground">{it.instrument}</h3>
                        <p className="text-xs text-muted-foreground">{it.regulator} · {it.citation}</p>
                      </div>
                    </div>

                    <div className="grid gap-px bg-border md:grid-cols-3">
                      <Cell label="Obligation" body={it.obligation} accent />
                      <Cell label="Applicability" body={it.applicability} />
                      <Cell label="Evidence required" body={it.evidence} />
                      <Cell label="Sanction / penalty" body={it.penalty} fullWidth />
                    </div>

                    <div className="grid gap-3 border-t border-border px-5 py-4 md:grid-cols-12">
                      <Select label="Status" value={e.status}
                        onChange={(v) => update(it.id, { status: v as ComplianceStatus })}
                        options={STATUS_ORDER.map((s) => ({ v: s, l: STATUS_META[s].label }))} className="md:col-span-2" />
                      <Select label="Severity" value={e.severity ?? ""}
                        onChange={(v) => update(it.id, { severity: (v || null) as Severity | null })}
                        options={[{ v: "", l: "—" }, ...SEV_ORDER.map((s) => ({ v: s, l: SEVERITY_META[s].label }))]}
                        className="md:col-span-2" />
                      <TextInput label="Owner" value={e.owner} onChange={(v) => update(it.id, { owner: v })}
                        placeholder="e.g. Head, Tax" className="md:col-span-2" />
                      <TextInput label="Last review" type="date" value={e.lastReview}
                        onChange={(v) => update(it.id, { lastReview: v })} className="md:col-span-2" />
                      <TextInput label="Next due" type="date" value={e.nextDue}
                        onChange={(v) => update(it.id, { nextDue: v })} className="md:col-span-2" />
                      <TextInput label="Evidence ref." value={e.evidenceRef}
                        onChange={(v) => update(it.id, { evidenceRef: v })}
                        placeholder="REC-TAX-04" className="md:col-span-2" />

                      <Field label="Notes / observations" value={e.notes}
                        onChange={(v) => update(it.id, { notes: v })}
                        placeholder="Sampled records reviewed, gaps identified, regulator interactions…"
                        className="md:col-span-6" />
                      <Field label="Action / CAPA" value={e.action}
                        onChange={(v) => update(it.id, { action: v })}
                        placeholder="Closure action, owner, target date."
                        disabled={e.status === "compliant" || e.status === "not_applicable" || e.status === "pending"}
                        className="md:col-span-6" />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        {items.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No obligations match the current filter.</p>
        )}
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-[1400px] px-6 py-6 text-xs text-muted-foreground lg:px-10">
          Conformia.Lex — seeded with Nigerian federal & state obligations as at May 2026.
          Validate citations against the current Federal Gazette before formal use.
        </div>
      </footer>
    </div>
  );
};

export default LegalCompliance;

function Card({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-sm border border-border bg-card px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className={`mt-0.5 font-display text-2xl font-medium tabular-nums ${tone ?? "text-foreground"}`}>{value}</div>
    </div>
  );
}

function Cell({ label, body, accent, fullWidth }: { label: string; body: string; accent?: boolean; fullWidth?: boolean }) {
  return (
    <div className={`bg-card px-5 py-4 ${fullWidth ? "md:col-span-3" : ""}`}>
      <div className="flex items-center gap-2">
        {accent && <span className="h-2 w-2 rounded-full bg-accent" />}
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{body}</p>
    </div>
  );
}

function Select({ label, value, onChange, options, className }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { v: string; l: string }[]; className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-2 text-sm text-foreground focus:border-foreground focus:outline-none">
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}

function TextInput({ label, value, onChange, placeholder, type = "text", className }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none" />
    </label>
  );
}

function Field({ label, value, onChange, placeholder, disabled, className }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        rows={3} disabled={disabled}
        className="mt-1 w-full resize-none rounded-sm border border-border bg-background px-2 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-60" />
    </label>
  );
}
