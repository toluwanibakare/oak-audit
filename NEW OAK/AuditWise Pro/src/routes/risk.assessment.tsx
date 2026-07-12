import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, FilterBar, WTable, Kanban, WCard, WPlaceholder, WBadge, Annotation } from "@/components/module-page";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/risk/assessment")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Risk Assessment — AuditOS" }, { name: "description", content: "Risk Assessment module of the AuditOS ISO management platform." }] }),
  component: Page,
});

function Page() {
  return (
    <ModulePage title="Risk Assessment">
      <div className="grid grid-cols-12 gap-4">
        <WCard className="col-span-12 xl:col-span-7" title="Risk Assessment Workspace" hint="Scenario · scoring · controls">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[["Risk ID","R-073"],["Process","Outbound Logistics"],["Threat","Carrier capacity shortage"],["Existing Controls","Multi-carrier contracts"],["Likelihood (1–5)","3"],["Impact (1–5)","4"],["Inherent Rating","12 · High"],["Residual Rating","6 · Medium"]].map(([k,v])=>(
              <label key={k} className="flex flex-col gap-1">
                <span className="annotation">{k}</span>
                <div className="h-9 rounded-md border border-input bg-muted/30 px-2 grid items-center">{v}</div>
              </label>
            ))}
          </div>
        </WCard>
        <WCard className="col-span-12 xl:col-span-5" title="Likelihood × Impact"><WPlaceholder label="5×5 RISK MATRIX" height={260} /></WCard>
      </div>
    </ModulePage>
  );
}
