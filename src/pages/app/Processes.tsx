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
import { Plus, X } from "lucide-react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<Proc | null>(null);

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Header title="Processes" subtitle="Manage and define your organizational processes." />
        <div className="flex items-center gap-3">
          {!isIndividual && (
            <button onClick={seed} className="rounded-full border border-border bg-card px-4 py-2 text-sm transition hover:bg-secondary">
              Add 18 standard processes
            </button>
          )}
          <button onClick={() => setIsModalOpen(true)} className="pill-cta px-4 py-2 text-sm font-semibold flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Add Process
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elevated animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground">Add New Process</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Type in the name and scope of the process to add to your scope.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Process Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sales, Procurement, Maintenance..."
                  className="input w-full h-11"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Scope / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Managing supplier relations and purchasing operations..."
                  className="input w-full h-11"
                  value={form.scope}
                  onChange={(e) => setForm({ ...form, scope: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await add();
                    setIsModalOpen(false);
                  }}
                  disabled={!form.name.trim()}
                  className="pill-cta px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  Add Process
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {processToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-elevated animate-in zoom-in-95 duration-200">
            <h3 className="font-display text-lg font-semibold text-foreground">Remove Process</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Are you sure you want to remove the process <strong>{processToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setProcessToDelete(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary transition"
              >
                No, Keep
              </button>
              <button
                onClick={async () => {
                  await remove(processToDelete.id);
                  setProcessToDelete(null);
                }}
                className="rounded-xl bg-destructive text-destructive-foreground px-4 py-2 text-sm font-semibold hover:bg-destructive/90 transition"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {list.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">{p.name}</h3>
              <button onClick={() => setProcessToDelete(p)} className="text-xs text-destructive hover:underline">Remove</button>
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