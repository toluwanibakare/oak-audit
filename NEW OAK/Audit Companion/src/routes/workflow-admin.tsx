import { createFileRoute, Link } from "@tanstack/react-router";
import { useWorkflow, workflow } from "@/lib/workflow/store";
import { ALL_ROLES, STAGE_ORDER, defaultStageConfig } from "@/lib/workflow/config";
import type { Permission, Role, StageId } from "@/lib/workflow/types";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/workflow-admin")({
  head: () => ({
    meta: [
      { title: "Workflow Admin — OakAudix" },
      { name: "description", content: "Administer workflow stages, approvals, notifications and role-based permissions." },
    ],
  }),
  component: AdminPage,
});

const PERMS: Permission[] = ["view","create","edit","approve","close","delete","export"];

function AdminPage() {
  const rbac = useWorkflow(s => s.rbac);

  const toggle = (role: Role, stage: StageId, perm: Permission) => {
    const has = rbac[role][stage].includes(perm);
    const next = has ? rbac[role][stage].filter(p => p !== perm) : [...rbac[role][stage], perm];
    const updated = { ...rbac, [role]: { ...rbac[role], [stage]: next } };
    // mutate via workflow.get() to persist
    (workflow.get() as { rbac: typeof rbac }).rbac = updated;
    // trigger via a benign setRole to same value to persist + notify
    workflow.setRole(workflow.get().role);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold"><Shield className="h-5 w-5 text-[var(--teal,#0d9488)]" /> OakAudix</Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/workflow" className="text-slate-600 hover:text-slate-900">Workflow</Link>
            <Link to="/dashboard" className="text-slate-600 hover:text-slate-900">Dashboard</Link>
            <Link to="/workflow-admin" className="font-semibold">Admin</Link>
          </nav>
        </div>
      </header>
      <div className="container-page py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Workflow administration</h1>
          <p className="text-sm text-slate-600">Configure stages, approvals, notifications and role-based permissions without redevelopment.</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">Stage configuration</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-slate-500">
                <tr><th className="p-2">#</th><th className="p-2">Stage</th><th className="p-2">Approval</th><th className="p-2">Approver roles</th><th className="p-2">Notify roles</th></tr>
              </thead>
              <tbody>
                {defaultStageConfig.map((c, i) => (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="p-2 font-mono text-slate-500">{i+1}</td>
                    <td className="p-2 font-medium text-slate-900">{c.label}</td>
                    <td className="p-2">{c.requiresApproval ? "Required" : "Not required"}</td>
                    <td className="p-2 text-slate-600">{c.approverRoles.join(", ") || "—"}</td>
                    <td className="p-2 text-slate-600">{c.notifyRoles.join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Reorder / edit these entries in <code>src/lib/workflow/config.ts</code>; UI reflects changes with no code changes elsewhere.</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">Role-based permissions</h2>
          <p className="mb-2 text-xs text-slate-500">Click a cell to toggle. Changes persist immediately.</p>
          <div className="space-y-4">
            {ALL_ROLES.map(role => (
              <div key={role}>
                <h3 className="mb-1 text-sm font-semibold">{role}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead className="text-left text-slate-500">
                      <tr><th className="p-1">Stage</th>{PERMS.map(p => <th key={p} className="p-1 text-center">{p}</th>)}</tr>
                    </thead>
                    <tbody>
                      {STAGE_ORDER.map(sid => (
                        <tr key={sid} className="border-t border-slate-100">
                          <td className="p-1 text-slate-700">{sid}</td>
                          {PERMS.map(perm => {
                            const on = rbac[role][sid].includes(perm);
                            return (
                              <td key={perm} className="p-1 text-center">
                                <button onClick={() => toggle(role, sid, perm)}
                                  className={`h-5 w-5 rounded ${on ? "bg-[var(--teal,#0d9488)] text-white" : "bg-slate-100 text-slate-400"}`}>
                                  {on ? "✓" : ""}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
          <h2 className="mb-2 font-semibold text-rose-900">Danger zone</h2>
          <button onClick={() => { if (confirm("Reset all programmes, notifications and trail?")) workflow.reset(); }}
            className="rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white">Reset workflow data</button>
        </div>
      </div>
    </div>
  );
}
