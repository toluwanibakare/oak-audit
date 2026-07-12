import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/execution/checklists")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Audit Checklists — AuditOS" }, { name: "description", content: "Library of audit checklists for ISO standards." }] }),
  component: Page,
});

const FIELDS: FieldDef[] = [
  { key: "name", label: "Name", required: true },
  { key: "standard", label: "Standard", required: true },
  { key: "version", label: "Version" },
  { key: "items", label: "# Items", type: "number" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "Status" },
];

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "name", label: "Name" },
  { key: "standard", label: "Standard" },
  { key: "version", label: "Version" },
  { key: "items", label: "Items" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated" },
];

function Page() {
  return (
    <EntityPage
      entity="checklists"
      title="Audit Checklists"
      description="Reusable checklists referenced when creating audit plans."
      idPrefix="CHK"
      fields={FIELDS}
      columns={COLUMNS}
      defaultValues={{ status: "Active", version: "v1.0" }}
    />
  );
}
