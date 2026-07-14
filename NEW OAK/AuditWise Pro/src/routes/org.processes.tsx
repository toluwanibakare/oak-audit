import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EntityPage, type FieldDef, type ColumnDef } from "@/components/entity";
import { WBadge } from "@/components/module-page";
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
  { key: "standard", label: "Standard(s)", render: (item: any) => (
    <div className="flex flex-wrap gap-1">
      {(item.standard ?? "").split(",").map((s: string) => s.trim()).filter(Boolean).map((s: string) => (
        <WBadge key={s} tone="outline">{s}</WBadge>
      ))}
    </div>
  )},
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated" },
];

function Page() {
  const [deptOptions, setDeptOptions] = useState<string[] | undefined>(undefined);
  const [stdOptions, setStdOptions] = useState<string[] | undefined>(undefined);
  const localDepts = useAuditStore((s) => Object.values(s.collections.departments ?? {}));

  const storeStds = useAuditStore((s) => Object.values(s.collections.standards ?? {}));

  useEffect(() => {
    (async () => {
      try {
        const orgs = await orgsApi.list();
        if (orgs.length === 0) return;
        const oid = orgs[0].id;
        const [depts] = await Promise.all([
          entitiesApi.list(oid, "departments").catch(() => []),
        ]);
        const apiDepts = depts.map((d: any) => d.name || "").filter(Boolean);
        setDeptOptions(apiDepts.length ? apiDepts : localDepts.map((d: any) => d.name || "").filter(Boolean));
        setStdOptions(storeStds.filter((s: any) => s.status === "Active").map((s: any) => s.code).filter(Boolean));
      } catch {
        setDeptOptions(localDepts.map((d: any) => d.name || "").filter(Boolean));
      }
    })();
  }, [localDepts, storeStds]);

  const FIELDS: FieldDef[] = [
    { key: "name", label: "Process Name", required: true },
    { key: "owner", label: "Process Owner", required: true },
    { key: "department", label: "Department", type: "select", options: deptOptions },
    { key: "standard", label: "Standard(s)", type: "multi-select", options: stdOptions },
    { key: "status", label: "Status", type: "select", options: ["Active", "Inactive", "Draft", "Retired"] },
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
