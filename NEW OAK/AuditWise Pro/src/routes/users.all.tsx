import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { requireAuth } from "@/lib/require-auth";
import { AppShell } from "@/components/app-shell";
import { Annotation, WBadge } from "@/components/wire";
import { teamMembersApi, type TeamMember, type CreateTeamMemberPayload } from "@/lib/api/team-members";
import { entitiesApi } from "@/lib/api/entities";
import { orgsApi, type Organization } from "@/lib/api/orgs";
import { useAuth } from "@/hooks/use-auth";
import {
  X, RefreshCw, AlertTriangle, Mail, UserPlus, Pencil, Trash2, Shield, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/users/all")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Users — OakAudix" }, { name: "description", content: "Manage users, roles, and departments." }] }),
  component: Page,
});

function Page() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSetManager, setShowSetManager] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [managerTarget, setManagerTarget] = useState<TeamMember | null>(null);
  const { user } = useAuth();
  const isManager = user && org?.manager_id === user.id;

  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const orgs = await orgsApi.list();
      if (orgs.length === 0) return;
      let currentOrg = orgs[0];
      try {
        const freshOrg = await orgsApi.get(orgs[0].id);
        if (freshOrg) currentOrg = freshOrg;
      } catch {
        // fallback to cached list data
      }
      setOrg(currentOrg);
      const data = await teamMembersApi.list(orgs[0].id);
      setMembers(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load team members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, []);

  return (
      <AppShell title="Users">
      <div className="wire-card rounded-lg p-3 flex flex-wrap items-center gap-2">
        <Annotation>{members.length} users</Annotation>
        <div className="ml-auto flex items-center gap-2">
          {!org?.manager_id ? (
            <button
              onClick={() => setShowSetManager(true)}
              className="h-8 px-3 inline-flex items-center gap-1 rounded-md border border-amber-400/50 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs font-medium hover:opacity-90 cursor-pointer"
            >
              <Shield className="h-3.5 w-3.5" /> Set Manager
            </button>
          ) : isManager ? (
            <span className="h-8 px-3 inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
              <Shield className="h-3.5 w-3.5" /> You are the Manager
            </span>
          ) : null}
          <button
            onClick={() => setShowModal(true)}
            className="h-8 px-3 inline-flex items-center gap-1 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90 cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" /> Create New User
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error}
          <button onClick={loadMembers} className="ml-auto flex items-center gap-1 text-amber-700 hover:text-amber-900 cursor-pointer">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading...
        </div>
      )}

      {!loading && (
        <div className="wire-card rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b border-border">
                <tr className="text-left">
                  <th className="py-2.5 px-3 annotation font-medium">Name</th>
                  <th className="py-2.5 px-3 annotation font-medium">Email</th>
                  <th className="py-2.5 px-3 annotation font-medium">Role</th>
                  <th className="py-2.5 px-3 annotation font-medium">Department</th>
                  <th className="py-2.5 px-3 annotation font-medium">Status</th>
                  <th className="py-2.5 px-3 annotation font-medium w-[80px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground">
                      No users yet. Click <span className="font-medium">Create New User</span> to invite someone.
                    </td>
                  </tr>
                )}
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-dashed border-border hover:bg-muted">
                    <td className="py-2.5 px-3">{m.name}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{m.email}</td>
                    <td className="py-2.5 px-3">{m.role === "admin" ? "Management Representative" : m.role}</td>
                    <td className="py-2.5 px-3">{m.department}</td>
                    <td className="py-2.5 px-3">
                      <WBadge tone={m.status === "Active" ? "strong" : "outline"}>{m.status}</WBadge>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        {m.id === org?.manager_id ? (
                          <>
                            <span className="text-[11px] text-muted-foreground italic">Protected</span>
                            {isManager && (
                              <button onClick={() => setManagerTarget(m)} className="h-7 px-2 inline-flex items-center gap-1 rounded hover:bg-muted cursor-pointer text-xs text-muted-foreground hover:text-foreground" title="Transfer Manager role">
                                <ArrowRight className="h-3 w-3" /> Transfer
                              </button>
                            )}
                          </>
                        ) : m.role === "Management Representative" || m.role === "admin" ? (
                          <span className="text-[11px] text-muted-foreground italic">Protected</span>
                        ) : (
                          <>
                            <button onClick={() => setEditMember(m)} className="h-7 w-7 grid place-items-center rounded hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground" title="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDeleteTarget(m)} className="h-7 w-7 grid place-items-center rounded hover:bg-red-50 cursor-pointer text-muted-foreground hover:text-destructive" title="Remove">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
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
        <CreateMemberModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); loadMembers(); }}
        />
      )}

      {showSetManager && (
        <CreateMemberModal
          fixedRole="Manager"
          orgId={org!.id}
          onClose={() => setShowSetManager(false)}
          onCreated={() => { setShowSetManager(false); loadMembers(); }}
        />
      )}

      {editMember && (
        <EditMemberModal
          member={editMember}
          onClose={() => setEditMember(null)}
          onUpdated={() => { setEditMember(null); loadMembers(); }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          member={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { setDeleteTarget(null); loadMembers(); }}
        />
      )}

      {managerTarget !== null && (
        <SetTransferManagerModal
          org={org!}
          members={members}
          existingManagerId={org?.manager_id}
          onClose={() => setManagerTarget(null)}
          onDone={() => { setManagerTarget(null); loadMembers(); }}
        />
      )}
    </AppShell>
  );
}

