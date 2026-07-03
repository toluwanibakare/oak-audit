import { useEffect, useState, type ReactNode } from "react";
import { useOrg } from "@/hooks/useOrg";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { X, Pencil, Trash2 } from "lucide-react";
import { auditorsApi } from "@/api/auditors";
import { orgsApi } from "@/api/orgs";
import { notificationsApi } from "@/api/notifications";

type Auditor = { id: string; name: string; email: string | null; role: string | null; certifications: string | null; user_id: string | null };

export default function Team() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const { user } = useAuth();
  const [list, setList] = useState<Auditor[]>([]);
  const [form, setForm] = useState({ name: "", email: "", role: "auditor", certifications: "", password: "" });
  const [busy, setBusy] = useState(false);

  // Edit State
  const [editingAuditor, setEditingAuditor] = useState<Auditor | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "auditor", certifications: "" });

  const load = async () => {
    if (!currentOrg) return;

    try {
      // Check if the current logged-in user is already in the auditors directory
      if (user) {
        const existing = await auditorsApi.list(currentOrg.id);
        const found = existing.find((a: any) => a.user_id === user.id);

        if (!found) {
          const fullName = (user as any).full_name || user.email?.split("@")[0] || "Admin/Organization";
          await auditorsApi.create(currentOrg.id, {
            name: fullName,
            email: user.email || "",
            role: "lead_auditor",
            user_id: user.id
          });
        }
      }

      const data = await auditorsApi.list(currentOrg.id);
      setList(data as Auditor[]);
    } catch (err) {
      console.error("Failed to load auditors", err);
    }
  };

  useEffect(() => {
    load();
  }, [currentOrg, user]);

  const add = async () => {
    if (!currentOrg || !form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return toast({ title: "Name, email, and password are required to create an auditor account", variant: "destructive" });
    }
    if (form.password.length < 8) {
      return toast({ title: "Password must be at least 8 characters long", variant: "destructive" });
    }

    setBusy(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";

      // Register the user via Laravel auth
      const signupRes = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.name.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
          password_confirmation: form.password.trim(),
          account_type: "auditor",
        })
      });

      const signupData = await signupRes.json();
      if (!signupRes.ok) throw new Error(signupData.errors?.email?.[0] || signupData.errors?.full_name?.[0] || signupData.message || "Could not register auditor account.");

      const userUuid = signupData.user?.id || signupData.id;
      if (!userUuid) throw new Error("Failed to retrieve user identifier.");

      // Add auditor to organization members
      await orgsApi.addMember(currentOrg.id, { user_id: userUuid, status: "active" });

      // Create auditor record
      await auditorsApi.create(currentOrg.id, {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        certifications: form.certifications.trim() || null,
        user_id: userUuid,
      });

      // Send welcome email
      const websiteUrl = window.location.origin;
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #6366f1;">Welcome to Oak Audit Portal</h2>
          <p>Hello ${form.name.trim()},</p>
          <p>An auditor account has been created for you under <strong>${currentOrg.name}</strong>.</p>
          <p>Please use the credentials below to log in and start performing audits:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 4px 0;"><strong>Login Email:</strong> ${form.email.trim()}</p>
            <p style="margin: 4px 0;"><strong>Temporary Password:</strong> ${form.password.trim()}</p>
            <p style="margin: 4px 0;"><strong>Portal URL:</strong> <a href="${websiteUrl}">${websiteUrl}</a></p>
          </div>
          <p>Ensure you change your password after logging in for security.</p>
          <p>Regards,<br>Oak Audit Team</p>
        </div>
      `;
      try {
        await notificationsApi.sendEmail(form.email.trim(), "Your Oak Audit Auditor Credentials", emailHtml);
      } catch (emailErr) {
        console.error("Welcome email failed to dispatch:", emailErr);
      }

      setForm({ name: "", email: "", role: "auditor", certifications: "", password: "" });
      toast({ title: "Auditor Account Created", description: `Unique credentials for ${form.name} successfully registered.` });
      load();
    } catch (err: any) {
      let msg = err.message ?? "Try again";
      if (msg.toLowerCase().includes("foreign key") || msg.includes("organization_members_user_id_fkey") || msg.includes("user_roles_user_id_fkey")) {
        msg = "This email address is already registered in the system. Please use a different email.";
      }
      toast({ title: "Failed to create auditor", description: msg, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string, role: string | null) => {
    if (role === "management_representative") {
      toast({
        title: "Action Restricted",
        description: "You cannot remove the Management Representative from the team. You can only edit their profile.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm("Are you sure you want to remove this team member?");
    if (!confirmed) return;

    try {
      const existingList = await auditorsApi.list(currentOrg!.id);
      const auditorData = existingList.find((a: any) => a.id === id);

      if (auditorData?.user_id && currentOrg) {
        await orgsApi.removeMember(currentOrg.id, auditorData.user_id);
      }

      await auditorsApi.remove(currentOrg!.id, id);
    } catch (err) {
      console.error("Failed to remove auditor", err);
    }
    load();
  };

  const startEdit = (auditor: Auditor) => {
    setEditingAuditor(auditor);
    setEditForm({
      name: auditor.name,
      role: auditor.role || "auditor",
      certifications: auditor.certifications || "",
    });
  };

  const saveEdit = async () => {
    if (!editingAuditor) return;
    if (!editForm.name.trim()) {
      return toast({ title: "Name is required", variant: "destructive" });
    }

    try {
      await auditorsApi.update(currentOrg.id, editingAuditor.id, {
        name: editForm.name.trim(),
        role: editForm.role,
        certifications: editForm.certifications.trim() || null,
      });
      toast({ title: "Auditor updated successfully." });
    } catch (err: any) {
      return toast({ title: "Failed to update auditor", description: err?.message || "Error", variant: "destructive" });
    }
    setEditingAuditor(null);
    load();
  };

  const formatRole = (role: string | null) => {
    if (role === "management_representative") return "Management Representative";
    if (role === "lead_auditor") return "Lead Auditor";
    if (role === "auditor") return "Auditor";
    if (role === "auditee") return "Auditee";
    return role || "-";
  };

  return (
    <AppShell>
      <Header title="Audit Team" subtitle="Manage your auditors and their roles." />
      <div className="mt-6 grid gap-3 rounded-[28px] border border-border bg-card p-4 sm:p-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-6 items-center">
        <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="auditor">Auditor</option>
          <option value="management_representative">Management Representative</option>
        </select>
        <input className="input" placeholder="Location" value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} />
        <button onClick={add} disabled={busy} className="pill-cta w-full">{busy ? "Creating..." : "Add auditor"}</button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-[28px] border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((auditor) => (
              <tr key={auditor.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{auditor.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{auditor.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    auditor.role === "management_representative" 
                      ? "bg-purple-600/10 text-purple-500 border border-purple-500/20"
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {formatRole(auditor.role)}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{auditor.certifications || "-"}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button 
                    onClick={() => startEdit(auditor)} 
                    className="inline-flex items-center text-muted-foreground hover:text-primary transition"
                    title="Edit Member"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {auditor.role !== "management_representative" && (
                    <button 
                      onClick={() => remove(auditor.id, auditor.role)} 
                      className="inline-flex items-center text-muted-foreground hover:text-destructive transition"
                      title="Remove Member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No auditors yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Edit Auditor Modal */}
      {editingAuditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-elevated space-y-4 animate-scale-in font-sans">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-bold text-foreground">
                Edit Team Member
              </h3>
              <button
                onClick={() => setEditingAuditor(null)}
                className="rounded-lg p-1.5 hover:bg-secondary text-muted-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="input w-full"
                >
                  <option value="auditor">Auditor</option>
                  <option value="management_representative">Management Representative</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Location</label>
                <input
                  type="text"
                  value={editForm.certifications}
                  onChange={(e) => setEditForm({ ...editForm, certifications: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t border-border">
              <button
                onClick={() => setEditingAuditor(null)}
                className="pill-secondary justify-center"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="pill-cta justify-center"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export const Header = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <div className="page-hero flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <span className="eyebrow-chip">Workspace page</span>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0 flex items-center">{action}</div>}
  </div>
);
