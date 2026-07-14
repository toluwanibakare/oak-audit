import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { requireAuth } from "@/lib/require-auth";
import { AppShell } from "@/components/app-shell";
import { Annotation, WBadge } from "@/components/wire";
import { entitiesApi } from "@/lib/api/entities";
import { teamMembersApi, type TeamMember } from "@/lib/api/team-members";
import { orgsApi } from "@/lib/api/orgs";
import { auditStore } from "@/lib/audit-store";
import { Plus, X, Pencil, Trash2, RefreshCw, Users } from "lucide-react";

export const Route = createFileRoute("/users/teams")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Teams — AuditOS" }, { name: "description", content: "Audit teams and group assignments." }] }),
  component: Page,
});

type TeamItem = {
  id: string;
  name: string;
  department: string;
  lead: string;
  members: string;
  status: string;
  updated?: string;
};

function Page() {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<TeamItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamItem | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const orgs = await orgsApi.list();
      if (orgs.length === 0) return;
      const orgId = orgs[0].id;
      const [teamItems, userItems, deptItems] = await Promise.all([
        entitiesApi.list(orgId, "teams").catch(() => [] as any[]),
        teamMembersApi.list(orgId).catch(() => [] as TeamMember[]),
        entitiesApi.list(orgId, "departments").catch(() => [] as any[]),
      ]);
      setTeams(teamItems.map((t: any) => ({ id: t.id, name: t.name || "", department: t.department || "", lead: t.lead || "", members: t.members || "", status: t.status || "Active", updated: t.updated })));
      setUsers(userItems);
      setDepartments(deptItems.map((d: any) => d.name || "").filter(Boolean));
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const saveItem = async (values: Partial<TeamItem>) => {
    const orgs = await orgsApi.list();
    if (orgs.length === 0) return;
    const orgId = orgs[0].id;
    if (editItem) {
      await entitiesApi.update(orgId, "teams", editItem.id, values);
    } else {
      await entitiesApi.create(orgId, "teams", values);
    }
    await loadData();
  };

  const deleteItem = async (item: TeamItem) => {
    const orgs = await orgsApi.list();
    if (orgs.length === 0) return;
    await entitiesApi.delete(orgs[0].id, "teams", item.id);
    await loadData();
  };

  return (
    <AppShell title="Teams">
      <div className="wire-card rounded-lg p-3 flex flex-wrap items-center gap-2">
        <Annotation>{teams.length} teams</Annotation>
        <div className="ml-auto">
          <button onClick={() => { setEditItem(null); setShowModal(true); }}
            className="h-8 px-3 inline-flex items-center gap-1 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90 cursor-pointer">
            <Plus className="h-3.5 w-3.5" /> Add Team
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="wire-card rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b border-border">
                <tr className="text-left">
                  <th className="py-2.5 px-3 annotation font-medium">Team</th>
                  <th className="py-2.5 px-3 annotation font-medium">Department</th>
                  <th className="py-2.5 px-3 annotation font-medium">Lead</th>
                  <th className="py-2.5 px-3 annotation font-medium">Members</th>
                  <th className="py-2.5 px-3 annotation font-medium">Status</th>
                  <th className="py-2.5 px-3 annotation font-medium w-[80px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.length === 0 && (
                  <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No teams yet.</td></tr>
                )}
                {teams.map((t) => (
                  <tr key={t.id} className="border-b border-dashed border-border hover:bg-muted/30">
                    <td className="py-2.5 px-3 font-medium">{t.name}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{t.department}</td>
                    <td className="py-2.5 px-3">{t.lead}</td>
                    <td className="py-2.5 px-3">{t.members}</td>
                    <td className="py-2.5 px-3"><WBadge tone={t.status === "Active" ? "strong" : "outline"}>{t.status}</WBadge></td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditItem(t); setShowModal(true); }}
                          className="h-7 w-7 grid place-items-center rounded hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground" title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(t)}
                          className="h-7 w-7 grid place-items-center rounded hover:bg-red-50 cursor-pointer text-muted-foreground hover:text-destructive" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
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

      {showModal && (
        <TeamFormModal
          item={editItem}
          users={users}
          departments={departments}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadData(); }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          item={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { setDeleteTarget(null); loadData(); }}
        />
      )}
    </AppShell>
  );
}

