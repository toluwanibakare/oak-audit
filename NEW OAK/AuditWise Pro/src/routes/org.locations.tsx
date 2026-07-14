import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/org/locations")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Locations — AuditOS" }, { name: "description", content: "Sites and facilities in scope of the management system." }] }),
  component: Page,
});

const TYPES = ["Manufacturing", "Distribution", "Office", "DC", "Lab"];
const STATUSES = ["Active", "Inactive"];

const FIELDS: FieldDef[] = [
  { key: "name", label: "Location", required: true },
  { key: "country", label: "Country", type: "country" },
  { key: "type", label: "Type", type: "select", options: TYPES },
  { key: "manager", label: "Site Manager" },
  { key: "status", label: "Status", type: "select", options: STATUSES },
];

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "name", label: "Location" },
  { key: "country", label: "Country" },
  { key: "type", label: "Type" },
  { key: "manager", label: "Manager" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated" },
];

function Page() {
  return (
    <EntityPage
      entity="locations"
      title="Locations"
      idPrefix="L"
      fields={FIELDS}
      columns={COLUMNS}
      filterField={{ key: "type", options: TYPES }}
      defaultValues={{ status: "Active" }}
    />
  );
}
