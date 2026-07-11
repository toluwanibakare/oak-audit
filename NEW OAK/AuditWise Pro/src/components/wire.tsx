import type { ReactNode } from "react";

export function WCard({ title, hint, children, className = "", actions }: { title?: string; hint?: string; children?: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <div className={`wire-card rounded-lg p-4 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="min-w-0">
            {title && <div className="text-sm font-semibold truncate">{title}</div>}
            {hint && <div className="annotation mt-0.5">{hint}</div>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

export function WPlaceholder({ label, height = 160, className = "" }: { label?: string; height?: number; className?: string }) {
  return (
    <div className={`wire-box rounded-md grid place-items-center text-muted-foreground text-xs ${className}`} style={{ height }}>
      <span className="annotation">{label ?? "PLACEHOLDER"}</span>
    </div>
  );
}

export function WLine({ width = "100%" }: { width?: string | number }) {
  return <div className="h-2.5 rounded bg-muted" style={{ width }} />;
}

export function WBlock({ w = "100%", h = 10, className = "" }: { w?: string | number; h?: number; className?: string }) {
  return <div className={`rounded bg-muted ${className}`} style={{ width: w, height: h }} />;
}

export function WBadge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "strong" | "outline" }) {
  const cls = tone === "strong" ? "bg-foreground text-background"
    : tone === "outline" ? "border border-border"
    : "bg-muted text-foreground";
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${cls}`}>{children}</span>;
}

export function Annotation({ children }: { children: ReactNode }) {
  return <div className="annotation">{children}</div>;
}