function EditMemberModal({ member, onClose, onUpdated }: { member: TeamMember; onClose: () => void; onUpdated: () => void }) {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [role, setRole] = useState(member.role);
  const [department, setDepartment] = useState(member.department === "—" ? "" : member.department);
  const [roles, setRoles] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const orgs = await orgsApi.list();
        if (orgs.length === 0) return;
        const orgId = orgs[0].id;
        const [roleItems, deptItems] = await Promise.all([
          entitiesApi.list(orgId, "roles").catch(() => []),
          entitiesApi.list(orgId, "departments").catch(() => []),
        ]);
        const allRoles = roleItems.map((r: any) => r.name || r.role || "").filter(Boolean);
        const fallbackRoles = ["Auditor", "Lead Auditor", "Admin", "Viewer", "Auditee"];
        setRoles((allRoles.length > 0 ? allRoles : fallbackRoles).filter((r) => r !== "Management Representative"));
        setDepartments(deptItems.map((d: any) => d.name || "").filter(Boolean));
      } catch {
        setRoles(["Auditor", "Lead Auditor", "Admin", "Viewer", "Auditee"]);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim() || !email.trim() || !role) {
      setError("Name, email, and role are required.");
      return;
    }
    setSubmitting(true);
    try {
      const orgs = await orgsApi.list();
      if (orgs.length === 0) { setError("No organization found."); setSubmitting(false); return; }
      await teamMembersApi.update(orgs[0].id, member.id, {
        name: name.trim(),
        email: email.trim(),
        role,
        ...(department ? { department } : {}),
      });
      onUpdated();
    } catch (e: any) {
      const msg = e?.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(", ")
        : e?.response?.data?.message || e?.message || "Failed to update member.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 h-12 border-b border-border">
          <div className="text-sm font-semibold">Edit User</div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded hover:bg-muted cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <label className="flex flex-col gap-1">
            <span className="annotation">Full Name *</span>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="h-9 px-2 rounded-md border border-input bg-muted text-xs" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="annotation">Email *</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="h-9 px-2 rounded-md border border-input bg-muted text-xs" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="annotation">Role *</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="h-9 px-2 rounded-md border border-input bg-muted text-xs">
              <option value="">— Select Role —</option>
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="annotation">Department</span>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}
              className="h-9 px-2 rounded-md border border-input bg-muted text-xs">
              <option value="">— None —</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          {error && <div className="text-xs text-destructive">{error}</div>}
        </div>
        <div className="px-4 h-12 border-t border-border flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-8 px-3 rounded-md border border-border text-xs hover:bg-muted cursor-pointer">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer">
            {submitting ? <><RefreshCw className="h-3 w-3 animate-spin" /> Saving...</> : <><Pencil className="h-3.5 w-3.5" /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ member, onClose, onDeleted }: { member: TeamMember; onClose: () => void; onDeleted: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const orgs = await orgsApi.list();
      if (orgs.length === 0) { setError("No organization found."); setSubmitting(false); return; }
      await teamMembersApi.delete(orgs[0].id, member.id);
      onDeleted();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to remove member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 h-12 border-b border-border">
          <div className="text-sm font-semibold text-destructive">Remove User</div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded hover:bg-muted cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 text-destructive flex items-center justify-center mx-auto mb-3">
            <Trash2 className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium">Remove {member.name}?</p>
          <p className="text-xs text-muted-foreground mt-1">They will lose access to the organization.</p>
          {error && <div className="text-xs text-destructive mt-2">{error}</div>}
        </div>
        <div className="px-4 h-12 border-t border-border flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-8 px-3 rounded-md border border-border text-xs hover:bg-muted cursor-pointer">Cancel</button>
          <button onClick={handleDelete} disabled={submitting}
            className="h-8 px-3 rounded-md bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer">
            {submitting ? <><RefreshCw className="h-3 w-3 animate-spin" /> Removing...</> : <><Trash2 className="h-3.5 w-3.5" /> Remove</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function SetTransferManagerModal({
  org, members, existingManagerId, onClose, onDone,
}: {
  org: Organization; members: TeamMember[]; existingManagerId?: string; onClose: () => void; onDone: () => void;
}) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isTransfer = !!existingManagerId;

  const candidates = members.filter((m) => m.id !== existingManagerId && m.status === "Active");

  const handleSubmit = async () => {
    setError(null);
    if (!selectedUserId) { setError("Please select a user."); return; }
    setSubmitting(true);
    try {
      await orgsApi.update(org.id, { manager_id: selectedUserId });
      onDone();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to set manager.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 h-12 border-b border-border">
          <div className="text-sm font-semibold">{isTransfer ? "Transfer Manager" : "Set Manager"}</div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded hover:bg-muted cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          {isTransfer && (
            <p className="text-xs text-muted-foreground">
              Only the current manager can transfer the role. Select a new manager below.
            </p>
          )}
          <label className="flex flex-col gap-1">
            <span className="annotation">Select User *</span>
            <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}
              className="h-9 px-2 rounded-md border border-input bg-muted text-xs">
              <option value="">— Select a user —</option>
              {candidates.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
            </select>
          </label>
          {error && <div className="text-xs text-destructive">{error}</div>}
        </div>
        <div className="px-4 h-12 border-t border-border flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-8 px-3 rounded-md border border-border text-xs hover:bg-muted cursor-pointer">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer">
            {submitting ? <><RefreshCw className="h-3 w-3 animate-spin" /> Saving...</> : <><Shield className="h-3.5 w-3.5" /> {isTransfer ? "Transfer" : "Set Manager"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateMemberModal({ fixedRole, orgId: propOrgId, onClose, onCreated }: {
  fixedRole?: string; orgId?: string; onClose: () => void; onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(fixedRole ?? "");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("Active");
  const [roles, setRoles] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const orgs = await orgsApi.list();
        if (orgs.length === 0) return;
        const orgId = propOrgId || orgs[0].id;
        const [roleItems, deptItems] = await Promise.all([
          entitiesApi.list(orgId, "roles").catch(() => []),
          entitiesApi.list(orgId, "departments").catch(() => []),
        ]);
        const allRoles = roleItems.map((r: any) => r.name || r.role || "").filter(Boolean);
        const fallbackRoles = ["Auditor", "Lead Auditor", "Admin", "Viewer", "Auditee"];
        const filtered = (allRoles.length > 0 ? allRoles : fallbackRoles).filter((r) => r !== "Management Representative");
        if (!fixedRole) {
          setRoles(filtered);
          setRole(filtered[0] ?? "Auditor");
        }
        setDepartments(deptItems.map((d: any) => d.name || "").filter(Boolean));
      } catch {
        if (!fixedRole) {
          setRoles(["Auditor", "Lead Auditor", "Admin", "Viewer", "Auditee"]);
          setRole("Auditor");
        }
      }
    })();
  }, [fixedRole, propOrgId]);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim() || !email.trim() || !password.trim() || (!role && !fixedRole)) {
      setError("Name, email, password, and role are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const orgs = await orgsApi.list();
      if (orgs.length === 0) { setError("No organization found."); setSubmitting(false); return; }
      const oid = propOrgId || orgs[0].id;
      const actualRole = fixedRole || role;
      const payload: CreateTeamMemberPayload = { name: name.trim(), email: email.trim(), password, role: actualRole, status };
      if (department) payload.department = department;
      const created = await teamMembersApi.create(oid, payload);
      if (fixedRole) {
        await orgsApi.update(oid, { manager_id: created.id });
      }
      setSuccess(true);
      setTimeout(() => onCreated(), 1500);
    } catch (e: any) {
      const msg = e?.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(", ")
        : e?.response?.data?.message || e?.message || "Failed to create member.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 h-12 border-b border-border">
          <div className="text-sm font-semibold">Create New User</div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded hover:bg-muted cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Mail className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">Invitation sent successfully!</p>
            <p className="text-xs text-muted-foreground mt-1">An email has been sent to {email}.</p>
          </div>
        ) : (
          <>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              <label className="flex flex-col gap-1">
                <span className="annotation">Full Name *</span>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="h-9 px-2 rounded-md border border-input bg-muted text-xs"
                  placeholder="e.g. John Doe" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="annotation">Email *</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="h-9 px-2 rounded-md border border-input bg-muted text-xs"
                  placeholder="e.g. john@company.com" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="annotation">Password *</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="h-9 px-2 rounded-md border border-input bg-muted text-xs"
                  placeholder="Min. 8 characters" />
              </label>
              {fixedRole ? (
                <label className="flex flex-col gap-1">
                  <span className="annotation">Role</span>
                  <div className="h-9 px-2 rounded-md border border-input bg-muted/50 flex items-center text-xs text-muted-foreground">
                    {fixedRole}
                  </div>
                </label>
              ) : (
                <label className="flex flex-col gap-1">
                  <span className="annotation">Role *</span>
                  <select value={role} onChange={(e) => setRole(e.target.value)}
                    className="h-9 px-2 rounded-md border border-input bg-muted text-xs">
                    <option value="">— Select Role —</option>
                    {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
              )}
              <label className="flex flex-col gap-1">
                <span className="annotation">Department</span>
                {departments.length === 0 ? (
                  <div className="h-9 px-2 rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 flex items-center text-[11px] text-amber-600 dark:text-amber-400">
                    No departments yet. Create one in Organization &gt; Departments first.
                  </div>
                ) : (
                  <select value={department} onChange={(e) => setDepartment(e.target.value)}
                    className="h-9 px-2 rounded-md border border-input bg-muted text-xs">
                    <option value="">— None —</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                )}
              </label>
              <label className="flex flex-col gap-1">
                <span className="annotation">Status</span>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="h-9 px-2 rounded-md border border-input bg-muted text-xs">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </label>
              {error && <div className="text-xs text-destructive">{error}</div>}
            </div>
            <div className="px-4 h-12 border-t border-border flex items-center justify-end gap-2">
              <button onClick={onClose} className="h-8 px-3 rounded-md border border-border text-xs hover:bg-muted cursor-pointer">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer">
                {submitting ? <><RefreshCw className="h-3 w-3 animate-spin" /> Sending...</> : <><UserPlus className="h-3.5 w-3.5" /> Create & Invite</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
