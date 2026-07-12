import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { requireAuth } from "@/lib/require-auth";
import { Bot } from "lucide-react";

export const Route = createFileRoute("/ai")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "OAK AI — Coming Soon" }] }),
  component: Page,
});

function Page() {
  return (
    <ModulePage title="OAK AI">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Bot className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight">OAK AI</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Our intelligent audit assistant is being trained on ISO standards, audit findings, and compliance data.
          It will help you classify findings, suggest root causes, draft reports, and predict risks.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Coming Soon
        </div>
      </div>
    </ModulePage>
  );
}
