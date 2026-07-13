import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/risk/opportunities")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Opportunities — AuditOS" }, { name: "description", content: "Opportunities from risk analysis." }] }),
  component: Page,
});

const FIELDS: FieldDef[] = [
  { key: "title", label: "Opportunity Title", required: true },
  { key: "source", label: "Source", type: "select", options: ["Risk Assessment", "Audit Finding", "Management Review", "Stakeholder", "Market"] },
  { key: "owner", label: "Owner" },
  { key: "targetDate", label: "Target Date", type: "date" },
  { key: "status", label: "Status", type: "select", options: ["Identified", "Evaluated", "In Progress", "Realized", "Closed"] },
];

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "title", label: "Opportunity" },
  { key: "source", label: "Source" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated" },
];

function Page() {
  return (
    <EntityPage
      entity="opportunities"
      title="Opportunities"
      idPrefix="OP"
      fields={FIELDS}
      columns={COLUMNS}
      filterField={{ key: "status", options: ["Identified", "Evaluated", "In Progress", "Realized", "Closed"] }}
      defaultValues={{ status: "Identified" }}
    />
  );
}