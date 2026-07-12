import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, WCard, WPlaceholder, WBadge, Annotation } from "@/components/module-page";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/risk/register")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Risk Register — AuditOS" }, { name: "description", content: "Risk Register module of the AuditOS ISO management platform." }] }),
  component: Page,
});

function Page() {
  return (
    <ModulePage title="Risk Register">
      <div className="grid grid-cols-12 gap-4">
        <WCard className="col-span-12 md:col-span-4" title="Risk Matrix"><WPlaceholder label="5×5 HEAT MAP" height={200} /></WCard>
        <WCard className="col-span-12 md:col-span-4" title="Top Risks">
          <div className="py-4 text-center text-xs text-muted-foreground">No risks registered yet.</div>
        </WCard>
        <WCard className="col-span-12 md:col-span-4" title="Risk Trends"><WPlaceholder label="LINE CHART · 12M" height={200} /></WCard>
      </div>
      <div className="py-8 text-center text-sm text-muted-foreground">Risk data will be available once risks are registered in the system.</div>
    </ModulePage>
  );
}
