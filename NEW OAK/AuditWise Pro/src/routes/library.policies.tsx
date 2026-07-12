import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, WBadge, Annotation } from "@/components/module-page";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/library/policies")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Policies — AuditOS" }, { name: "description", content: "Policies module of the AuditOS ISO management platform." }] }),
  component: Page,
});

function Page() {
  return (
    <ModulePage title="Policies">
      <div className="py-8 text-center text-sm text-muted-foreground">Policies will be listed here once published.</div>
    </ModulePage>
  );
}
