import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { WCard, WBadge, Annotation } from "@/components/wire";
import { TrendingUp, TrendingDown, ArrowUpRight, Calendar, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Dashboard — OakAudix" },
      { name: "description", content: "Enterprise ISO audit, risk and compliance dashboard." },
    ],
  }),
  component: Dashboard,
});

const KPIS = [
  { label: "Total Audits", value: "128", delta: "+12%", up: true },
  { label: "Completed Audits", value: "94", delta: "+8%", up: true },
  { label: "Open Findings", value: "47", delta: "−5%", up: false },
  { label: "Overdue Actions", value: "12", delta: "+3", up: true },
  { label: "High Risks", value: "9", delta: "−2", up: false },
  { label: "Compliance Score", value: "92%", delta: "+1.4%", up: true },
  { label: "Audit Effectiveness", value: "87%", delta: "+2.1%", up: true },
  { label: "Closure Rate", value: "78%", delta: "+4%", up: true },
];

const UPCOMING = [
  ["AUD-2026-041", "ISO 9001 — Production Line A", "Operations", "Jul 02", "M. Chen", "Scheduled"],
  ["AUD-2026-042", "ISO 27001 — Data Center", "IT & Security", "Jul 05", "R. Patel", "Planning"],
  ["AUD-2026-043", "ISO 45001 — Warehouse 3", "HSE", "Jul 09", "J. Auditor", "Scheduled"],
  ["AUD-2026-044", "ISO 14001 — Site Survey", "Sustainability", "Jul 14", "L. Okafor", "Draft Plan"],
  ["AUD-2026-045", "ISO 22301 — BCM Exercise", "Risk", "Jul 18", "S. Müller", "Scheduled"],
];

const ACTIVITY = [
  { icon: FileText, t: "Audit AUD-2026-038 marked as Completed", who: "M. Chen", when: "12m ago" },
  { icon: AlertTriangle, t: "Major NC raised on Clause 8.5.1 — Process Control", who: "R. Patel", when: "1h ago" },
  { icon: CheckCircle2, t: "Corrective action CA-1184 closed and verified", who: "J. Auditor", when: "3h ago" },
  { icon: TrendingUp, t: "Risk R-072 re-assessed: Likelihood ↑ Impact →", who: "L. Okafor", when: "5h ago" },
  { icon: FileText, t: "Evidence pack uploaded for AUD-2026-040 (14 files)", who: "S. Müller", when: "Yesterday" },
];

