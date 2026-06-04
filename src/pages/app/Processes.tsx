import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";
import { seedStandardProcesses } from "@/lib/seedProcesses";
import { useToast } from "@/hooks/use-toast";
import { PROCESSES } from "@/data/processAudit";
import { PROCESSES_14001 } from "@/data/processAudit14001";
import { PROCESSES_45001 } from "@/data/processAudit45001";
import { HSE_PROCESSES } from "@/data/standardsHse";

const ALL_STANDARD_PROCESSES = [
  ...PROCESSES,
  ...PROCESSES_14001,
  ...PROCESSES_45001,
  ...HSE_PROCESSES,
];

const UNIQUE_STANDARD_PROCESSES = Array.from(
  new Map(ALL_STANDARD_PROCESSES.map((p) => [p.key, p])).values()
);

type Proc = { id: string; key: string; name: string; scope: string | null; is_custom: boolean };

export default function Processes() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [list, setList] = useState<Proc[]>([]);
  const [form, setForm] = useState({ name: "", scope: "" });
  const [selectedStdKey, setSelectedStdKey] = useState("");

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

  const addStandard = async () => {
    if (!currentOrg || !selectedStdKey) return;
    const proc = UNIQUE_STANDARD_PROCESSES.find((p) => p.key === selectedStdKey);
    if (!proc) return;
    const { error } = await supabase.from("org_processes").insert({
      org_id: currentOrg.id, key: proc.key, name: proc.name, scope: proc.scope, is_custom: false,
    });
    if (error) return toast({ title: error.message, variant: "destructive" });
    setSelectedStdKey("");
    load();
    toast({ title: `Process "${proc.name}" added successfully.` });
  };

  const remove = async (id: string) => { await supabase.from("org_processes").delete().eq("id", id); load(); };

  const isIndividual = currentOrg?.type === "individual";
  const existingKeys = new Set(list.map((p) => p.key));
  const availableStandardProcs = UNIQUE_STANDARD_PROCESSES.filter((p) => !existingKeys.has(p.key));

  return (
    <AppShell>
      <div className="flex items-end justify-between">
        <Header title="Processes" subtitle="Standard ISO processes plus your custom ones." />
        {!isIndividual && (
          <button onClick={seed} className="rounded-full border border-border bg-card px-4 py-2 text-sm">Add 18 standard processes</button>
        )}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Add Standard Process */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">Add Standard Process</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Select a standard process to add to your organization's scope.</p>
          </div>
          <div className="flex gap-2">
            <select
              className="input flex-1 h-11"
              value={selectedStdKey}
              onChange={(e) => setSelectedStdKey(e.target.value)}
            >
              <option value="">-- Select standard process --</option>
              {availableStandardProcs.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </select>
            <button onClick={addStandard} disabled={!selectedStdKey} className="pill-cta h-11 px-5 text-sm font-semibold flex items-center justify-center shrink-0 disabled:opacity-50">
              Add Process
            </button>
          </div>
        </div>

        {/* Add Custom Process */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">Add Custom Process</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Define a custom process specific to your business workflow.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input className="input flex-1 h-11" placeholder="Custom process name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input flex-1 h-11" placeholder="Scope" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} />
            <button onClick={add} disabled={!form.name.trim()} className="pill-cta h-11 px-5 text-sm font-semibold flex items-center justify-center shrink-0 disabled:opacity-50">
              Add Custom
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {list.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">{p.name}</h3>
              {p.is_custom && (
                <button onClick={() => remove(p.id)} className="text-xs text-destructive hover:underline">Remove</button>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{p.scope}</p>
            <span className="mt-3 inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider">
              {p.is_custom ? "Custom" : "Standard"} · {p.key}
            </span>
          </div>
        ))}
        {list.length === 0 && <div className="text-sm text-muted-foreground">No processes yet. Select a process from the list above or onboard standard ones.</div>}
      </div>
    </AppShell>
  );
}