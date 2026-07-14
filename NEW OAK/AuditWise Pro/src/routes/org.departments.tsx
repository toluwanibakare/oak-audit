import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/org/departments")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Departments — AuditOS" }, { name: "description", content: "Organizational units in scope of the management system." }] }),
  component: Page,
});

const STATUSES = ["Active", "Review", "Inactive", "Suspended"];

const FIELDS: FieldDef[] = [
  { key: "name", label: "Department", required: true },
  { key: "head", label: "Department Head" },
  { key: "owner", label: "QMS Owner" },
  { key: "staff", label: "Staff Count", type: "number" },
  { key: "status", label: "Status", type: "select", options: STATUSES },
];

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "name", label: "Department" },
  { key: "head", label: "Head" },
  { key: "owner", label: "QMS Owner" },
  { key: "staff", label: "Staff" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated" },
];

function Page() {
  return (
    <EntityPage
      entity="departments"
      title="Departments"
      idPrefix="D"
      fields={FIELDS}
      columns={COLUMNS}
      filterField={{ key: "status", options: STATUSES }}
      defaultValues={{ status: "Active", staff: 0 }}
    />
  );
}
