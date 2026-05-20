import { ISO_GROUPS, STATUS_META, type Status } from "@/data/iso9001";

type Props = {
  statuses: Record<string, Status>;
  active: string;
  onSelect: (clause: string) => void;
};

export function ClauseSidebar({ statuses, active, onSelect }: Props) {
  return (
    <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
      <div className="rounded-sm border border-border bg-card shadow-card">
        <div className="border-b border-border bg-secondary px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Index
          </span>
          <h2 className="font-display text-lg font-medium">ISO 9001:2015 clauses</h2>
        </div>
        <nav className="divide-y divide-border">
          {ISO_GROUPS.map((g) => (
            <div key={g.number} className="px-4 py-3">
              <div className="mb-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-medium text-accent">{g.number}</span>
                <span className="font-display text-sm font-medium text-foreground">{g.title}</span>
              </div>
              <ul className="space-y-1">
                {g.items.map((it) => {
                  const s = statuses[it.clause] ?? "pending";
                  const isActive = active === it.clause;
                  return (
                    <li key={it.clause}>
                      <button
                        onClick={() => onSelect(it.clause)}
                        className={`group flex w-full items-center justify-between gap-2 rounded-sm border px-2 py-1.5 text-left text-xs transition ${
                          isActive
                            ? "border-foreground/80 bg-foreground/[0.04]"
                            : "border-transparent hover:border-border hover:bg-secondary"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_META[s].dot}`} />
                          <span className="font-mono text-[11px] tabular-nums text-foreground/80">
                            {it.clause}
                          </span>
                          <span className="truncate text-foreground/90">{it.title}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}