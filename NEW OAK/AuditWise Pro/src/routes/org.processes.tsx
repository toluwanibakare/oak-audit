import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { requireAuth } from "@/lib/require-auth";
import { entitiesApi } from "@/lib/api/entities";
import { orgsApi } from "@/lib/api/orgs";
import { useAuditStore } from "@/lib/audit-store";

export const Route = createFileRoute("/org/processes")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Processes — AuditOS" }, { name: "description", content: "Process inventory aligned to ISO standards." }] }),
  component: Page,
});

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", width: "110px" },
  { key: "name", label: "Process" },
  { key: "owner", label: "Owner" },
  { key: "department", label: "Department" },
  { key: "standard", label: "Standard" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated" },
];

function Page() {
  const [deptOptions, setDeptOptions] = useState<string[]>([]);
  const [stdOptions, setStdOptions] = useState<string[]>([]);
  const localDepts = useAuditStore((s) => Object.values(s.collections.departments ?? {}));

  useEffect(() => {
    (async () => {
      try {
        const orgs = await orgsApi.list();
        if (orgs.length === 0) return;
        const oid = orgs[0].id;
        const [depts, stds] = await Promise.all([
          entitiesApi.list(oid, "departments").catch(() => []),
          entitiesApi.list(oid, "standards").catch(() => []),
        ]);
        const apiDepts = depts.map((d: any) => d.name || "").filter(Boolean);
        setDeptOptions(apiDepts.length ? apiDepts : localDepts.map((d: any) => d.name || "").filter(Boolean));
        setStdOptions(stds.map((s: any) => s.code || s.name || s.title || "").filter(Boolean));
      } catch {
        setDeptOptions(localDepts.map((d: any) => d.name || "").filter(Boolean));
      }
    })();
  }, [localDepts]);

  const FIELDS: FieldDef[] = [
    { key: "name", label: "Process Name", required: true },
    { key: "owner", label: "Process Owner", required: true },
    { key: "department", label: "Department", type: "select", options: deptOptions },
    { key: "standard", label: "Primary Standard", type: "select", options: stdOptions },
    { key: "status", label: "Status" },
  ];

  return (
    <EntityPage
      entity="processes"
      title="Processes"
      idPrefix="P"
      fields={FIELDS}
      columns={COLUMNS}
      defaultValues={{ status: "Active" }}
    />
  );
}
