import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, WBadge, Annotation } from "@/components/module-page";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/risk/treatment")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Risk Treatment — AuditOS" }, { name: "description", content: "Risk Treatment module of the AuditOS ISO management platform." }] }),
  component: Page,
});

function Page() {
  return (
    <ModulePage title="Risk Treatment">
      <div className="py-8 text-center text-sm text-muted-foreground">Treatment records will appear here once risks are registered and treatment plans are created.</div>
    </ModulePage>
  );
}
