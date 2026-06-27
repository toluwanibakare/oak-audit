import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { X, Pencil, Trash2 } from "lucide-react";

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

    // Check if the current logged-in user is already in the auditors directory
    if (user) {
      const { data: existing } = await supabase
        .from("auditors")
        .select("id")
        .eq("org_id", currentOrg.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existing) {
        const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin/Organization";
        await supabase.from("auditors").insert({
          org_id: currentOrg.id,
          name: fullName,
          email: user.email || "",
          role: "lead_auditor",
          user_id: user.id
        });
      }
    }

    const { data } = await supabase.from("auditors").select("*").eq("org_id", currentOrg.id).order("created_at");
    setList((data ?? []) as Auditor[]);
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
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://retlzhncvxiicmgmdgtk.supabase.co";
      const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJldGx6aG5jdnhpaWNtZ21kZ3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MjEyMTMsImV4cCI6MjA5NTA5NzIxM30.5VM0sUHMiZ_Q2cBMt8yW5qpEj1uVNQu2z73286eLCMg";

      const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password.trim(),
          data: {
            full_name: form.name.trim(),
            account_type: "auditor",
            org_id: currentOrg.id,
          }
        })
      });

      const signupData = await signupRes.json();
      if (!signupRes.ok) {
        throw new Error(signupData.message ?? "Could not register auditor account.");
      }

      const userUuid = signupData.id || signupData.user?.id;
      if (!userUuid) {
        throw new Error("Failed to retrieve user identifier.");
      }

      // Add auditor to organization members and assign roles
      const { error: memberError } = await supabase.from("organization_members").insert({
        org_id: currentOrg.id,
        user_id: userUuid,
        status: "active",
      });
      if (memberError) throw memberError;

      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userUuid,
        org_id: currentOrg.id,
        role: form.role,
      });
      if (roleError) throw roleError;

      const { error } = await supabase.from("auditors").insert({
        org_id: currentOrg.id,
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        certifications: form.certifications.trim() || null,
        user_id: userUuid,
      });

      if (error) throw error;

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

    // Fetch user_id first to clean up workspace access
    const { data: auditorData } = await supabase
      .from("auditors")
      .select("user_id")
      .eq("id", id)
      .maybeSingle();

    if (auditorData?.user_id && currentOrg) {
      await supabase.from("user_roles").delete().eq("user_id", auditorData.user_id).eq("org_id", currentOrg.id);
      await supabase.from("organization_members").delete().eq("user_id", auditorData.user_id).eq("org_id", currentOrg.id);
    }

    await supabase.from("auditors").delete().eq("id", id);
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

    const { error } = await supabase
      .from("auditors")
      .update({
        name: editForm.name.trim(),
        role: editForm.role,
        certifications: editForm.certifications.trim() || null,
      })
      .eq("id", editingAuditor.id);

    if (error) {
      return toast({ title: "Failed to update auditor", description: error.message, variant: "destructive" });
    }

    if (editingAuditor.user_id && currentOrg) {
      await supabase
        .from("user_roles")
        .update({ role: editForm.role })
        .eq("user_id", editingAuditor.user_id)
        .eq("org_id", currentOrg.id);
    }

    toast({ title: "Auditor updated successfully." });
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
      <Header title="Audit team" subtitle="Manage your auditors and their roles." />
      <div className="mt-6 grid gap-4 rounded-[28px] border border-border bg-card p-5 md:grid-cols-6 items-center">
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

      <div className="mt-6 overflow-hidden rounded-[28px] border border-border bg-card shadow-card">
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
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-elevated space-y-4 animate-scale-in font-sans">
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

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                onClick={() => setEditingAuditor(null)}
                className="pill-secondary"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="pill-cta"
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

export const Header = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="page-hero">
    <span className="eyebrow-chip">Workspace page</span>
    <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">{title}</h1>
    {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
  </div>
);
