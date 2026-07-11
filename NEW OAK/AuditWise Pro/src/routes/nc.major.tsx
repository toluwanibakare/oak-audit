import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import type { EntityItem } from "@/lib/audit-store";
import { requireAuth } from "@/lib/require-auth";

const SEVERITIES = ["Major", "Minor", "Observation", "OFI"];
const STATUSES = ["Open", "In Progress", "Pending Verification", "Closed"];
const DEPARTMENTS = ["Operations", "HSE", "IT & Security", "Quality", "Logistics", "HR"];

const FIELDS: FieldDef[] = [
  { key: "clause", label: "Clause", required: true },
  { key: "description", label: "Description", type: "textarea", required: true },
  { key: "severity", label: "Severity", type: "select", options: SEVERITIES, required: true },
  { key: "department", label: "Department", type: "select", options: DEPARTMENTS },
  { key: "owner", label: "Owner" },
  { key: "auditor", label: "Auditor" },
  { key: "due", label: "Due", type: "date" },
  { key: "status", label: "Status", type: "select", options: STATUSES },
];

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "Finding ID", width: "110px" },
  { key: "clause", label: "Clause", width: "80px" },
  { key: "description", label: "Description" },
  { key: "department", label: "Department" },
  { key: "owner", label: "Owner" },
  { key: "due", label: "Due" },
  { key: "status", label: "Status" },
];

export function makeNcPage(severity: string, annotation: string, title: string) {
  return function Page() {
    return (
      <EntityPage
        entity="nonconformities"
        annotation={annotation}
        title={title}
        description={`Findings classified as ${severity}.`}
        idPrefix="F"
        fields={FIELDS}
        columns={COLUMNS}
        filterField={{ key: "status", options: STATUSES }}
        filter={(i: EntityItem) => i.severity === severity}
        defaultValues={{ status: "Open", severity, raisedAt: new Date().toISOString().slice(0, 10) }}
      />
    );
  };
}

export const Route = createFileRoute("/nc/major")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Major NC — AuditOS" }] }),
  component: makeNcPage("Major", "04 · MAJOR NC", "Major Nonconformities"),
});
