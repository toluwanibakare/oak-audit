import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/execution/notes")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Auditor Notes — AuditOS" }, { name: "description", content: "Personal and team notes captured during audits." }] }),
  component: Page,
});

const FIELDS: FieldDef[] = [
  { key: "auditId", label: "Audit ID" },
  { key: "clause", label: "Clause" },
  { key: "text", label: "Note", type: "textarea", required: true },
  { key: "author", label: "Author" },
];

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "auditId", label: "Audit" },
  { key: "clause", label: "Clause", width: "80px" },
  { key: "text", label: "Note" },
  { key: "author", label: "Author" },
  { key: "updated", label: "Updated" },
];

function Page() {
  return (
    <EntityPage
      entity="notes"
      title="Auditor Notes"
      description="Free-form notes from the field that supplement formal findings."
      idPrefix="N"
      fields={FIELDS}
      columns={COLUMNS}
      defaultValues={{ author: "" }}
    />
  );
}
