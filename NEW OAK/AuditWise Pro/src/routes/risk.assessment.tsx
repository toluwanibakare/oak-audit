import { createFileRoute } from "@tanstack/react-router";
import { EntityKanban } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/risk/assessment")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Risk Assessment — AuditOS" }, { name: "description", content: "Risk Assessment module of the AuditOS ISO management platform." }] }),
  component: Page,
});

const FIELDS: import("@/components/entity").FieldDef[] = [
  { key: "title", label: "Risk Title", required: true },
  { key: "category", label: "Category", type: "select", options: ["Strategic", "Operational", "Financial", "Compliance", "Reputational", "IT/Security"] },
  { key: "likelihood", label: "Likelihood (1-5)", type: "select", options: ["1", "2", "3", "4", "5"] },
  { key: "impact", label: "Impact (1-5)", type: "select", options: ["1", "2", "3", "4", "5"] },
  { key: "owner", label: "Risk Owner" },
  { key: "mitigation", label: "Mitigation Plan", type: "textarea" },
];

function Page() {
  return (
    <EntityKanban
      entity="risks"
      title="Risk Assessment"
      statuses={["Identified", "Assessed", "Mitigated", "Monitored", "Closed"]}
      fields={FIELDS}
      idPrefix="R"
      titleKey="title"
      metaKeys={["owner", "category"]}
      tagKey="category"
    />
  );
}