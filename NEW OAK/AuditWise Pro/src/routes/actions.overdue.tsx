import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type ColumnDef } from "@/components/entity";
import { ACTION_FIELDS } from "./actions.open";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/actions/overdue")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Overdue Actions — AuditOS" }] }),
  component: Page,
});

const today = new Date().toISOString().slice(0, 10);
const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "title", label: "Title" },
  { key: "owner", label: "Owner" },
  { key: "priority", label: "Priority" },
  { key: "due", label: "Due" },
  { key: "status", label: "Status" },
];

function Page() {
  return (
    <EntityPage
      entity="actions"
      annotation="05 · OVERDUE"
      title="Overdue Actions"
      description="Actions whose due date is past and that are not yet closed."
      idPrefix="CA"
      fields={ACTION_FIELDS}
      columns={COLUMNS}
      filter={(i) => i.status !== "Closed" && String(i.due ?? "") < today}
      defaultValues={{ status: "Open", priority: "High" }}
    />
  );
}
