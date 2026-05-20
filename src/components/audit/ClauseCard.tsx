import { useEffect, useRef } from "react";
import { STATUS_META, type ClauseItem, type Status } from "@/data/iso9001";

type Props = {
  item: ClauseItem;
  status: Status;
  notes: string;
  finding: string;
  isActive: boolean;
  onStatus: (s: Status) => void;
  onNotes: (n: string) => void;
  onFinding: (f: string) => void;
};

const ORDER: Status[] = ["conformant", "ofi", "minor", "major", "na"];

export function ClauseCard({
  item, status, notes, finding, isActive, onStatus, onNotes, onFinding,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isActive]);

  return (
    <article
      ref={ref}
      id={`clause-${item.clause}`}
      className="scroll-mt-6 overflow-hidden rounded-sm border border-border bg-card shadow-card"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border bg-secondary/60 px-6 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="clause-tag">Clause {item.clause}</span>
            <span className={`rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${STATUS_META[status].tone}`}>
              {STATUS_META[status].label}
            </span>
          </div>
          <h3 className="mt-2 font-display text-2xl font-medium leading-tight text-foreground">
            {item.title}
          </h3>
        </div>
      </div>

      <div className="grid gap-px bg-border md:grid-cols-2">
        <Section label="Audit question" body={item.question} accent />
        <Section label="Expected evidence" body={item.evidence} />
        <Section label="Effective implementation looks like" body={item.effective} fullWidth />
      </div>

      <div className="border-t border-border px-6 py-5">
        <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Auditor assessment
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {ORDER.map((s) => {
            const active = s === status;
            const meta = STATUS_META[s];
            return (
              <button
                key={s}
                onClick={() => onStatus(s)}
                className={`flex items-center gap-2 rounded-sm border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-foreground hover:bg-secondary"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-background" : meta.dot}`} />
                {meta.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field
            label="Evidence reviewed / observations"
            placeholder="e.g. Reviewed PR-PUR-04 rev. 5; sampled 5 supplier files; interviewed Procurement Manager."
            value={notes}
            onChange={onNotes}
            rows={4}
          />
          <Field
            label="Finding statement (if NC or OFI)"
            placeholder="State the requirement, the deviation, and the objective evidence."
            value={finding}
            onChange={onFinding}
            rows={4}
            disabled={status === "conformant" || status === "na" || status === "pending"}
          />
        </div>
      </div>
    </article>
  );
}

function Section({ label, body, accent, fullWidth }: { label: string; body: string; accent?: boolean; fullWidth?: boolean }) {
  return (
    <div className={`bg-card px-6 py-5 ${fullWidth ? "md:col-span-2" : ""}`}>
      <div className="flex items-center gap-2">
        {accent && <span className="h-2 w-2 rounded-full bg-accent" />}
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{body}</p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, rows = 3, disabled }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="mt-1 w-full resize-none rounded-sm border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-60"
      />
    </label>
  );
}