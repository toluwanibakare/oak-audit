import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";

type Auditor = { id: string; name: string; email: string | null; role: string | null; certifications: string | null };

export default function Team() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [list, setList] = useState<Auditor[]>([]);
  const [form, setForm] = useState({ name: "", email: "", role: "auditor", certifications: "" });

  const load = async () => {
    if (!currentOrg) return;
    const { data } = await supabase.from("auditors").select("*").eq("org_id", currentOrg.id).order("created_at");
    setList((data ?? []) as Auditor[]);
  };
  useEffect(() => {
    load();
  }, [currentOrg]);

  const add = async () => {
    if (!currentOrg || !form.name.trim()) return;
    const { error } = await supabase.from("auditors").insert({ org_id: currentOrg.id, ...form });
    if (error) return toast({ title: error.message, variant: "destructive" });
    setForm({ name: "", email: "", role: "auditor", certifications: "" });
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("auditors").delete().eq("id", id);
    load();
  };

  return (
    <AppShell>
      <Header title="Audit team" subtitle="Manage your auditors and their roles." />
      <div className="mt-6 grid gap-4 rounded-[28px] border border-border bg-card p-5 md:grid-cols-5">
        <input className="input md:col-span-1" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input md:col-span-1" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <select className="input md:col-span-1" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="lead_auditor">Lead Auditor</option>
          <option value="auditor">Auditor</option>
          <option value="auditee">Auditee</option>
        </select>
        <input className="input md:col-span-1" placeholder="Certifications" value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} />
        <button onClick={add} className="pill-cta md:col-span-1">Add auditor</button>
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-2 text-left">Name</th><th className="px-4 py-2 text-left">Email</th><th className="px-4 py-2 text-left">Role</th><th className="px-4 py-2 text-left">Certifications</th><th /></tr>
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
