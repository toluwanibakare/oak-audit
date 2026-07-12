import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type ColumnDef } from "@/components/entity";
import { ACTION_FIELDS, ACTION_STATUSES } from "./actions.open";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/actions/in-progress")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Actions In Progress — AuditOS" }] }),
  component: Page,
});

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "title", label: "Title" },
  { key: "findingId", label: "Finding" },
  { key: "owner", label: "Owner" },
  { key: "priority", label: "Priority" },
  { key: "due", label: "Due" },
  { key: "status", label: "Status" },
];

function Page() {
  return (
    <EntityPage
      entity="actions"
      title="Actions In Progress"
      idPrefix="CA"
      fields={ACTION_FIELDS}
      columns={COLUMNS}
      filterField={{ key: "status", options: ACTION_STATUSES }}
      filter={(i) => i.status === "In Progress" || i.status === "Assigned"}
      defaultValues={{ status: "In Progress", priority: "Medium" }}
    />
  );
}
