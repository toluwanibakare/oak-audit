import { createFileRoute } from "@tanstack/react-router";
import { EntityKanban, type FieldDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/actions/open")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Corrective Actions — Open — AuditOS" }, { name: "description", content: "Kanban board of corrective and preventive actions." }] }),
  component: Page,
});

export const ACTION_STATUSES = ["Open", "Assigned", "In Progress", "Pending Verification", "Closed"];

export const ACTION_FIELDS: FieldDef[] = [
  { key: "title", label: "Title", required: true },
  { key: "findingId", label: "Linked Finding" },
  { key: "owner", label: "Owner", required: true },
  { key: "priority", label: "Priority" },
  { key: "standard", label: "Standard" },
  { key: "due", label: "Due", type: "date", required: true },
  { key: "status", label: "Status", type: "select", options: ACTION_STATUSES },
];

function Page() {
  return (
    <EntityKanban
      entity="actions"
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
