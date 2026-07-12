import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type ColumnDef } from "@/components/entity";
import { ACTION_FIELDS } from "./actions.open";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/actions/closed")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Closed Actions — AuditOS" }] }),
  component: Page,
});

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "title", label: "Title" },
  { key: "owner", label: "Owner" },
  { key: "priority", label: "Priority" },
  { key: "due", label: "Closed" },
  { key: "status", label: "Status" },
];

function Page() {
  return (
    <EntityPage
      entity="actions"
      title="Closed Actions"
      idPrefix="CA"
      fields={ACTION_FIELDS}
      columns={COLUMNS}
      filter={(i) => i.status === "Closed"}
      defaultValues={{ status: "Closed" }}
    />
  );
}
