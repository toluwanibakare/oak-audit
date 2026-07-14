import { createFileRoute, Link } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { Settings, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/library/standards")({
  head: () => ({ meta: [{ title: "ISO Standards — AuditOS" }, { name: "description", content: "Library of ISO standards and normative references." }] }),
  component: Page,
});

function Page() {
  return (
    <ModulePage title="ISO Standards">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-16 w-16 rounded-full bg-muted grid place-items-center mb-6">
          <Settings className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Standards moved to Settings</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Standards are now managed in the Settings page where you can activate, deactivate, and create new standards. 
          Only active standards appear in the Processes page.
        </p>
        <Link to="/settings" className="h-10 px-5 rounded-md bg-foreground text-background text-sm font-medium inline-flex items-center gap-2 hover:opacity-90">
          Go to Settings <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </ModulePage>
  );
}
