import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/risk/treatment")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Risk Treatment — AuditOS" }, { name: "description", content: "Risk Treatment module." }] }),
  component: Page,
});

const FIELDS: FieldDef[] = [
  { key: "title", label: "Treatment Title", required: true },
  { key: "riskId", label: "Risk ID" },
  { key: "treatment", label: "Treatment Plan", type: "textarea" },
  { key: "owner", label: "Owner" },
  { key: "dueDate", label: "Due Date", type: "date" },
  { key: "status", label: "Status", type: "select", options: ["Planned", "In Progress", "Completed", "Overdue"] },
];

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "title", label: "Treatment" },
  { key: "owner", label: "Owner" },
  { key: "dueDate", label: "Due Date" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated" },
];

function Page() {
  return (
    <EntityPage
      entity="risk-treatments"
      title="Risk Treatment"
      idPrefix="RT"
      fields={FIELDS}
      columns={COLUMNS}
      filterField={{ key: "status", options: ["Planned", "In Progress", "Completed", "Overdue"] }}
      defaultValues={{ status: "Planned" }}
    />
  );
}