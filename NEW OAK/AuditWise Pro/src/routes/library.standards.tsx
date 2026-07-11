import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ModulePage, WCard, WBadge, Annotation } from "@/components/module-page";
import { auditStore, useAuditStore } from "@/lib/audit-store";
import { toast } from "sonner";
import { Plus, FileText, Download, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/library/standards")({
  head: () => ({ meta: [{ title: "ISO Standards — AuditOS" }, { name: "description", content: "Library of ISO standards and normative references." }] }),
  component: Page,
});

const SEED_ONCE_KEY = "auditos:seed:standards:v1";
const DEFAULTS = [
  { id: "STD-9001",  code: "ISO 9001:2015",       title: "Quality Management Systems — Requirements",     type: "Management System", edition: "2015", pages: 29, status: "Adopted" },
  { id: "STD-14001", code: "ISO 14001:2015",      title: "Environmental Management Systems — Requirements", type: "Management System", edition: "2015", pages: 35, status: "Adopted" },
  { id: "STD-45001", code: "ISO 45001:2018",      title: "Occupational H&S Management Systems",             type: "Management System", edition: "2018", pages: 41, status: "Adopted" },
  { id: "STD-27001", code: "ISO/IEC 27001:2022",  title: "Information Security Management Systems",         type: "Management System", edition: "2022", pages: 19, status: "Adopted" },
  { id: "STD-22301", code: "ISO 22301:2019",      title: "Business Continuity Management Systems",          type: "Management System", edition: "2019", pages: 33, status: "Adopted" },
  { id: "STD-19011", code: "ISO 19011:2018",      title: "Guidelines for Auditing Management Systems",      type: "Guideline",         edition: "2018", pages: 46, status: "Reference" },
];

function seedIfEmpty() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEED_ONCE_KEY)) return;
  const list = auditStore.list("standards");
  if (list.length === 0) DEFAULTS.forEach((d) => auditStore.create("standards", d, "STD"));
  localStorage.setItem(SEED_ONCE_KEY, "1");
}

function Page() {
  seedIfEmpty();
  const standards = useAuditStore((s) => Object.values(s.collections.standards ?? {}));
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtered = standards.filter((s: any) => (s.code + s.title).toLowerCase().includes(q.toLowerCase()));

  return (
    <ModulePage annotation="09 · LIBRARY" title="ISO Standards">
      <div className="wire-card rounded-lg p-3 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search standards…" className="h-8 px-2 rounded-md border border-input bg-muted/30 text-xs min-w-[220px]" />
        <WBadge tone="outline">{filtered.length} standards</WBadge>
        <div className="ml-auto">
          <button onClick={() => setOpen(true)} className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-medium inline-flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Create
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((s: any) => (
          <WCard key={s.id} title={s.code} hint={s.title} actions={<WBadge tone="strong">{s.status}</WBadge>}>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><Annotation>TYPE</Annotation><div>{s.type}</div></div>
              <div><Annotation>EDITION</Annotation><div>{s.edition}</div></div>
              <div><Annotation>PAGES</Annotation><div>{s.pages}</div></div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => toast.success(`Downloading ${s.code}.pdf`)} className="h-7 px-2 rounded border border-border text-[11px] inline-flex items-center gap-1 hover:bg-muted"><Download className="h-3 w-3" /> PDF</button>
              <button onClick={() => toast(`Opened ${s.code}`)} className="h-7 px-2 rounded border border-border text-[11px] inline-flex items-center gap-1 hover:bg-muted"><FileText className="h-3 w-3" /> View</button>
              <button onClick={() => auditStore.remove("standards", s.id)} className="ml-auto h-7 w-7 grid place-items-center rounded border border-border hover:bg-muted"><Trash2 className="h-3 w-3" /></button>
            </div>
          </WCard>
        ))}
      </div>

      {open && <CreateDialog onClose={() => setOpen(false)} />}
    </ModulePage>
  );
}

function CreateDialog({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState({ code: "", title: "", type: "Management System", edition: String(new Date().getFullYear()), pages: 20, status: "Adopted" });
  function save() {
    if (!f.code || !f.title) { toast.error("Code and title required"); return; }
    auditStore.create("standards", f, "STD");
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <div className="wire-card rounded-lg bg-background w-full max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Create ISO Standard</div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded border border-border"><X className="h-3.5 w-3.5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
          <Field label="Code*"><input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="ISO 50001:2018" className="input" /></Field>
          <Field label="Edition"><input value={f.edition} onChange={(e) => setF({ ...f, edition: e.target.value })} className="input" /></Field>
          <div className="col-span-2"><Field label="Title*"><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Energy Management Systems — Requirements" className="input" /></Field></div>
          <Field label="Type">
            <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className="input">
              {["Management System", "Guideline", "Technical Spec", "Regulation"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Pages"><input type="number" value={f.pages} onChange={(e) => setF({ ...f, pages: Number(e.target.value) })} className="input" /></Field>
          <Field label="Status">
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className="input">
              {["Adopted", "Under Review", "Reference", "Archived"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="h-8 px-3 rounded border border-border text-xs">Cancel</button>
          <button onClick={save} className="h-8 px-3 rounded bg-foreground text-background text-xs font-medium">Create standard</button>
        </div>
        <style>{`.input{width:100%;height:32px;padding:0 8px;border-radius:6px;border:1px solid hsl(var(--input));background:hsl(var(--muted)/0.3);font-size:12px}`}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1"><span className="annotation">{label}</span>{children}</label>;
}
