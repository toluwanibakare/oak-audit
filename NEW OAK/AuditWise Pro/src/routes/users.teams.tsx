import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/users/teams")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Teams — AuditOS" }, { name: "description", content: "Audit teams and group assignments." }] }),
  component: Page,
});

const FIELDS: FieldDef[] = [
  { key: "name", label: "Team Name", required: true },
  { key: "department", label: "Department" },
  { key: "lead", label: "Team Lead" },
  { key: "members", label: "Members" },
  { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
];

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "name", label: "Team" },
  { key: "department", label: "Department" },
  { key: "lead", label: "Team Lead" },
  { key: "members", label: "Members" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated" },
];

function Page() {
  return (
    <EntityPage
      entity="teams"
      title="Teams"
      idPrefix="T"
      fields={FIELDS}
      columns={COLUMNS}
      filterField={{ key: "status", options: ["Active", "Inactive"] }}
      defaultValues={{ status: "Active" }}
    />
  );
}
