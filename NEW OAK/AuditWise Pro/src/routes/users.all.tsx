import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/users/all")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Users — AuditOS" }, { name: "description", content: "Platform users, their roles and departments." }] }),
  component: Page,
});

const ROLES = ["Admin", "Lead Auditor", "Senior Auditor", "Auditor", "Technical Expert", "Manager", "Observer", "Viewer"];
const DEPARTMENTS = ["Operations", "HSE", "IT & Security", "Quality", "Logistics", "HR", "Finance"];
const STATUSES = ["Active", "Invited", "Suspended"];

const FIELDS: FieldDef[] = [
  { key: "name", label: "Full Name", required: true },
  { key: "email", label: "Email", required: true },
  { key: "role", label: "Role", type: "select", options: ROLES, required: true },
  { key: "department", label: "Department", type: "select", options: DEPARTMENTS },
  { key: "status", label: "Status", type: "select", options: STATUSES },
];

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated" },
];

function Page() {
  return (
    <EntityPage
      entity="users"
      annotation="08 · USERS"
      title="Users"
      idPrefix="U"
      fields={FIELDS}
      columns={COLUMNS}
      filterField={{ key: "role", options: ROLES }}
      defaultValues={{ status: "Invited" }}
    />
  );
}
