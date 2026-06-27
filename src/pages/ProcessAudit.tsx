import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  STANDARDS,
  getStandard,
  getProcessesFor,
  getQuestionsFor,
  type StandardKey,
  type AnyProcessKey,
} from "@/data/standards";

type FieldKey = "note" | "status" | "severity" | "auditor" | "auditee";
type Entries = Record<string, string>; // key: `${process}:${clause}:${gOrS}:${qIndex}:${field}`

const STATUS_OPTIONS = ["Pending", "Conformant", "Minor NC", "Major NC", "OFI", "N/A"];
const SEVERITY_OPTIONS = [
  "0 - None",
  "1 - Low",
  "2 - Medium",
  "3 - High",
  "4 - Critical",
];

const ProcessAudit = () => {
  const [params, setParams] = useSearchParams();
  const stdParam = (params.get("std") as StandardKey) || "9001";
  const standard = getStandard(stdParam);
  const processes = useMemo(() => getProcessesFor(standard.key), [standard.key]);
  const STORAGE_KEY = standard.storageKey;

  const [active, setActive] = useState<AnyProcessKey>("top_management");
  const [entries, setEntries] = useState<Entries>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Entries;
    } catch {
      return {};
    }
  });

  const setEntry = (k: string, v: string) => {
    setEntries((p) => {
      const next = { ...p, [k]: v };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const questions = useMemo(
    () => getQuestionsFor(standard.key, active),
    [standard.key, active],
  );
  const meta = processes.find((p) => p.key === active) ?? processes[0];

  const switchStandard = (k: StandardKey) => {
    const next = new URLSearchParams(params);
    next.set("std", k);
    setParams(next, { replace: true });
    try {
      const raw = localStorage.getItem(getStandard(k).storageKey) ?? "{}";
      setEntries(JSON.parse(raw));
    } catch {
      setEntries({});
    }
  };

  const totalQuestions = questions.reduce(
    (s, q) => s + q.generic.length + q.specific.length,
    0,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-[1400px] px-6 pt-8 pb-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {standard.code} · Process Audit
                </span>
                <span className="h-px w-12 bg-foreground/30" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  {standard.tagline}
                </span>
              </div>
              <h1 className="mt-3 font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
                Process audits<span className="text-accent">.</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                Generic and process-specific audit questions per {standard.code} clause —
                tailored for 18 organizational processes.
              </p>
              <div className="mt-4 inline-flex rounded-sm border border-border bg-card p-0.5">
                {STANDARDS.map((s) => {
                  const isActive = s.key === standard.key;
                  return (
                    <button
                      key={s.key}
                      onClick={() => switchStandard(s.key)}
                      className={`rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition ${
                        isActive
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    > 
                    {s.code.replace("ISO ", "")}
                    </button>
                  );
                })}
              </div>
            </div>
            <Link
              to="/"
              className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              ← Clause workspace
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            <div className="rounded-sm border border-border bg-card shadow-card">
              <div className="border-b border-border bg-secondary px-4 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Processes
                </span>
                <h2 className="font-display text-lg font-medium">Select a process</h2>
              </div>
              <nav className="divide-y divide-border">
                {processes.map((p) => {
                  const isActive = active === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setActive(p.key as AnyProcessKey)}
                      className={`flex w-full items-start justify-between gap-2 px-4 py-3 text-left transition ${
                        isActive ? "bg-foreground/[0.04]" : "hover:bg-secondary"
                      }`}
                    >
                      <span>
                        <span className="block font-display text-sm font-medium text-foreground">
                          {p.name}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                          {p.scope}
                        </span>
                      </span>
                      {isActive && (
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="space-y-8">
            <section className="rounded-sm border border-border bg-card p-6 shadow-card">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Process under audit
              </span>
              <h2 className="mt-1 font-display text-3xl font-medium">{meta.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{meta.scope}</p>
              <div className="mt-4 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span>{questions.length} clauses</span>
                <span className="text-foreground/30">·</span>
                <span>{totalQuestions} questions</span>
              </div>
            </section>

            {questions.map((q) => (
              <section
                key={q.clause}
                className="overflow-hidden rounded-sm border border-border bg-card shadow-card"
              >
                <div className="flex items-baseline gap-3 border-b border-border bg-secondary/60 px-6 py-4">
                  <span className="font-display text-3xl font-medium text-accent">
                    {q.clause}
                  </span>
                  <h3 className="font-display text-lg font-medium">{q.title}</h3>
                </div>

                <div className="grid gap-px bg-border md:grid-cols-2">
                  <QuestionBlock
                    label="Generic clause questions"
                    accent
                    items={q.generic}
                    storageKey={`${active}:${q.clause}:g`}
                    entries={entries}
                    onEntry={setEntry}
                  />
                  <QuestionBlock
                    label={`Specific to ${meta.name}`}
                    items={q.specific}
                    storageKey={`${active}:${q.clause}:s`}
                    entries={entries}
                    onEntry={setEntry}
                  />
                  <div className="bg-card px-6 py-5 md:col-span-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Expected evidence
                    </span>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {q.evidence.map((e, i) => (
                        <li
                          key={i}
                          className="rounded-sm border border-border bg-background px-2.5 py-1 text-xs text-foreground/90"
                        >
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-secondary/40">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground lg:px-10">
          <span className="font-mono uppercase tracking-[0.18em]">
            Conformia · process audit question bank
          </span>
          <span>Notes saved locally in your browser only.</span>
        </div>
      </footer>
    </div>
  );
};

function QuestionBlock({
  label,
  items,
  accent,
  storageKey,
  entries,
  onEntry,
}: {
  label: string;
  items: string[];
  accent?: boolean;
  storageKey: string;
  entries: Record<string, string>;
  onEntry: (k: string, v: string) => void;
}) {
  return (
    <div className="bg-card px-6 py-5">
      <div className="flex items-center gap-2">
        {accent && <span className="h-2 w-2 rounded-full bg-accent" />}
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
      </div>
      <ol className="mt-3 space-y-5 text-[14px] leading-relaxed">
        {items.map((q, i) => {
          const base = `${storageKey}:${i}`;
          const get = (f: FieldKey) => entries[`${base}:${f}`] ?? "";
          const set = (f: FieldKey, v: string) => onEntry(`${base}:${f}`, v);
          const status = get("status") || "Pending";
          return (
            <li key={i} className="space-y-2 border-l-2 border-border pl-3">
              <div className="flex gap-2">
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-foreground/90">{q}</p>
              </div>
              <textarea
                value={get("note")}
                onChange={(e) => set("note", e.target.value)}
                placeholder="Evidence reviewed / observations…"
                rows={2}
                className="ml-6 w-[calc(100%-1.5rem)] resize-none rounded-sm border border-border bg-background px-2 py-1.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
              />
              <div className="ml-6 grid w-[calc(100%-1.5rem)] grid-cols-2 gap-2 md:grid-cols-4">
                <FieldSelect
                  label="Status"
                  value={status}
                  options={STATUS_OPTIONS}
                  onChange={(v) => set("status", v)}
                />
                <FieldSelect
                  label="Severity"
                  value={get("severity") || "0 - None"}
                  options={SEVERITY_OPTIONS}
                  onChange={(v) => set("severity", v)}
                />
                <FieldInput
                  label="Auditor"
                  value={get("auditor")}
                  onChange={(v) => set("auditor", v)}
                  placeholder="e.g. O. Adebayo"
                />
                <FieldInput
                  label="Auditee"
                  value={get("auditee")}
                  onChange={(v) => set("auditee", v)}
                  placeholder="e.g. Procurement Mgr"
                />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function FieldSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full rounded-sm border border-border bg-background px-2 py-1 text-[12px] text-foreground focus:border-foreground focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-0.5 w-full rounded-sm border border-border bg-background px-2 py-1 text-[12px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
      />
    </label>
  );
}

export default ProcessAudit;
