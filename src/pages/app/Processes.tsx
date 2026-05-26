import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";
import { seedStandardProcesses } from "@/lib/seedProcesses";
import { useToast } from "@/hooks/use-toast";

type Proc = { id: string; key: string; name: string; scope: string | null; is_custom: boolean };

export default function Processes() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [list, setList] = useState<Proc[]>([]);
  const [form, setForm] = useState({ name: "", scope: "" });

  const load = async () => {
    if (!currentOrg) return;
    const { data } = await supabase.from("org_processes").select("*").eq("org_id", currentOrg.id).order("is_custom").order("name");
    setList((data ?? []) as Proc[]);
  };
  useEffect(() => { load(); }, [currentOrg]);

  const seed = async () => {
    if (!currentOrg) return;
    await seedStandardProcesses(currentOrg.id);
    toast({ title: "Standard processes added" });
    load();
  };

  const add = async () => {
    if (!currentOrg || !form.name.trim()) return;
    const key = "custom_" + form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40);
    const { error } = await supabase.from("org_processes").insert({
      org_id: currentOrg.id, key, name: form.name, scope: form.scope, is_custom: true,
    });
    if (error) return toast({ title: error.message, variant: "destructive" });
    setForm({ name: "", scope: "" });
    load();
  };

  const remove = async (id: string) => { await supabase.from("org_processes").delete().eq("id", id); load(); };

  const isIndividual = currentOrg?.type === "individual";

  return (
    <AppShell>
      <div className="flex items-end justify-between">
        <Header title="Processes" subtitle="Standard ISO processes plus your custom ones." />
        {!isIndividual && (
          <button onClick={seed} className="rounded-full border border-border bg-card px-4 py-2 text-sm">Add 18 standard processes</button>
        )}
      </div>

      {!isIndividual && (
        <div className="mt-6 grid gap-3 rounded-2xl border border-dashed border-border bg-card p-5 md:grid-cols-3">
          <input className="input md:col-span-1" placeholder="Custom process name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input md:col-span-1" placeholder="Scope" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} />
          <button onClick={add} className="pill-cta md:col-span-1">Add custom process</button>
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {list.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">{p.name}</h3>
              {p.is_custom && !isIndividual && (
                <button onClick={() => remove(p.id)} className="text-xs text-destructive hover:underline">Remove</button>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{p.scope}</p>
            <span className="mt-3 inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider">
              {p.is_custom ? "Custom" : "Standard"} · {p.key}
            </span>
          </div>
        ))}
        {list.length === 0 && <div className="text-sm text-muted-foreground">No processes yet — click "Add 18 standard processes" to begin.</div>}
      </div>
    </AppShell>
  );
}