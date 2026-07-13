import { useMemo, useState, useEffect, type ReactNode } from "react";
import { ModulePage, WCard, WBadge, Annotation } from "@/components/module-page";
import { auditStore, useAuditStore, type EntityItem } from "@/lib/audit-store";
import { entitiesApi } from "@/lib/api/entities";
import { orgsApi } from "@/lib/api/orgs";
import { Pencil, Trash2, Plus, X, RefreshCw, AlertTriangle } from "lucide-react";

let _orgIdPromise: Promise<string | null> | null = null;
function getOrgId(): Promise<string | null> {
  if (!_orgIdPromise) {
    _orgIdPromise = orgsApi.list().then((orgs) => orgs.length > 0 ? orgs[0].id : null).catch(() => null);
  }
  return _orgIdPromise;
}

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "date" | "number";
  options?: string[];
  placeholder?: string;
  required?: boolean;
};
export type ColumnDef = {
  key: string;
  label?: string;
  width?: string;
  render?: (item: EntityItem) => ReactNode;
};

function statusTone(v: string): "strong" | "outline" | "default" {
  if (!v) return "default";
  if (/active|approved|closed|done|verified/i.test(v)) return "strong";
  if (/draft|review|pending|invited/i.test(v)) return "outline";
  return "default";
}

