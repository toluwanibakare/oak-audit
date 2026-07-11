import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, FilterBar, WTable, Kanban, WCard, WPlaceholder, WBadge, Annotation } from "@/components/module-page";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/risk/treatment")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Risk Treatment — AuditOS" }, { name: "description", content: "Risk Treatment module of the AuditOS ISO management platform." }] }),
  component: Page,
});

function Page() {
  return (
    <ModulePage annotation="06 · RISK" title="Risk Treatment">
      <FilterBar filters={["Status", "Owner", "Department", "Date Range"]} />
      <WTable
        columns={[{ key: "ID" }, { key: "Name" }, { key: "Owner" }, { key: "Status" }, { key: "Updated" }]}
        rows={Array.from({ length: 8 }).map((_, i) => [
          <span className="font-mono text-[11px]">REC-{1000 + i}</span>,
          "Sample record " + (i + 1),
          ["M. Chen", "R. Patel", "L. Okafor", "S. Müller"][i % 4],
          <WBadge tone={i % 3 === 0 ? "strong" : "outline"}>{["Active", "Draft", "Review"][i % 3]}</WBadge>,
          "Jun " + (10 + i) + ", 2026",
        ])}
      />
    </ModulePage>
  );
}
