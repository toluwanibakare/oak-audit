import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";

type Auditor = { id: string; name: string; email: string | null; role: string | null; certifications: string | null; user_id: string | null };

export default function Team() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [list, setList] = useState<Auditor[]>([]);
  const [form, setForm] = useState({ name: "", email: "", role: "auditor", certifications: "", password: "" });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!currentOrg) return;
    const { data } = await supabase.from("auditors").select("*").eq("org_id", currentOrg.id).order("created_at");
    setList((data ?? []) as Auditor[]);
  };
  useEffect(() => {
    load();
  }, [currentOrg]);

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

  const remove = async (id: string) => {
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

  return (
    <AppShell>
      <Header title="Audit team" subtitle="Manage your auditors and their roles." />
      <div className="mt-6 grid gap-4 rounded-[28px] border border-border bg-card p-5 md:grid-cols-6 items-center">
        <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="lead_auditor">Lead Auditor</option>
          <option value="auditor">Auditor</option>
          <option value="auditee">Auditee</option>
        </select>
        <input className="input" placeholder="Location" value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} />
        <button onClick={add} disabled={busy} className="pill-cta w-full">{busy ? "Creating..." : "Add auditor"}</button>
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-2 text-left">Name</th><th className="px-4 py-2 text-left">Email</th><th className="px-4 py-2 text-left">Role</th><th className="px-4 py-2 text-left">Location</th><th /></tr>
          </thead>
          <tbody>
            {list.map((auditor) => (
              <tr key={auditor.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{auditor.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{auditor.email}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{auditor.role}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{auditor.certifications}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => remove(auditor.id)} className="text-xs text-destructive hover:underline">Remove</button></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No auditors yet.</td></tr>}
          </tbody>
        </table>
      </div>
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
