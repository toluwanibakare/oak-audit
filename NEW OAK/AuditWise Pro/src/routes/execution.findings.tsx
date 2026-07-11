import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/execution/findings")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Audit Findings — AuditOS" }, { name: "description", content: "All findings raised during audits." }] }),
  component: Page,
});

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
  { key: "severity", label: "Severity" },
  { key: "department", label: "Department" },
  { key: "owner", label: "Owner" },
  { key: "due", label: "Due" },
  { key: "status", label: "Status" },
];

function Page() {
  return (
    <EntityPage
      entity="nonconformities"
      annotation="03 · FINDINGS"
      title="Audit Findings"
      description="All findings — major, minor, observations, and OFIs — raised across audits."
      idPrefix="F"
      fields={FIELDS}
      columns={COLUMNS}
      filterField={{ key: "severity", options: SEVERITIES }}
      defaultValues={{ status: "Open", severity: "Minor", raisedAt: new Date().toISOString().slice(0, 10) }}
    />
  );
}
