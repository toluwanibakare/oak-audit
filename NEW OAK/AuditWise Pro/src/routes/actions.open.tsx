import { createFileRoute } from "@tanstack/react-router";
import { EntityKanban, type FieldDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/actions/open")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Corrective Actions — Open — AuditOS" }, { name: "description", content: "Kanban board of corrective and preventive actions." }] }),
  component: Page,
});

export const ACTION_STATUSES = ["Open", "Assigned", "In Progress", "Pending Verification", "Closed"];
const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const STANDARDS = ["ISO 9001", "ISO 14001", "ISO 45001", "ISO/IEC 27001", "ISO 22301"];

export const ACTION_FIELDS: FieldDef[] = [
  { key: "title", label: "Title", required: true },
  { key: "findingId", label: "Linked Finding" },
  { key: "owner", label: "Owner", required: true },
  { key: "priority", label: "Priority", type: "select", options: PRIORITIES },
  { key: "standard", label: "Standard", type: "select", options: STANDARDS },
  { key: "due", label: "Due", type: "date", required: true },
  { key: "status", label: "Status", type: "select", options: ACTION_STATUSES },
];

function Page() {
  return (
    <EntityKanban
      entity="actions"
      annotation="05 · ACTIONS"
      title="Corrective Actions"
      statuses={ACTION_STATUSES}
      fields={ACTION_FIELDS}
      idPrefix="CA"
      titleKey="title"
      metaKeys={["owner", "due", "priority"]}
      tagKey="standard"
    />
  );
}
