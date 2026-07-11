import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, FilterBar, WTable, Kanban, WCard, WPlaceholder, WBadge, Annotation } from "@/components/module-page";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/ai")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "AI Audit Assistant — AuditOS" }, { name: "description", content: "AI Audit Assistant module of the AuditOS ISO management platform." }] }),
  component: Page,
});

function Page() {
  return (
    <ModulePage annotation="11 · AI" title="AI Audit Assistant">
      <div className="grid grid-cols-12 gap-4">
        <WCard className="col-span-12 xl:col-span-4" title="AI Capabilities">
          {["Finding Classification","Root Cause Analysis","Corrective Action Suggestions","Risk Prediction","Audit Report Generator","Compliance Gap Analysis"].map(c=>(
            <div key={c} className="flex items-center gap-2 py-2 border-b border-dashed border-border text-xs">
              <WBadge tone="strong">AI</WBadge><span className="flex-1">{c}</span><WBadge tone="outline">Run</WBadge>
            </div>
          ))}
        </WCard>
        <WCard className="col-span-12 xl:col-span-8 flex flex-col h-[560px]" title="AI Audit Assistant" hint="Context: Findings · Risks · Standards">
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {[
              {who:"You", t:"Summarize open findings for ISO 9001 in Operations."},
              {who:"AI", t:"There are 7 open findings (2 Major, 4 Minor, 1 OFI). 3 cluster around Clause 8.5.1 — Process Control on Line A, suggesting a systemic training gap. Recommended actions drafted."},
              {who:"You", t:"Draft a 5-Why for the Line A cluster."},
              {who:"AI", t:"Drafted 5-Why with operator interviews and shift logs as evidence. Would you like me to create CA tickets for each root cause?"},
            ].map((m,i)=>(
              <div key={i} className={"flex gap-2 "+(m.who==="You"?"justify-end":"")}>
                {m.who==="AI" && <div className="h-7 w-7 rounded-md bg-foreground text-background text-[10px] grid place-items-center font-semibold">AI</div>}
                <div className={"max-w-[75%] rounded-lg px-3 py-2 text-xs "+(m.who==="You"?"bg-foreground text-background":"border border-border bg-muted/40")}>{m.t}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-3 border-t border-border mt-3">
            <input className="flex-1 h-10 px-3 rounded-md border border-input bg-muted/30 text-sm" placeholder="Ask about audits, findings, risks, clauses…" />
            <button className="h-10 px-4 rounded-md bg-foreground text-background text-sm font-medium">Send</button>
          </div>
        </WCard>
      </div>
    </ModulePage>
  );
}