function TeamFormModal({ item, users, departments, onClose, onSaved }: {
  item: TeamItem | null;
  users: TeamMember[];
  departments: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(item?.name || "");
  const [department, setDepartment] = useState(item?.department || "");
  const [lead, setLead] = useState(item?.lead || "");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(item?.members ? item.members.split(", ").filter(Boolean) : []);
  const [status, setStatus] = useState(item?.status || "Active");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) { setError("Team name is required."); return; }
    setSubmitting(true);
    try {
      const orgs = await orgsApi.list();
      if (orgs.length === 0) { setError("No organization found."); setSubmitting(false); return; }
      const orgId = orgs[0].id;
      const payload = { name: name.trim(), department, lead, members: selectedMembers.join(", "), status };
      if (item) {
        await entitiesApi.update(orgId, "teams", item.id, payload);
      } else {
        await entitiesApi.create(orgId, "teams", payload);
      }
      onSaved();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to save team.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 h-12 border-b border-border">
          <div className="text-sm font-semibold">{item ? "Edit Team" : "Add Team"}</div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded hover:bg-muted cursor-pointer"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          <label className="flex flex-col gap-1 col-span-2">
            <span className="annotation">Team Name *</span>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="h-9 px-2 rounded-md border border-input bg-muted text-xs" placeholder="e.g. ISO Audit Team" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="annotation">Department</span>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}
              className="h-9 px-2 rounded-md border border-input bg-muted text-xs">
              <option value="">— Select Department —</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="annotation">Team Lead</span>
            <select value={lead} onChange={(e) => setLead(e.target.value)}
              className="h-9 px-2 rounded-md border border-input bg-muted text-xs">
              <option value="">— Select Lead —</option>
              {users.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="annotation">Members ({selectedMembers.length} selected)</span>
            <div className="max-h-28 overflow-y-auto rounded-md border border-input bg-muted p-1 space-y-0.5">
              {users.length === 0 && <p className="text-[11px] text-muted-foreground px-1 py-1">No users available</p>}
              {users.map((u) => {
                const checked = selectedMembers.includes(u.name);
                return (
                  <label key={u.id} className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-xs hover:bg-muted/80 ${checked ? "bg-primary/10" : ""}`}>
                    <input type="checkbox" checked={checked} onChange={() => {
                      setSelectedMembers(checked ? selectedMembers.filter((n) => n !== u.name) : [...selectedMembers, u.name]);
                    }} className="accent-primary" />
                    {u.name}
                  </label>
                );
              })}
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span className="annotation">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="h-9 px-2 rounded-md border border-input bg-muted text-xs">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
          {error && <div className="text-xs text-destructive col-span-2">{error}</div>}
        </div>
        <div className="px-4 h-12 border-t border-border flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-8 px-3 rounded-md border border-border text-xs hover:bg-muted cursor-pointer">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer">
            {submitting ? <><RefreshCw className="h-3 w-3 animate-spin" /> Saving...</> : <><Users className="h-3.5 w-3.5" /> {item ? "Save" : "Create"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ item, onClose, onDeleted }: { item: TeamItem; onClose: () => void; onDeleted: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const orgs = await orgsApi.list();
      if (orgs.length === 0) { setError("No organization found."); setSubmitting(false); return; }
      await entitiesApi.delete(orgs[0].id, "teams", item.id);
      onDeleted();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to delete team.");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 h-12 border-b border-border">
          <div className="text-sm font-semibold text-destructive">Delete Team</div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded hover:bg-muted cursor-pointer"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4 text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 text-destructive flex items-center justify-center mx-auto mb-3">
            <Trash2 className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium">Delete {item.name}?</p>
          <p className="text-xs text-muted-foreground mt-1">This action cannot be undone.</p>
          {error && <div className="text-xs text-destructive mt-2">{error}</div>}
        </div>
        <div className="px-4 h-12 border-t border-border flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-8 px-3 rounded-md border border-border text-xs hover:bg-muted cursor-pointer">Cancel</button>
          <button onClick={handleDelete} disabled={submitting}
            className="h-8 px-3 rounded-md bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer">
            {submitting ? <><RefreshCw className="h-3 w-3 animate-spin" /> Deleting...</> : <><Trash2 className="h-3.5 w-3.5" /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}
