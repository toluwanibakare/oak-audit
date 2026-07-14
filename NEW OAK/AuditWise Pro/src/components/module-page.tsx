import { AppShell } from "@/components/app-shell";
import { WCard, WPlaceholder, WBadge, Annotation, WBlock } from "@/components/wire";
import type { ReactNode } from "react";

type Col = { key: string; w?: string };

export function ModulePage({
  annotation, title, description, children, actions,
}: { annotation: string; title: string; description?: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <AppShell title={title} annotation={annotation} actions={actions}>
      {description && <p className="text-sm text-muted-foreground -mt-2 max-w-3xl">{description}</p>}
      {children}
    </AppShell>
  );
}

export function FilterBar({ filters }: { filters: string[] }) {
  return (
    <div className="wire-card rounded-lg p-3 flex flex-wrap items-center gap-2">
      <input placeholder="Search…" className="h-8 px-2 rounded-md border border-input bg-muted/30 text-xs min-w-[200px]" />
      {filters.map((f) => (
        <button key={f} className="h-8 px-3 rounded-md border border-border text-xs hover:bg-muted">{f} ▾</button>
      ))}
      <div className="ml-auto flex items-center gap-2">
        <WBadge tone="outline">Saved Views</WBadge>
        <button className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-medium">+ Create</button>
      </div>
    </div>
  );
}

export function WTable({ columns, rows }: { columns: Col[]; rows: (string | ReactNode)[][] }) {
  return (
    <div className="wire-card rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 border-b border-border">
            <tr className="text-left">
              {columns.map((c) => (
                <th key={c.key} className="py-2.5 px-3 annotation font-medium" style={{ width: c.w }}>{c.key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-dashed border-border hover:bg-muted/30">
                {row.map((cell, j) => (
                  <td key={j} className="py-2.5 px-3 align-middle">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20">
        <Annotation>{rows.length} of 247 rows · sample data</Annotation>
        <div className="flex gap-1">
          {["‹", "1", "2", "3", "…", "›"].map((p, i) => (
            <button key={i} className={`h-7 w-7 rounded text-xs ${p === "1" ? "bg-foreground text-background" : "border border-border"}`}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Kanban({ columns }: { columns: { title: string; count: number; cards: { title: string; meta: string; tag?: string }[] }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
      {columns.map((c) => (
        <div key={c.title} className="wire-card rounded-lg p-3 flex flex-col gap-2 min-h-[420px]">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold">{c.title}</div>
            <WBadge>{c.count}</WBadge>
          </div>
          <div className="space-y-2">
            {c.cards.map((card, i) => (
              <div key={i} className="rounded-md border border-border bg-card p-2.5 space-y-1.5">
                <div className="text-xs font-medium leading-snug">{card.title}</div>
                <Annotation>{card.meta}</Annotation>
                {card.tag && <WBadge tone="outline">{card.tag}</WBadge>}
              </div>
            ))}
            <button className="w-full h-8 rounded-md border border-dashed border-border text-[11px] text-muted-foreground hover:bg-muted">+ Add card</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export { WCard, WPlaceholder, WBadge, Annotation, WBlock };
