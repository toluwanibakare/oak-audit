import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/execution/checklists")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Audit Checklists — AuditOS" }, { name: "description", content: "Library of audit checklists for ISO standards." }] }),
  component: Page,
});

const STANDARDS = ["ISO 9001", "ISO 14001", "ISO 45001", "ISO/IEC 27001", "ISO 22301"];
const STATUSES = ["Active", "Draft", "Archived"];

const FIELDS: FieldDef[] = [
  { key: "name", label: "Name", required: true },
  { key: "standard", label: "Standard", type: "select", options: STANDARDS, required: true },
  { key: "version", label: "Version" },
  { key: "items", label: "# Items", type: "number" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "Status", type: "select", options: STATUSES },
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
      annotation="03 · CHECKLISTS"
      title="Audit Checklists"
      description="Reusable checklists referenced when creating audit plans."
      idPrefix="CHK"
      fields={FIELDS}
      columns={COLUMNS}
      filterField={{ key: "standard", options: STANDARDS }}
      defaultValues={{ status: "Active", version: "v1.0" }}
    />
  );
}
