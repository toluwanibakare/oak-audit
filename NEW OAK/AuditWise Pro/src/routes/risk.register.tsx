import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/risk/register")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Risk Register — AuditOS" }, { name: "description", content: "Risk Register module of the AuditOS ISO management platform." }] }),
  component: Page,
});

const FIELDS: FieldDef[] = [
  { key: "title", label: "Risk Title", required: true },
  { key: "category", label: "Category", type: "select", options: ["Strategic", "Operational", "Financial", "Compliance", "Reputational", "IT/Security"] },
  { key: "likelihood", label: "Likelihood (1-5)", type: "select", options: ["1", "2", "3", "4", "5"] },
  { key: "impact", label: "Impact (1-5)", type: "select", options: ["1", "2", "3", "4", "5"] },
  { key: "owner", label: "Risk Owner" },
  { key: "status", label: "Status", type: "select", options: ["Identified", "Assessed", "Mitigated", "Monitored", "Closed"] },
];

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "title", label: "Risk" },
  { key: "category", label: "Category" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated" },
];

function Page() {
  return (
    <EntityPage
      entity="risks"
      title="Risk Register"
      idPrefix="R"
      fields={FIELDS}
      columns={COLUMNS}
      filterField={{ key: "status", options: ["Identified", "Assessed", "Mitigated", "Monitored", "Closed"] }}
      defaultValues={{ status: "Identified" }}
    />
  );
}