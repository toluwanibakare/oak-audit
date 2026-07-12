import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, WBadge, Annotation } from "@/components/module-page";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/library/procedures")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Procedures — AuditOS" }, { name: "description", content: "Procedures module of the AuditOS ISO management platform." }] }),
  component: Page,
});

function Page() {
  return (
    <ModulePage title="Procedures">
      <div className="py-8 text-center text-sm text-muted-foreground">Procedures will be listed here once created.</div>
    </ModulePage>
  );
}
