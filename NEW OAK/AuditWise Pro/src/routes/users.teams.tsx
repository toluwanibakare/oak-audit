import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/users/teams")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Teams — AuditOS" }, { name: "description", content: "Audit teams grouped by standard or function." }] }),
  component: Page,
});

const STANDARDS = ["ISO 9001", "ISO 14001", "ISO 45001", "ISO 27001", "ISO 22301"];
const STATUSES = ["Active", "Inactive"];

const FIELDS: FieldDef[] = [
  { key: "name", label: "Team", required: true },
  { key: "lead", label: "Team Lead", required: true },
  { key: "members", label: "# Members", type: "number" },
  { key: "standard", label: "Standard", type: "select", options: STANDARDS },
  { key: "status", label: "Status", type: "select", options: STATUSES },
];

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "name", label: "Team" },
  { key: "lead", label: "Lead" },
  { key: "members", label: "Members" },
  { key: "standard", label: "Standard" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated" },
];

function Page() {
  return (
    <EntityPage
      entity="teams"
      annotation="08 · TEAMS"
      title="Teams"
      idPrefix="T"
      fields={FIELDS}
      columns={COLUMNS}
      filterField={{ key: "standard", options: STANDARDS }}
      defaultValues={{ status: "Active", members: 1 }}
    />
  );
}
