import { createFileRoute } from "@tanstack/react-router";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/execution/evidence")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Evidence Collection — AuditOS" }, { name: "description", content: "Photos, documents, and recordings tied to audit findings." }] }),
  component: Page,
});

const TYPES = ["Document", "Image", "Audio", "Video", "Link"];
const STATUSES = ["Linked", "Unlinked", "Archived"];

const FIELDS: FieldDef[] = [
  { key: "title", label: "Title", required: true },
  { key: "type", label: "Type", type: "select", options: TYPES, required: true },
  { key: "auditId", label: "Audit ID" },
  { key: "uploadedBy", label: "Uploaded By" },
  { key: "status", label: "Status", type: "select", options: STATUSES },
];

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "title", label: "Title" },
  { key: "type", label: "Type" },
  { key: "auditId", label: "Audit" },
  { key: "uploadedBy", label: "Uploaded By" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated" },
];

function Page() {
  return (
    <EntityPage
      entity="evidence"
      title="Evidence Collection"
      description="Attach objective evidence (photos, documents, audio) to audits and findings."
      idPrefix="E"
      fields={FIELDS}
      columns={COLUMNS}
      filterField={{ key: "type", options: TYPES }}
      defaultValues={{ status: "Linked", type: "Document", uploadedBy: "" }}
    />
  );
}