function Dashboard() {
  return (
    <AppShell title="Compliance & Audit Dashboard" annotation="01 · DASHBOARD">
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {KPIS.map((k) => (
          <div key={k.label} className="wire-card rounded-lg p-3">
            <Annotation>{k.label}</Annotation>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <div className="text-2xl font-semibold tracking-tight">{k.value}</div>
              <div className={`text-[11px] inline-flex items-center gap-0.5 ${k.up ? "text-foreground" : "text-muted-foreground"}`}>
                {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {k.delta}
              </div>
            </div>
            <div className="mt-2 h-1 rounded bg-muted overflow-hidden">
              <div className="h-full bg-foreground/70" style={{ width: `${40 + (k.label.length % 5) * 10}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        <WCard className="col-span-12 xl:col-span-8" title="Audit Performance — Conducted vs Completed" hint="Trailing 12 months · monthly"
          actions={<div className="flex gap-1"><WBadge>YTD</WBadge><WBadge tone="outline">Q</WBadge><WBadge tone="outline">M</WBadge></div>}>
          <LineChart />
          <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-foreground" />Conducted</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-foreground/40" />Completed</span>
            <span className="ml-auto annotation">Δ +14% vs prior period</span>
          </div>
        </WCard>

        <WCard className="col-span-12 md:col-span-6 xl:col-span-4" title="Findings by Severity" hint="Current open findings">
          <PieChart />
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            {[["Major", "9"], ["Minor", "21"], ["Observation", "12"], ["OFI", "5"]].map(([l, v]) => (
              <div key={l} className="flex items-center justify-between border-b border-dashed border-border py-1">
                <span className="text-muted-foreground">{l}</span><span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </WCard>

        <WCard className="col-span-12 xl:col-span-7" title="Findings by Department" hint="Top 8 departments">
          <BarChart />
        </WCard>

        <WCard className="col-span-12 xl:col-span-5" title="Organizational Risk Heat Map" hint="Likelihood × Impact (5×5)">
          <HeatMap />
        </WCard>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <WCard className="col-span-12 xl:col-span-7" title="Upcoming Audits" hint="Next 30 days"
          actions={<button className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">View calendar <ArrowUpRight className="h-3 w-3" /></button>}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr className="text-left border-b border-border">
                  {["Audit ID", "Audit Name", "Department", "Date", "Lead Auditor", "Status"].map((h) => (
                    <th key={h} className="py-2 pr-3 font-medium annotation">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {UPCOMING.map((row, i) => (
                  <tr key={i} className="border-b border-dashed border-border hover:bg-muted/40">
                    <td className="py-2.5 pr-3 font-mono text-[11px]">{row[0]}</td>
                    <td className="py-2.5 pr-3">{row[1]}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{row[2]}</td>
                    <td className="py-2.5 pr-3"><span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3 text-muted-foreground" />{row[3]}</span></td>
                    <td className="py-2.5 pr-3">{row[4]}</td>
                    <td className="py-2.5 pr-3"><WBadge tone={i === 0 ? "strong" : "outline"}>{row[5]}</WBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WCard>

        <WCard className="col-span-12 xl:col-span-5" title="Recent Activity" hint="Live · all modules">
          <ul className="space-y-3">
            {ACTIVITY.map((a, i) => {
              const Icon = a.icon;
              return (
                <li key={i} className="flex gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-md border border-border grid place-items-center bg-muted/40">
                    <Icon className="h-4 w-4 text-ink-soft" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs">{a.t}</div>
                    <div className="annotation mt-0.5">{a.who} · {a.when}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </WCard>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <WCard className="col-span-12 md:col-span-4" title="Compliance Score by Standard">
          {["ISO 9001", "ISO 14001", "ISO 45001", "ISO 27001", "ISO 22301"].map((s, i) => {
            const v = [94, 88, 91, 86, 79][i];
            return (
              <div key={s} className="py-1.5">
                <div className="flex justify-between text-xs"><span>{s}</span><span className="font-medium">{v}%</span></div>
                <div className="h-1.5 rounded bg-muted mt-1 overflow-hidden">
                  <div className="h-full bg-foreground/70" style={{ width: `${v}%` }} />
                </div>
              </div>
            );
          })}
        </WCard>

        <WCard className="col-span-12 md:col-span-4" title="Top Findings (Clauses)">
          <ol className="text-xs space-y-2">
            {[
              ["8.5.1", "Control of production & service provision", 14],
              ["7.5.3", "Control of documented information", 11],
              ["9.2",   "Internal audit programme gaps", 9],
              ["6.1",   "Risks & opportunities not addressed", 7],
              ["10.2",  "Nonconformity & corrective action", 6],
            ].map(([c, t, n]) => (
              <li key={c as string} className="flex items-center gap-3">
                <span className="font-mono text-[11px] w-10 text-muted-foreground">{c}</span>
                <span className="flex-1 truncate">{t}</span>
                <WBadge>{n} ×</WBadge>
              </li>
            ))}
          </ol>
        </WCard>

        <WCard className="col-span-12 md:col-span-4" title="AI Audit Assistant" hint="Beta · context-aware"
          actions={<WBadge tone="strong">AI</WBadge>}>
          <div className="space-y-2 text-xs">
            <div className="rounded-md border border-border p-2 bg-muted/40">
              <div className="annotation mb-1">SUGGESTION</div>
              "3 overdue corrective actions in <b>HSE</b> may impact ISO 45001 surveillance. Want me to draft escalation memos?"
            </div>
            <div className="rounded-md border border-dashed border-border p-2">
              <div className="annotation mb-1">ROOT CAUSE</div>
              Cluster of NCs around Clause 8.5.1 suggests training gap in Line A operators (5-Why drafted).
            </div>
            <div className="flex gap-2 pt-1">
              <input className="flex-1 h-8 px-2 rounded-md border border-input bg-muted/30 text-xs outline-none" placeholder="Ask the AI auditor…" />
              <button className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-medium">Send</button>
            </div>
          </div>
        </WCard>
      </div>

      <div className="annotation pt-2">↳ ANNOTATION · All charts are placeholder. Connect data source in Settings → Integrations.</div>
    </AppShell>
  );
}

function LineChart() {
  const W = 720, H = 220, P = 28;
  const pts1 = [40, 55, 48, 62, 70, 65, 78, 82, 75, 88, 92, 96];
  const pts2 = [30, 42, 40, 50, 55, 60, 65, 70, 68, 78, 82, 86];
  const path = (arr: number[]) => arr.map((v, i) => {
    const x = P + (i * (W - 2 * P)) / (arr.length - 1);
    const y = H - P - (v / 100) * (H - 2 * P);
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[220px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={P} x2={W - P} y1={P + i * ((H - 2 * P) / 4)} y2={P + i * ((H - 2 * P) / 4)} stroke="var(--wire)" strokeDasharray="3 4" />
      ))}
      {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m, i) => (
        <text key={i} x={P + (i * (W - 2 * P)) / 11} y={H - 8} fontSize="10" fill="var(--annotation)" textAnchor="middle">{m}</text>
      ))}
      <path d={path(pts2)} fill="none" stroke="var(--ink-soft)" strokeWidth="2" strokeDasharray="4 4" />
      <path d={path(pts1)} fill="none" stroke="var(--ink)" strokeWidth="2.25" />
    </svg>
  );
}

function BarChart() {
  const data = [
    ["Operations", 18], ["HSE", 14], ["IT", 11], ["Quality", 9],
    ["Logistics", 7], ["HR", 5], ["Finance", 4], ["R&D", 3],
  ] as const;
  const max = 20;
  return (
    <div className="h-[220px] flex items-end gap-3 px-1">
      {data.map(([l, v]) => (
        <div key={l} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <div className="w-full bg-foreground/80 rounded-t" style={{ height: `${(v / max) * 170}px` }} />
          <div className="annotation truncate w-full text-center">{l}</div>
          <div className="text-[10px] text-muted-foreground">{v}</div>
        </div>
      ))}
    </div>
  );
}

function PieChart() {
  const segs = [
    { v: 9, c: "var(--ink)" },
    { v: 21, c: "var(--ink-soft)" },
    { v: 12, c: "var(--wire-strong)" },
    { v: 5, c: "var(--wire)" },
  ];
  const total = segs.reduce((a, b) => a + b.v, 0);
  let acc = 0;
  const R = 70, C = 90, SW = 24;
  return (
    <svg viewBox="0 0 180 180" className="w-full h-[180px]">
      <circle cx={C} cy={C} r={R} fill="none" stroke="var(--muted)" strokeWidth={SW} />
      {segs.map((s, i) => {
        const frac = s.v / total;
        const len = 2 * Math.PI * R;
        const dash = `${frac * len} ${len}`;
        const off = -acc * len;
        acc += frac;
        return (
          <circle key={i} cx={C} cy={C} r={R} fill="none"
            stroke={s.c} strokeWidth={SW}
            strokeDasharray={dash} strokeDashoffset={off}
            transform={`rotate(-90 ${C} ${C})`} />
        );
      })}
      <text x={C} y={C - 2} fontSize="20" fontWeight="600" textAnchor="middle" fill="var(--ink)">47</text>
      <text x={C} y={C + 14} fontSize="9" textAnchor="middle" fill="var(--annotation)">OPEN FINDINGS</text>
    </svg>
  );
}

function HeatMap() {
  const grid = [
    [1,2,2,3,4],
    [1,2,3,4,4],
    [2,3,3,4,5],
    [2,3,4,5,5],
    [3,4,5,5,5],
  ];
  const tone = (n: number) => `oklch(${0.96 - n * 0.13} 0 0)`;
  return (
    <div>
      <div className="flex">
        <div className="w-6" />
        <div className="grid grid-cols-5 gap-1 flex-1">
          {grid.map((row, ri) => row.map((v, ci) => (
            <div key={`${ri}-${ci}`} className="aspect-square rounded border border-border grid place-items-center text-[11px] font-medium"
              style={{ background: tone(v), color: v >= 4 ? "var(--background)" : "var(--ink)" }}>
              {v * 2 + ((ri + ci) % 4)}
            </div>
          )))}
        </div>
      </div>
      <div className="flex mt-1">
        <div className="w-6" />
        <div className="grid grid-cols-5 gap-1 flex-1 annotation text-center">
          {["1","2","3","4","5"].map((l) => <div key={l}>{l}</div>)}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 annotation">
        <span>← LIKELIHOOD →</span>
        <span>IMPACT ↑</span>
      </div>
    </div>
  );
}
