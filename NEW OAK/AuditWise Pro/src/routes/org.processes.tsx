import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/org/processes")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Processes — AuditOS" }, { name: "description", content: "Process inventory aligned to ISO standards." }] }),
  component: Page,
});

const STANDARDS = ["ISO 9001", "ISO 14001", "ISO 45001", "ISO 27001", "ISO 22301"];
const DEPARTMENTS = ["Operations", "HSE", "IT & Security", "Quality", "Logistics", "HR", "Finance"];
const STATUSES = ["Active", "Draft", "Retired"];

const FIELDS: FieldDef[] = [
  { key: "name", label: "Process Name", required: true },
  { key: "owner", label: "Process Owner", required: true },
  { key: "department", label: "Department", type: "select", options: DEPARTMENTS },
  { key: "standard", label: "Primary Standard", type: "select", options: STANDARDS },
  { key: "status", label: "Status", type: "select", options: STATUSES },
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
      annotation="07 · PROCESSES"
      title="Processes"
      idPrefix="P"
      fields={FIELDS}
      columns={COLUMNS}
      filterField={{ key: "standard", options: STANDARDS }}
      defaultValues={{ status: "Active" }}
    />
  );
}
