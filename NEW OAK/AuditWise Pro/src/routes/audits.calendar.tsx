import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, WCard, WBadge, Annotation } from "@/components/module-page";
import { useAuditStore } from "@/lib/audit-store";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/audits/calendar")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Audit Calendar — AuditOS" }, { name: "description", content: "Audit Calendar module of the AuditOS ISO management platform." }] }),
  component: Page,
});

// July 2026 grid (Mon-start). Jul 1, 2026 = Wed → offset 2.
const MONTH_LABEL = "July 2026";
const MONTH_YEAR = "2026-07";
const OFFSET = 2;
const DAYS_IN_MONTH = 31;

function Page() {
  const plans = useAuditStore((s) => Object.values(s.plans));
  const byDay = new Map<number, typeof plans>();
  for (const p of plans) {
    if (!p.startDate.startsWith(MONTH_YEAR)) continue;
    const d = Number(p.startDate.split("-")[2]);
    const arr = byDay.get(d) ?? [];
    arr.push(p);
    byDay.set(d, arr);
  }

  return (
    <ModulePage annotation="02 · CALENDAR" title="Audit Calendar">
      <WCard
        title={`Audit Calendar — ${MONTH_LABEL}`}
        actions={
          <>
            <WBadge tone="outline">{plans.length} scheduled</WBadge>
            <WBadge tone="outline">Month</WBadge>
            <WBadge tone="outline">Week</WBadge>
            <WBadge tone="strong">Day</WBadge>
          </>
        }
      >
        <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden">
          {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((d) => (
            <div key={d} className="bg-muted/40 p-2 annotation text-center">{d}</div>
          ))}
          {Array.from({ length: 35 }).map((_, i) => {
            const dayNum = i - OFFSET + 1;
            const inMonth = dayNum >= 1 && dayNum <= DAYS_IN_MONTH;
            const audits = inMonth ? byDay.get(dayNum) ?? [] : [];
            return (
              <div
                key={i}
                className={`min-h-[96px] p-2 text-xs ${inMonth ? "bg-card" : "bg-muted/20 text-muted-foreground"}`}
              >
                <div className="annotation">{inMonth ? dayNum : ""}</div>
                {/* Seeded sample events */}
                {inMonth && dayNum % 7 === 0 && (
                  <div className="mt-1 rounded border border-border text-[10px] px-1 py-0.5 truncate">
                    ISO 27001 · IT
                  </div>
                )}
                {/* Published from wizard */}
                {audits.map((a) => (
                  <div
                    key={a.id}
                    className={`mt-1 rounded text-[10px] px-1 py-0.5 truncate ${
                      a.status === "Approved"
                        ? "bg-foreground text-background"
                        : a.status === "Pending Approval"
                        ? "bg-foreground/70 text-background"
                        : "border border-dashed border-foreground/60 text-foreground"
                    }`}
                    title={`${a.id} · ${a.title} · ${a.status}`}
                  >
                    {a.standard.split(":")[0]} · {a.department}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          <Legend tone="dashed" label="Draft (auto-published from wizard)" />
          <Legend tone="muted" label="Pending Approval" />
          <Legend tone="solid" label="Approved" />
        </div>
      </WCard>
    </ModulePage>
  );
}

function Legend({ tone, label }: { tone: "dashed" | "muted" | "solid"; label: string }) {
  const cls =
    tone === "solid"
      ? "bg-foreground"
      : tone === "muted"
      ? "bg-foreground/70"
      : "border border-dashed border-foreground/60";
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block h-3 w-6 rounded ${cls}`} />
      <span>{label}</span>
    </div>
  );
}
