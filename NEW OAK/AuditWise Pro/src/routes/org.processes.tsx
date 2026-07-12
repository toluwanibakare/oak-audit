import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/org/processes")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Processes — AuditOS" }, { name: "description", content: "Process inventory aligned to ISO standards." }] }),
  component: Page,
});

const FIELDS: FieldDef[] = [
  { key: "name", label: "Process Name", required: true },
  { key: "owner", label: "Process Owner", required: true },
  { key: "department", label: "Department" },
  { key: "standard", label: "Primary Standard" },
  { key: "status", label: "Status" },
];

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "name", label: "Process" },
  { key: "owner", label: "Owner" },
  { key: "department", label: "Department" },
  { key: "standard", label: "Standard" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated" },
];

function Page() {
  return (
    <EntityPage
      entity="processes"
      title="Processes"
      idPrefix="P"
      fields={FIELDS}
      columns={COLUMNS}
      defaultValues={{ status: "Active" }}
    />
  );
}
