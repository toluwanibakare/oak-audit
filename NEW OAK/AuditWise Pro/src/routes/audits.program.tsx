import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ModulePage, WCard, WBadge, Annotation } from "@/components/module-page";
import { auditStore, useAuditStore } from "@/lib/audit-store";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/audits/program")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Audit Program — AuditOS" }, { name: "description", content: "Annual ISO audit program overview." }] }),
  component: Page,
});

function Page() {
  const plans = useAuditStore((s) => Object.values(s.plans));
  const byStd = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of plans) m.set(p.standard, (m.get(p.standard) ?? 0) + 1);
    return Array.from(m.entries());
  }, [plans]);
  const byDept = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of plans) m.set(p.department, (m.get(p.department) ?? 0) + 1);
    return Array.from(m.entries());
  }, [plans]);

  return (
    <ModulePage title="Audit Program" description="Strategic coverage across standards, departments, and quarters.">
      <div className="grid grid-cols-12 gap-4">
        <WCard className="col-span-6" title="By ISO Standard">
          {byStd.length === 0 ? <Annotation>No data yet</Annotation> :
            byStd.map(([s, n]) => (
              <div key={s} className="flex items-center gap-3 py-1.5">
                <div className="text-xs w-40 truncate">{s}</div>
                <div className="flex-1 h-2 bg-muted rounded overflow-hidden"><div className="h-full bg-foreground" style={{ width: `${Math.min(100, n * 20)}%` }} /></div>
                <div className="text-xs w-6 text-right">{n}</div>
              </div>
            ))}
        </WCard>
        <WCard className="col-span-6" title="By Department">
          {byDept.length === 0 ? <Annotation>No data yet</Annotation> :
            byDept.map(([s, n]) => (
              <div key={s} className="flex items-center gap-3 py-1.5">
                <div className="text-xs w-40 truncate">{s}</div>
                <div className="flex-1 h-2 bg-muted rounded overflow-hidden"><div className="h-full bg-foreground" style={{ width: `${Math.min(100, n * 20)}%` }} /></div>
                <div className="text-xs w-6 text-right">{n}</div>
              </div>
            ))}
        </WCard>
        <WCard className="col-span-12" title="All Plans">
          <div className="grid grid-cols-4 gap-2">
            {plans.map((p) => (
              <div key={p.id} className="border border-border rounded p-2 text-xs">
                <div className="font-mono text-[10px] text-muted-foreground">{p.id}</div>
                <div className="font-medium truncate">{p.title}</div>
                <div className="text-muted-foreground">{p.standard.split(":")[0]} · {p.department}</div>
                <WBadge tone={p.status === "Approved" ? "strong" : "outline"}>{p.status}</WBadge>
              </div>
            ))}
            {plans.length === 0 && <Annotation>No plans yet.</Annotation>}
          </div>
        </WCard>
      </div>
    </ModulePage>
  );
}
