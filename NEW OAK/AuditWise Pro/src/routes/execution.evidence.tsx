import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";
import { auditStore } from "@/lib/audit-store";
import { orgsApi } from "@/lib/api/orgs";
import apiClient from "@/lib/api/client";
import { toast } from "sonner";
import { Upload, Download, RefreshCw } from "lucide-react";

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
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const items = useAuditStore((s) => Object.values(s.collections.evidence ?? []));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const orgs = await orgsApi.list();
      if (orgs.length === 0) { toast.error("No organization found"); return; }
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post(`/organizations/${orgs[0].id}/evidence/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data;
      auditStore.create("evidence", {
        title: data.name,
        type: file.type.startsWith("image/") ? "Image" : file.type.startsWith("video/") ? "Video" : file.type.startsWith("audio/") ? "Audio" : "Document",
        auditId: "",
        uploadedBy: "You",
        status: "Linked",
        url: data.url,
        path: data.path,
        size: data.size,
        mime: data.mime,
      }, "E");
      toast.success("Evidence uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const toolbar = (
    <>
      <input ref={fileRef} type="file" onChange={handleFileUpload} className="hidden" accept="*/*" />
      <button onClick={() => fileRef.current?.click()} disabled={uploading}
        className="h-8 px-3 inline-flex items-center gap-1 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90 disabled:opacity-50">
        {uploading ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Uploading...</> : <><Upload className="h-3.5 w-3.5" /> Upload File</>}
      </button>
    </>
  );

  const evidenceColumns: ColumnDef[] = [
    ...COLUMNS,
    { key: "actions", label: "File", render: (item: any) => item.url ? (
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-[11px]">
        <Download className="h-3 w-3" /> Open
      </a>
    ) : "—" },
  ];

  return (
    <EntityPage
      entity="evidence"
      title="Evidence Collection"
      description="Attach objective evidence (photos, documents, audio) to audits and findings."
      idPrefix="E"
      fields={FIELDS}
      columns={evidenceColumns}
      filterField={{ key: "type", options: TYPES }}
      defaultValues={{ status: "Linked", type: "Document", uploadedBy: "" }}
      toolbar={toolbar}
    />
  );
}
