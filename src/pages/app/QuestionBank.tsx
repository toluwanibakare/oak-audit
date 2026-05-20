import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";
import { ISO_CLAUSES_FOR_AUDIT } from "@/data/processAudit";

const STDS = [{ k: "9001", label: "ISO 9001" }, { k: "14001", label: "ISO 14001" }, { k: "45001", label: "ISO 45001" }, { k: "27001", label: "ISO 27001" }];

export default function QuestionBank() {
  const { currentOrg } = useOrg();
  const { user } = useAuth();
  const { toast } = useToast();
  const [procs, setProcs] = useState<{ key: string; name: string }[]>([]);
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ standard: "9001", process_key: "", clause: "", kind: "specific", text: "", evidence: "", reference: "" });

  const load = async () => {
    if (!currentOrg) return;
    const { data: p } = await supabase.from("org_processes").select("key,name").eq("org_id", currentOrg.id).order("name");
    setProcs((p ?? []) as any);
    const { data } = await supabase.from("custom_questions").select("*").eq("org_id", currentOrg.id).order("created_at", { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => { load(); }, [currentOrg]);

  const add = async () => {
    if (!currentOrg || !user || !form.text.trim() || !form.process_key || !form.clause) {
      return toast({ title: "Fill standard, process, clause, and text", variant: "destructive" });
    }
    const { error } = await supabase.from("custom_questions").insert({ org_id: currentOrg.id, created_by: user.id, ...form });
    if (error) return toast({ title: error.message, variant: "destructive" });
    setForm({ ...form, text: "", evidence: "", reference: "" });
    load();
  };

  const toggle = async (id: string, active: boolean) => { await supabase.from("custom_questions").update({ active: !active }).eq("id", id); load(); };
  const remove = async (id: string) => { await supabase.from("custom_questions").delete().eq("id", id); load(); };

  return (
    <AppShell>
      <Header title="Custom question bank" subtitle="Extend the standard ISO question banks with your own organizational procedures." />
      <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-5 md:grid-cols-12">
        <select className="input md:col-span-2" value={form.standard} onChange={(e) => setForm({ ...form, standard: e.target.value })}>
          {STDS.map((s) => <option key={s.k} value={s.k}>{s.label}</option>)}
        </select>
        <select className="input md:col-span-3" value={form.process_key} onChange={(e) => setForm({ ...form, process_key: e.target.value })}>
          <option value="">Process…</option>
          {procs.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
        </select>
        <select className="input md:col-span-2" value={form.clause} onChange={(e) => setForm({ ...form, clause: e.target.value })}>
          <option value="">Clause…</option>
          {ISO_CLAUSES_FOR_AUDIT.map((c) => <option key={c.clause} value={c.clause}>{c.clause} {c.title}</option>)}
        </select>
        <input className="input md:col-span-4" placeholder="Question text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
        <button onClick={add} className="pill-cta md:col-span-1">Add</button>
        <input className="input md:col-span-6" placeholder="Expected evidence" value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })} />
        <input className="input md:col-span-6" placeholder="Reference SOP / procedure" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
      </div>

      <div className="mt-6 grid gap-2">
        {list.map((q) => (
          <div key={q.id} className={`rounded-xl border p-3 text-sm ${q.active ? "border-border bg-card" : "border-border bg-muted/40 opacity-70"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{q.standard} · {q.process_key} · clause {q.clause}</span>
                <p className="mt-1">{q.text}</p>
                {q.evidence && <p className="mt-1 text-xs text-muted-foreground">Evidence: {q.evidence}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggle(q.id, q.active)} className="rounded-full border border-border px-3 py-1 text-xs">{q.active ? "Disable" : "Enable"}</button>
                <button onClick={() => remove(q.id)} className="rounded-full border border-destructive px-3 py-1 text-xs text-destructive">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No custom questions yet.</div>}
      </div>
    </AppShell>
  );
}