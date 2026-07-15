import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { WCard, WBadge, Annotation } from "@/components/wire";
import {
  TrendingUp, TrendingDown, ArrowUpRight, FileText,
  AlertTriangle, CheckCircle2, X, Settings, Bot, RefreshCw, Building2,
} from "lucide-react";
import { requireAuth } from "@/lib/require-auth";
import { useAuth } from "@/hooks/use-auth";
import { orgsApi } from "@/lib/api/orgs";
import { dashboardApi, DashboardData, ActivityItem } from "@/lib/api/dashboard";

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

const SEVERITY_COLORS: Record<string, string> = {
  Major: "#f43f5e",
  Minor: "#f59e0b",
  Observation: "#0ea5e9",
  OFI: "#10b981",
};

const BAR_COLORS = [
  "linear-gradient(0deg, #0d9488, var(--teal))",
  "linear-gradient(0deg, #059669, #34d399)",
  "linear-gradient(0deg, #7c3aed, #a855f7)",
  "linear-gradient(0deg, #0284c7, #38bdf8)",
  "linear-gradient(0deg, #dc2626, #f87171)",
  "linear-gradient(0deg, #d97706, #fbbf24)",
  "linear-gradient(0deg, #4f46e5, #818cf8)",
  "linear-gradient(0deg, #0d9488, #5eead4)",
];

const COMPLIANCE_COLORS = [
  "linear-gradient(90deg, #0d9488, var(--teal))",
  "linear-gradient(90deg, #059669, #34d399)",
  "linear-gradient(90deg, #7c3aed, #a855f7)",
  "linear-gradient(90deg, #0284c7, #38bdf8)",
  "linear-gradient(90deg, #dc2626, #f87171)",
];

const ACTIVITY_ICONS = [FileText, AlertTriangle, CheckCircle2, TrendingUp, FileText] as const;

function Counter({ value }: { value: string }) {
  const [display, setDisplay] = useState("0");
  const num = parseInt(value.replace(/\D/g, "")) || 0;
  useEffect(() => {
    if (num === 0) { setDisplay(value); return; }
    let start = 0;
    const dur = 800;
    const step = Math.ceil(num / (dur / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start + (value.includes("%") ? "%" : ""));
    }, 16);
    return () => clearInterval(timer);
  }, [value, num]);
  return <>{display}</>;
}

function useScrollReveal() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" },
    );
    const els = document.querySelectorAll("[data-scroll], [data-scroll-stagger]");
    els.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);
}

