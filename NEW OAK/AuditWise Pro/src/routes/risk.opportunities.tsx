import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, WBadge, Annotation } from "@/components/module-page";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/risk/opportunities")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Opportunities Register — AuditOS" }, { name: "description", content: "Opportunities Register module of the AuditOS ISO management platform." }] }),
  component: Page,
});

function Page() {
  return (
    <ModulePage title="Opportunities Register">
      <div className="py-8 text-center text-sm text-muted-foreground">Opportunities data will appear once registered in the system.</div>
    </ModulePage>
  );
}