export function EntityPage(props: {
  entity: string;
  annotation?: string;
  title: string;
  description?: string;
  idPrefix: string;
  fields: FieldDef[];
  columns: ColumnDef[];
  searchKeys?: string[];
  filterField?: { key: string; options: string[] };
  defaultValues?: Partial<EntityItem>;
  filter?: (item: EntityItem) => boolean;
  toolbar?: ReactNode;
}) {
  const localItems = useAuditStore((s) => Object.values(s.collections[props.entity] ?? []));
  const [q, setQ] = useState("");
  const [filterVal, setFilterVal] = useState<string>("All");
  const [editing, setEditing] = useState<EntityItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [synced, setSynced] = useState(false);
  const [apiError, setApiError] = useState(false);

  const items = localItems;

  const filtered = useMemo(() => {
    const keys = props.searchKeys ?? props.fields.map((f) => f.key);
    return items
      .filter((it) => (props.filter ? props.filter(it) : true))
      .filter((it) => (filterVal === "All" || !props.filterField ? true : String(it[props.filterField.key] ?? "") === filterVal))
      .filter((it) => !q || keys.some((k) => String(it[k] ?? "").toLowerCase().includes(q.toLowerCase())))
      .sort((a, b) => String(b.updated ?? "").localeCompare(String(a.updated ?? "")));
  }, [items, q, filterVal, props]);

  useEffect(() => {
    (async () => {
      const orgId = await getOrgId();
      if (!orgId) { setSynced(true); return; }
      try {
        const remote = await entitiesApi.list(orgId, props.entity);
        const existingIds = new Set(auditStore.list(props.entity).map((i) => i.id));
        for (const item of remote) {
          if (existingIds.has(item.id)) {
            auditStore.update(props.entity, item.id, item);
          } else {
            auditStore.create(props.entity, { ...item, id: item.id }, "");
          }
        }
        setApiError(false);
      } catch {
        setApiError(true);
      } finally {
        setSynced(true);
      }
    })();
  }, [props.entity]);

  const saveEntity = async (item: EntityItem | null, values: Partial<EntityItem>) => {
    if (item) {
      auditStore.update(props.entity, item.id, values);
      setEditing(null);
    } else {
      auditStore.create(props.entity, values, props.idPrefix);
      setCreating(null);
    }
    const orgId = await getOrgId();
    if (!orgId) return;
    try {
      if (item) {
        await entitiesApi.update(orgId, props.entity, item.id, values);
      } else {
        await entitiesApi.create(orgId, props.entity, values);
      }
    } catch {}
  };

  const deleteEntity = async (id: string) => {
    if (!confirm(`Delete ${id}?`)) return;
    auditStore.remove(props.entity, id);
    const orgId = await getOrgId();
    if (orgId) {
      try { await entitiesApi.delete(orgId, props.entity, id); } catch {}
    }
  };

  const hasSeed = items.length > 0 && !synced;
  const hasApiData = items.length > 0 && synced && !apiError;

  return (
    <ModulePage annotation={props.annotation} title={props.title} description={props.description}>
      <div className="wire-card rounded-lg p-3 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="h-8 px-2 rounded-md border border-input bg-muted/30 text-xs min-w-[220px]"
        />
        {props.filterField && (
          <select
            value={filterVal}
            onChange={(e) => setFilterVal(e.target.value)}
            className="h-8 px-2 rounded-md border border-input bg-muted/30 text-xs"
          >
            <option>All</option>
            {props.filterField.options.map((o) => <option key={o}>{o}</option>)}
          </select>
        )}
        <Annotation>
          {filtered.length} of {items.length}
        </Annotation>
        <div className="ml-auto flex items-center gap-2">
          {props.toolbar}
          <button
            onClick={() => setCreating(true)}
            className="h-8 px-3 inline-flex items-center gap-1 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </div>
      </div>

      {apiError && (
        <div className="flex items-center gap-2 px-3 py-2 mt-2 rounded-lg bg-amber-50 text-amber-700 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Could not sync with server. Showing local data.
        </div>
      )}

      {!synced && (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading...
        </div>
      )}

      {synced && (
        <div className="wire-card rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b border-border">
                <tr className="text-left">
                  {props.columns.map((c) => (
                    <th key={c.key} className="py-2.5 px-3 annotation font-medium" style={{ width: c.width }}>
                      {c.label ?? c.key}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 w-24 annotation">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={props.columns.length + 1} className="py-10 text-center text-muted-foreground">No records. Click <span className="font-medium">+ New</span> to create one.</td></tr>
                )}
                {filtered.map((it) => (
                  <tr key={it.id} className="border-b border-dashed border-border hover:bg-muted/30">
                    {props.columns.map((c) => (
                      <td key={c.key} className="py-2.5 px-3 align-middle">
                        {c.render
                          ? c.render(it)
                          : c.key === "id"
                          ? <span className="font-mono text-[11px]">{it.id}</span>
                          : c.key === "status"
                          ? <WBadge tone={statusTone(String(it[c.key] ?? ""))}>{String(it[c.key] ?? "—")}</WBadge>
                          : String(it[c.key] ?? "—")}
                      </td>
                    ))}
                    <td className="py-2.5 px-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditing(it)} className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-muted" title="Edit">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button onClick={() => deleteEntity(it.id)} className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-muted" title="Delete">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(creating || editing) && (
        <EntityDialog
          fields={props.fields}
          item={editing ?? (props.defaultValues as EntityItem | null)}
          title={editing ? `Edit ${editing.id}` : `New ${props.title}`}
          onClose={() => { setEditing(null); setCreating(null); }}
          onSubmit={(values) => saveEntity(editing, values)}
        />
      )}
    </ModulePage>
  );
}

export function EntityDialog({
  fields, item, title, onClose, onSubmit,
}: {
  fields: FieldDef[];
  item: EntityItem | null;
  title: string;
  onClose: () => void;
  onSubmit: (values: Partial<EntityItem>) => void;
}) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const v: Record<string, any> = {};
    for (const f of fields) v[f.key] = item?.[f.key] ?? "";
    return v;
  });
  const [error, setError] = useState<string | null>(null);

  function submit() {
    for (const f of fields) {
      if (f.required && !String(values[f.key] ?? "").trim()) {
        setError(`${f.label} is required`); return;
      }
    }
    onSubmit(values);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 h-12 border-b border-border">
          <div className="text-sm font-semibold">{title}</div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {fields.map((f) => (
            <label key={f.key} className={`flex flex-col gap-1 ${f.type === "textarea" ? "col-span-2" : ""}`}>
              <span className="annotation">{f.label}{f.required && " *"}</span>
              {f.type === "select" ? (
                <select
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  className="h-9 px-2 rounded-md border border-input bg-muted/30 text-xs"
                >
                  <option value="">— Select —</option>
                  {f.options?.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="min-h-[80px] p-2 rounded-md border border-input bg-muted/30 text-xs"
                />
              ) : (
                <input
                  type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="h-9 px-2 rounded-md border border-input bg-muted/30 text-xs"
                />
              )}
            </label>
          ))}
        </div>
        {error && <div className="px-4 pb-2 text-xs text-destructive">{error}</div>}
        <div className="px-4 h-12 border-t border-border flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-8 px-3 rounded-md border border-border text-xs hover:bg-muted">Cancel</button>
          <button onClick={submit} className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90">
            {item ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ====================== Kanban with state moves ====================== */

export function EntityKanban(props: {
  entity: string;
  annotation: string;
  title: string;
  statuses: string[];
  fields: FieldDef[];
  idPrefix: string;
  titleKey?: string;
  metaKeys?: string[];
  tagKey?: string;
}) {
  const items = useAuditStore((s) => Object.values(s.collections[props.entity] ?? []));
  const [editing, setEditing] = useState<EntityItem | null>(null);
  const [creating, setCreating] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);
  const titleKey = props.titleKey ?? "title";

  useEffect(() => {
    (async () => {
      const orgId = await getOrgId();
      if (!orgId) { setSynced(true); return; }
      try {
        const remote = await entitiesApi.list(orgId, props.entity);
        const existingIds = new Set(auditStore.list(props.entity).map((i) => i.id));
        for (const item of remote) {
          if (existingIds.has(item.id)) {
            auditStore.update(props.entity, item.id, item);
          } else {
            auditStore.create(props.entity, { ...item, id: item.id }, "");
          }
        }
      } catch {} finally { setSynced(true); }
    })();
  }, [props.entity]);

  const saveEntity = async (item: EntityItem | null, values: Partial<EntityItem>) => {
    if (item) {
      auditStore.update(props.entity, item.id, values);
      setEditing(null);
    } else {
      auditStore.create(props.entity, { ...values, status: creating }, props.idPrefix);
      setCreating(null);
    }
    const orgId = await getOrgId();
    if (orgId && item) {
      try { await entitiesApi.update(orgId, props.entity, item.id, values); } catch {}
    }
  };

  if (!synced) {
    return (
      <ModulePage annotation={props.annotation} title={props.title}>
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading...
        </div>
      </ModulePage>
    );
  }

  return (
    <ModulePage annotation={props.annotation} title={props.title}>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {props.statuses.map((st) => {
          const cards = items.filter((i) => i.status === st);
          return (
            <div key={st} className="wire-card rounded-lg p-3 flex flex-col gap-2 min-h-[420px]">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold">{st}</div>
                <WBadge>{cards.length}</WBadge>
              </div>
              <div className="space-y-2">
                {cards.map((c) => (
                  <div key={c.id} className="rounded-md border border-border bg-card p-2.5 space-y-1.5">
                    <div className="text-xs font-medium leading-snug">{c[titleKey] ?? c.id}</div>
                    <div className="annotation">
                      {(props.metaKeys ?? ["owner", "due"]).map((k) => c[k]).filter(Boolean).join(" · ")}
                    </div>
                    <div className="flex items-center justify-between">
                      {props.tagKey && c[props.tagKey] ? <WBadge tone="outline">{c[props.tagKey]}</WBadge> : <span />}
                      <div className="flex gap-1">
                        <select
                          value={c.status}
                          onChange={(e) => auditStore.update(props.entity, c.id, { status: e.target.value })}
                          className="h-6 px-1 text-[10px] rounded border border-border bg-muted/40"
                          title="Move"
                        >
                          {props.statuses.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <button onClick={() => setEditing(c)} className="h-6 w-6 grid place-items-center rounded border border-border hover:bg-muted" title="Edit">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button onClick={() => { if (confirm(`Delete ${c.id}?`)) auditStore.remove(props.entity, c.id); }} className="h-6 w-6 grid place-items-center rounded border border-border hover:bg-muted" title="Delete">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setCreating(st)}
                  className="w-full h-8 rounded-md border border-dashed border-border text-[11px] text-muted-foreground hover:bg-muted"
                >+ Add card</button>
              </div>
            </div>
          );
        })}
      </div>

      {(editing || creating) && (
        <EntityDialog
          fields={props.fields}
          item={editing ?? ({ id: "", status: creating } as EntityItem)}
          title={editing ? `Edit ${editing.id}` : `New ${props.title}`}
          onClose={() => { setEditing(null); setCreating(null); }}
          onSubmit={(values) => saveEntity(editing, values)}
        />
      )}
    </ModulePage>
  );
}