function Dashboard() {
  const { user } = useAuth();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noOrg, setNoOrg] = useState(false);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [period, setPeriod] = useState<"ytd" | "q" | "m">("ytd");

  useScrollReveal();

  const grad = (label: string) => {
    const palette = [
      "linear-gradient(90deg, #0d9488, var(--teal))",
      "linear-gradient(90deg, #059669, #34d399)",
      "linear-gradient(90deg, #f59e0b, #fb923c)",
      "linear-gradient(90deg, #f43f5e, #f472b6)",
      "linear-gradient(90deg, #8b5cf6, #a855f7)",
      "linear-gradient(90deg, var(--teal), #34d399)",
      "linear-gradient(90deg, #0ea5e9, #06b6d4)",
      "linear-gradient(90deg, #6366f1, #3b82f6)",
    ];
    return palette[label.length % palette.length];
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setNoOrg(false);
    try {
      const orgs = await orgsApi.list();
      if (orgs.length === 0) {
        setNoOrg(true);
        setLoading(false);
        return;
      }
      const org = orgs[0];
      setActiveOrgId(org.id);
      const dashData = await dashboardApi.get(org.id);
      setData(dashData);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to load dashboard data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setTimeout(() => setRevealed(true), 100);
  }, []);

  const chartData = data?.chartData?.ytd ? {
    ytd: data.chartData.ytd,
    q: { conducted: [0,0,0,0], completed: [0,0,0,0], labels: ["Q1","Q2","Q3","Q4"] },
    m: { conducted: data.chartData.ytd.conducted.slice(-6), completed: data.chartData.ytd.completed.slice(-6), labels: ["Jul","Aug","Sep","Oct","Nov","Dec"] },
  } : null;

  const severityTotal = data?.findingsBySeverity?.reduce((a, b) => a + b.value, 0) || 0;

  return (
    <AppShell title="Compliance & Audit Dashboard">
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-3 animate-pulse">
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="mt-3 h-6 w-20 bg-muted rounded" />
              <div className="mt-2 h-1.5 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      )}
      {noOrg && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold mb-2">No Organization Found</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Create an organization to start managing audits, compliance, and risk on OakAudix.
          </p>
          <Link to="/settings" className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
            <Settings className="h-4 w-4" /> Go to Settings
          </Link>
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Unable to Load Dashboard</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">{error}</p>
          <button onClick={loadData} className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2 text-sm font-medium hover:bg-muted transition-colors cursor-pointer">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      )}
      {!loading && !noOrg && !error && !data && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-lg font-semibold mb-2 text-foreground">No Records Yet</h2>
          <p className="text-sm text-muted-foreground max-w-md">Start by creating an audit or opening a finding. Your dashboard will populate with data once records exist.</p>
        </div>
      )}
      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {(data?.kpis ?? []).map((k, i) => {
              const num = parseFloat(k.value) || 0;
              const isPct = k.value.includes('%');
              const barWidth = (l: string, v: number) => {
                if (v === 0) return 0;
                if (isPct) return Math.min(v, 100);
                const lab = l.toLowerCase();
                if (lab.includes('audit') || lab.includes('complete')) return Math.min(v / 50 * 100, 100);
                if (lab.includes('finding') || lab.includes('open') || lab.includes('nc') || lab.includes('nonconform')) return Math.min(v / 100 * 100, 100);
                if (lab.includes('risk')) return Math.min(v / 50 * 100, 100);
                if (lab.includes('action') || lab.includes('capa') || lab.includes('overdue')) return Math.min(v / 50 * 100, 100);
                if (lab.includes('resolve') || lab.includes('closure') || lab.includes('complian')) return Math.min(v * 1, 100);
                return Math.min(v * 3, 100);
              };
              const isZero = num === 0;
              return (
                <div
                  key={k.label}
                  className={`rounded-xl border border-border bg-card p-3 card-hover transition-all duration-300 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <Annotation>{k.label}</Annotation>
                  <div className="mt-1 flex items-baseline justify-between gap-2">
                    <div className="text-3xl font-semibold tracking-tight">
                      <Counter value={isZero ? "0" : k.value} />
                    </div>
                    {!isZero && (
                      <div className={`text-[11px] inline-flex items-center gap-0.5 ${k.up ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {k.delta}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: revealed ? `${barWidth(k.label, num)}%` : "0%", background: grad(k.label) }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-12 gap-4">
            <WCard className="col-span-12 xl:col-span-8 card-hover" title="Audit Performance — Conducted vs Completed"
              hint={chartData?.[period]?.hint ?? "Trailing 12 months · monthly"}
              actions={
                <div className="flex gap-1">
                  {(["ytd", "q", "m"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide transition-all cursor-pointer ${
                        period === p
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              }>
              {chartData && <LineChart data={chartData[period]} />}
              {!chartData && <div className="h-[220px] grid place-items-center text-sm text-muted-foreground">No audit records yet. Schedule your first audit to get started.</div>}
              <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[var(--teal)]" />Conducted</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-[var(--teal)] bg-transparent" />Completed</span>
              </div>
            </WCard>

            <WCard className="col-span-12 md:col-span-6 xl:col-span-4 card-hover" title="Findings by Severity" hint="Current open findings">
              <PieChart items={data?.findingsBySeverity ?? []} total={severityTotal} />
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                {(data?.findingsBySeverity ?? []).map((s) => (
                  <div key={s.label} className="flex items-center justify-between border-b border-dashed border-border py-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                      <span className="text-muted-foreground">{s.label}</span>
                    </div>
                    <span className="font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </WCard>

            <WCard className="col-span-12 xl:col-span-7 card-hover" title="Findings by Department" hint={`Top ${(data?.findingsByDept ?? []).length} departments`}>
              {(data?.findingsByDept ?? []).length > 0 ? <BarChart items={data.findingsByDept} /> : <div className="h-[220px] grid place-items-center text-sm text-muted-foreground">No findings recorded. Create an audit to start capturing findings.</div>}
            </WCard>

            <WCard className="col-span-12 xl:col-span-5 card-hover" title="Organizational Risk Heat Map" hint="Likelihood × Impact (5×5)">
              <HeatMap grid={data?.riskHeatmap} />
            </WCard>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <WCard className="col-span-12 xl:col-span-7 card-hover" title="Upcoming Audits" hint="Next 30 days"
              actions={<Link to="/audits/calendar" className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">View calendar <ArrowUpRight className="h-3 w-3" /></Link>}>
              {(data?.upcomingAudits ?? []).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-muted-foreground">
                      <tr className="text-left border-b border-border">
                        {["Audit ID", "Audit Name", "Department", "Date", "Lead Auditor", "Status"].map((h) => (
                          <th key={h} className="py-2 pr-3 font-medium annotation whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.upcomingAudits ?? []).map((row) => {
                        const d = row.date ? new Date(row.date) : null;
                        const today = new Date();
                        const isToday = d && d.toDateString() === today.toDateString();
                        return (
                          <tr key={row.id} className={`border-b border-dashed border-border transition-colors ${isToday ? "bg-primary/[0.04]" : "hover:bg-gradient-to-r hover:from-teal/[0.02] hover:to-transparent"}`}>
                            <td className="py-2.5 pr-3 font-mono text-[11px] whitespace-nowrap">{row.id.substring(0, 12)}</td>
                            <td className="py-2.5 pr-3">{row.name}</td>
                            <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">{row.dept}</td>
                            <td className="py-2.5 pr-3 whitespace-nowrap">
                              {d ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="text-[10px] text-muted-foreground font-mono">{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
                                  <span className="font-medium">{d.getDate()}</span>
                                  <span className="text-[10px] text-muted-foreground">{d.toLocaleDateString("en-US", { month: "short" })}</span>
                                </span>
                              ) : <span className="text-muted-foreground">—</span>}
                            </td>
                            <td className="py-2.5 pr-3 whitespace-nowrap">{row.lead}</td>
                            <td className="py-2.5 pr-3 whitespace-nowrap"><WBadge tone="outline">{row.status}</WBadge></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">No upcoming audits. Plan an audit programme to schedule one.</div>
              )}
            </WCard>

            <WCard className="col-span-12 xl:col-span-5 card-hover" title="Recent Activity" hint="Live · all modules">
              {(data?.recentActivity ?? []).length > 0 ? (
                <ul className="space-y-3">
                  {(data?.recentActivity ?? []).map((a: ActivityItem, i: number) => {
                    const Icon = ACTIVITY_ICONS[i % ACTIVITY_ICONS.length];
                    return (
                      <li key={i} className="flex gap-3 group">
                        <div className="h-8 w-8 shrink-0 rounded-md border border-border grid place-items-center bg-gradient-to-br from-muted to-background group-hover:border-teal/30 group-hover:shadow-sm transition-all duration-300">
                          <Icon className="h-4 w-4 text-ink-soft group-hover:text-teal transition-colors duration-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs">{a.text}</div>
                          <div className="annotation mt-0.5">{a.who} · {a.when}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">No activity yet. Start an audit, add a team member, or open a corrective action to see updates here.</div>
              )}
            </WCard>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <WCard className="col-span-12 md:col-span-4 card-hover" title="Compliance Score by Standard">
              {(data?.complianceByStandard ?? []).map((s, i) => (
                <div key={s.standard} className="py-1.5">
                  <div className="flex justify-between text-sm"><span>{s.standard}</span><span className="font-medium">{s.score}%</span></div>
                  <div className="h-2 rounded-full bg-muted mt-1 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${s.score}%`, background: COMPLIANCE_COLORS[i % COMPLIANCE_COLORS.length] }} />
                  </div>
                </div>
              ))}
            </WCard>

            <WCard className="col-span-12 md:col-span-4 card-hover" title="Top Findings (Clauses)">
              {(data?.topFindings ?? []).length > 0 ? (
                <ol className="text-sm space-y-2">
                  {(data?.topFindings ?? []).map((f) => (
                    <li key={f.clause} className="flex items-center gap-3 group hover:bg-muted/30 rounded-md px-1 -mx-1 transition-colors">
                      <span className="font-mono text-[11px] w-10 text-muted-foreground">{f.clause}</span>
                      <span className="flex-1 truncate">{f.title}</span>
                      <WBadge>{f.count} ×</WBadge>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">No findings yet. Conduct an audit to log and track findings.</div>
              )}
            </WCard>

            <WCard className="col-span-12 md:col-span-4 card-hover" title="OAK AI" hint="Coming Soon">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bot className="h-6 w-6" />
                </div>
                <p className="mt-3 text-xs text-muted-foreground max-w-[200px]">Intelligent audit assistant — coming soon.</p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-[10px] font-medium text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />Coming Soon
                </span>
              </div>
            </WCard>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-4 border-t border-border">
            <span>&copy; 2026 OakAudix. All rights reserved.</span>
            <a href="https://www.tmb.it.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Built by TMB</a>
          </div>
        </>
      )}
    </AppShell>
  );
}

function LineChart({ data }: { data: { conducted: number[]; completed: number[]; labels: string[] } }) {
  const W = 720, H = 220, P = 28;
  const all = [...data.conducted, ...data.completed];
  const maxV = Math.max(...all, 1);
  const scale = (H - 2 * P) / (maxV * 1.15);
  const path = (arr: number[]) => arr.map((v, i) => {
    const x = P + (i * (W - 2 * P)) / (Math.max(arr.length - 1, 1));
    const y = H - P - v * scale;
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
  const ticks = [0, Math.round(maxV * 0.25), Math.round(maxV * 0.5), Math.round(maxV * 0.75), maxV];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[220px]">
      <defs><linearGradient id="lineChartGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.2" />
        <stop offset="100%" stopColor="var(--teal)" stopOpacity="0" />
      </linearGradient></defs>
      {ticks.map((t, i) => (
        <line key={i} x1={P} x2={W - P} y1={H - P - t * scale} y2={H - P - t * scale} stroke="var(--wire)" strokeDasharray="3 4" />
      ))}
      {ticks.map((t, i) => (
        <text key={`l${i}`} x={P - 6} y={H - P - t * scale + 3} fontSize="9" fill="var(--annotation)" textAnchor="end">{t}</text>
      ))}
      {data.labels.map((m, i) => (
        <text key={i} x={P + (i * (W - 2 * P)) / (Math.max(data.labels.length - 1, 1))} y={H - 8} fontSize="10" fill="var(--annotation)" textAnchor="middle">{m}</text>
      ))}
      <path d={path(data.completed)} fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" strokeDasharray="6 3" />
      <path d={path(data.conducted)} fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path(data.conducted) + ` L${W - P},${H - P} L${P},${H - P} Z`} fill="url(#lineChartGrad)" />
    </svg>
  );
}

function BarChart({ items }: { items: [string, number][] }) {
  const max = Math.max(...items.map(([, v]) => v), 1);
  return (
    <div className="h-[220px] flex items-end gap-3 px-1">
      {items.map(([l, v], i) => (
        <div key={l} className="flex-1 flex flex-col items-center gap-1.5 min-w-0 group">
          <div className="w-full rounded-t-lg transition-all duration-700 group-hover:opacity-80"
            style={{ height: `${(v / max) * 170}px`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
          <div className="annotation truncate w-full text-center group-hover:text-teal transition-colors">{l}</div>
          <div className="text-[10px] text-muted-foreground">{v}</div>
        </div>
      ))}
    </div>
  );
}

function PieChart({ items, total }: { items: { label: string; value: number; color: string }[]; total: number }) {
  const R = 70, C = 90, SW = 24;
  let acc = 0;
  return (
    <svg viewBox="0 0 180 180" className="w-full h-[180px]">
      <circle cx={C} cy={C} r={R} fill="none" stroke="var(--muted)" strokeWidth={SW} />
      {items.map((s) => {
        const frac = total > 0 ? s.value / total : 0;
        const len = 2 * Math.PI * R;
        const dash = `${frac * len} ${len}`;
        const off = -acc * len;
        acc += frac;
        return (
          <circle key={s.label} cx={C} cy={C} r={R} fill="none" stroke={s.color} strokeWidth={SW}
            strokeDasharray={dash} strokeDashoffset={off}
            transform={`rotate(-90 ${C} ${C})`}
            className="transition-all duration-500 hover:opacity-80" />
        );
      })}
      <text x={C} y={C - 2} fontSize="20" fontWeight="600" textAnchor="middle" fill="var(--ink)">{total}</text>
      <text x={C} y={C + 14} fontSize="9" textAnchor="middle" fill="var(--annotation)">OPEN FINDINGS</text>
    </svg>
  );
}

function HeatMap({ grid }: { grid?: number[][] }) {
  const data = grid ?? [
    [1,2,2,3,4], [1,2,3,4,4], [2,3,3,4,5], [2,3,4,5,5], [3,4,5,5,5],
  ];
  const tone = (n: number) => ["#22c55e","#86efac","#fde047","#f97316","#ef4444"][n - 1] || "#ef4444";
  return (
    <div>
      <div className="flex">
        <div className="w-6" />
        <div className="grid grid-cols-5 gap-1 flex-1">
          {data.map((row, ri) => row.map((v, ci) => (
            <div key={`${ri}-${ci}`} className="aspect-square rounded-lg border border-border/50 grid place-items-center text-[11px] font-medium transition-all duration-200 hover:scale-110 hover:shadow-md"
              style={{ background: tone(v), color: "black" }}>
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
