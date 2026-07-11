import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/org/assets")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Assets — AuditOS" }, { name: "description", content: "Information and physical assets in scope." }] }),
  component: Page,
});

const TYPES = ["Equipment", "Software", "Hardware", "Vehicle", "Facility", "Information"];
const STATUSES = ["Active", "Maintenance", "Retired"];

const FIELDS: FieldDef[] = [
  { key: "name", label: "Asset", required: true },
  { key: "type", label: "Type", type: "select", options: TYPES },
  { key: "location", label: "Location" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "Status", type: "select", options: STATUSES },
];

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "name", label: "Asset" },
  { key: "type", label: "Type" },
  { key: "location", label: "Location" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated" },
];

function Page() {
  return (
    <EntityPage
      entity="assets"
      annotation="07 · ASSETS"
      title="Assets"
      idPrefix="A"
      fields={FIELDS}
      columns={COLUMNS}
      filterField={{ key: "type", options: TYPES }}
      defaultValues={{ status: "Active", type: "Equipment" }}
    />
  );
}
