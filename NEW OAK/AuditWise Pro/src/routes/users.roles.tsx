import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/users/roles")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Roles — AuditOS" }, { name: "description", content: "Role definitions used in the permissions matrix." }] }),
  component: Page,
});

const SCOPES = ["Global", "Audits", "Department", "Read-only"];
const STATUSES = ["Active", "Draft", "Archived"];

const FIELDS: FieldDef[] = [
  { key: "name", label: "Role Name", required: true },
  { key: "scope", label: "Scope", type: "select", options: SCOPES },
  { key: "members", label: "Members", type: "number" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "status", label: "Status", type: "select", options: STATUSES },
];

const COLUMNS: ColumnDef[] = [
  { key: "name", label: "Role" },
  { key: "scope", label: "Scope" },
  { key: "members", label: "Members" },
  { key: "description", label: "Description" },
  { key: "status", label: "Status" },
];

function Page() {
  return (
    <EntityPage
      entity="roles"
      title="Roles"
      idPrefix="R"
      fields={FIELDS}
      columns={COLUMNS}
      filterField={{ key: "scope", options: SCOPES }}
      defaultValues={{ status: "Active", scope: "Audits", members: 0 }}
    />
  );
}
