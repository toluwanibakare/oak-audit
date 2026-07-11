import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShieldCheck, ClipboardCheck, Workflow, Smartphone, BarChart3, Bell,
  Users, Building2, FileSearch, Layers, ArrowRight, CheckCircle2,
  AlertTriangle, TrendingUp, MapPin, Activity, Lock, Cloud, GitBranch,
  Gauge, FileBarChart, Sparkles,
} from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.jpg";

const LIFECYCLE_STORAGE_KEY = "auditly:lastLifecycle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Auditly — Digital Audit Management Platform" },
      { name: "description", content: "Intelligent compliance, connected audits, and actionable insights. Manage audits, CAPA, risk, and governance across all your sites." },
      { property: "og:title", content: "Auditly — Digital Audit Management Platform" },
      { property: "og:description", content: "End-to-end audit lifecycle on one enterprise platform." },
    ],
  }),
  component: Landing,
});

const modules = [
  { icon: ClipboardCheck, title: "Audit Planning & Scheduling", desc: "Build annual programmes, auto-schedule recurring audits and assign teams in minutes." },
  { icon: Smartphone, title: "Mobile Audit Execution", desc: "Conduct inspections on any device — online or offline — with photos, voice notes and signatures." },
  { icon: AlertTriangle, title: "Findings & CAPA", desc: "Capture nonconformities, assign corrective actions and track them to verified closure." },
  { icon: Activity, title: "Risk-Based Tracking", desc: "Prioritise audits by risk score, monitor exposure and surface trends before they escalate." },
  { icon: FileSearch, title: "Evidence & Documents", desc: "Centralised, version-controlled evidence library with full audit trail retention." },
  { icon: BarChart3, title: "Real-Time Analytics", desc: "Live dashboards for compliance scores, overdue actions, heatmaps and executive KPIs." },
  { icon: Bell, title: "Notifications & Escalations", desc: "Configurable workflows escalate overdue actions to the right people, automatically." },
  { icon: Users, title: "Team & Role Management", desc: "Granular permissions for auditors, owners, reviewers and executives across business units." },
  { icon: Building2, title: "Multi-Site Compliance", desc: "Standardised governance with site-level execution and consolidated enterprise reporting." },
];

const standards = ["ISO 9001", "ISO 14001", "ISO 45001", "ISO 27001", "IMS", "Internal Standards", "Regulatory Frameworks"];

const workflow = [
  { n: "01", t: "Plan audit", d: "Programmes, scope, schedule" },
  { n: "02", t: "Assign team", d: "Auditors, reviewers, sites" },
  { n: "03", t: "Execute", d: "Mobile checklists & evidence" },
  { n: "04", t: "Capture findings", d: "Nonconformities & observations" },
  { n: "05", t: "Assign CAPA", d: "Owners, due dates, root cause" },
  { n: "06", t: "Verify actions", d: "Effectiveness review" },
  { n: "07", t: "Generate reports", d: "Management review packs" },
  { n: "08", t: "Monitor trends", d: "Risk & compliance KPIs" },
];

const industries = [
  { name: "Oil & Gas", points: ["HSE compliance", "Contractor audits", "Permit-to-work", "Regulatory traceability"] },
  { name: "Manufacturing", points: ["Quality control", "Supplier audits", "Production compliance", "Nonconformance"] },
  { name: "Logistics & Transport", points: ["Fleet compliance", "Driver safety", "Operational inspections", "Incident trends"] },
  { name: "Healthcare", points: ["Patient safety", "Clinical audits", "Regulatory inspections", "Documentation"] },
  { name: "Financial Services", points: ["Governance & risk", "Internal controls", "Regulatory reporting", "InfoSec compliance"] },
  { name: "Enterprise Multi-Site", points: ["Central oversight", "Local execution", "Standardised governance", "Region filtering"] },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <LogosBar />
      <Modules />
      <Lifecycle />
      <MobileSection />
      <CapaSection />
      <DashboardSection />
      <WorkflowSection />
      <MultiSite />
      <Industries />
      <Security />
      <CTA />
      <Footer />
    </div>
  );
}

function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const color = tone === "dark" ? "text-primary" : "text-white";
  return (
    <Link to="/" className={`flex items-center gap-2 ${color}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--gradient-accent)] text-white shadow-sm">
        <ShieldCheck className="h-4 w-4" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">Auditly</span>
    </Link>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--navy-deep)]/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo tone="light" />
        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <Link to="/workflow" className="hover:text-white">Workflow</Link>
          <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
          <Link to="/checklists" className="hover:text-white">Checklists</Link>
          <Link to="/process-audits" className="hover:text-white">Process Audits</Link>
          <Link to="/workflow-admin" className="hover:text-white">Admin</Link>
          <a href="#lifecycle" className="hover:text-white">Lifecycle</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href="#cta" className="hidden rounded-md px-3 py-2 text-sm text-white/80 hover:text-white md:inline-block">Sign in</a>
          <a href="#cta" className="inline-flex items-center gap-1.5 rounded-md bg-[var(--teal)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
            Request demo <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero text-white">
      <div className="container-page grid gap-12 py-20 md:py-28 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <span className="chip-on-dark"><Sparkles className="h-3 w-3" /> Audit & Compliance Management</span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl">
            Intelligent compliance.<br />
            <span className="text-gradient-teal">Connected audits.</span><br />
            Actionable insights.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/75">
            A smarter way to manage audits, compliance, risks and corrective actions —
            from planning to closure, on one connected platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#cta" className="inline-flex items-center gap-2 rounded-md bg-[var(--teal)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_oklch(0.52_0.09_195/0.7)] transition hover:brightness-110">
              Book a demo <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#modules" className="inline-flex items-center gap-2 rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/5">
              Explore the platform
            </a>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6 text-white/80">
            {[
              { k: "Faster", v: "60%", s: "audit cycles" },
              { k: "Closure", v: "3.2×", s: "CAPA velocity" },
              { k: "Sites", v: "1—500+", s: "managed" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="font-display text-2xl font-bold text-white">{s.v}</dt>
                <dd className="text-xs uppercase tracking-wide text-white/55">{s.s}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 rounded-3xl bg-[var(--teal)]/20 blur-3xl" aria-hidden />
          <img
            src={heroDashboard}
            alt="Audit and compliance dashboard with risk heatmap, CAPA tracking and compliance scoring"
            width={1600}
            height={1104}
            className="relative w-full rounded-2xl border border-white/10 shadow-[0_30px_80px_-20px_oklch(0_0_0/0.55)]"
          />
        </div>
      </div>
    </section>
  );
}

function LogosBar() {
  return (
    <section className="border-y border-border bg-secondary/60">
      <div className="container-page flex flex-wrap items-center justify-between gap-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Supports multiple standards & frameworks
        </p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {standards.map((s) => (
            <span key={s} className="font-display text-sm font-semibold text-steel">{s}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="chip">{eyebrow}</span>
      <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base text-muted-foreground md:text-lg">{subtitle}</p>}
    </div>
  );
}

function Modules() {
  return (
    <section id="modules" className="py-24">
      <div className="container-page">
        <SectionHeader
          eyebrow="The Platform"
          title="Designed for complete audit and compliance control"
          subtitle="Every module you need to run audits, CAPA and governance — natively connected, configurable, and built for enterprise scale."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--teal)]/40">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--teal)]/10 text-[var(--teal)]">
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Lifecycle() {
  const items: { label: string; to: string; hash?: string; desc: string }[] = [
    { label: "Audit programme creation", to: "/process-audits", desc: "Design annual audit programmes across sites, standards and processes." },
    { label: "Automated scheduling", to: "/process-audits", desc: "Auto-generate recurring audits and assign lead auditors." },
    { label: "Checklist management", to: "/checklists", desc: "Curate ISO, IMS, regulatory and supplier checklists in one library." },
    { label: "Mobile inspections", to: "/process-audits", desc: "Execute audits on any device with offline capability." },
    { label: "Findings capture", to: "/process-audits", desc: "Log nonconformities with notes, evidence and severity." },
    { label: "CAPA assignment & tracking", to: "/process-audits", desc: "Assign corrective actions and monitor to closure." },
    { label: "Verification & closure", to: "/process-audits", desc: "Verify CAPA effectiveness and formally close findings." },
    { label: "Audit history retention", to: "/checklists", desc: "Retain full audit trails, evidence and reports for compliance." },
  ];
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  useEffect(() => {
    try {
      setActiveLabel(sessionStorage.getItem(LIFECYCLE_STORAGE_KEY));
    } catch {}
  }, []);
  return (
    <section id="lifecycle" className="bg-secondary py-24">
      <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="chip"><Workflow className="h-3 w-3" /> Lifecycle</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Manage the entire audit lifecycle — digitally.
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            From planning to closure, every step is connected. Click any stage to jump straight into it.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2" role="list">
            {items.map((i) => {
              const isActive = activeLabel === i.label;
              return (
                <li key={i.label}>
                  <Link
                    to={i.to}
                    title={i.desc}
                    aria-label={`${i.label} — ${i.desc}`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => {
                      try { sessionStorage.setItem(LIFECYCLE_STORAGE_KEY, i.label); } catch {}
                      setActiveLabel(i.label);
                    }}
                    className={`group flex w-full items-start gap-2 rounded-lg border p-2 text-left text-sm transition hover:-translate-y-0.5 hover:border-[var(--teal)]/40 hover:bg-card hover:shadow-[var(--shadow-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-secondary ${
                      isActive
                        ? "border-[var(--teal)] bg-card shadow-[var(--shadow-card)] ring-1 ring-[var(--teal)]/30"
                        : "border-transparent bg-card/40"
                    }`}
                  >
                    <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${isActive ? "text-[var(--teal)]" : "text-[var(--success)]"}`} />
                    <span className="flex-1 font-medium">{i.label}</span>
                    {isActive && (
                      <span className="rounded-full bg-[var(--teal)]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--teal)]">
                        Active
                      </span>
                    )}
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-[var(--teal)]" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elev)]">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-[var(--teal)]/10 text-[var(--teal)]"><ClipboardCheck className="h-4 w-4" /></span>
              <div>
                <p className="text-sm font-semibold">Q3 Operational Audit — Plant 04</p>
                <p className="text-xs text-muted-foreground">ISO 45001 · Lead: J. Marin</p>
              </div>
            </div>
            <span className="rounded-full bg-[var(--success)]/12 px-2.5 py-1 text-xs font-semibold text-[var(--success)]">On track</span>
          </div>
          <div className="mt-5 space-y-3">
            {[
              { t: "Planning", p: 100 }, { t: "Execution", p: 78 },
              { t: "Findings review", p: 42 }, { t: "CAPA closure", p: 18 },
            ].map((row) => (
              <div key={row.t}>
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{row.t}</span>
                  <span className="text-muted-foreground">{row.p}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-[var(--gradient-accent)]" style={{ width: `${row.p}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[{ l: "Checklists", v: "24/31" }, { l: "Findings", v: "9" }, { l: "Open CAPA", v: "5" }].map((k) => (
              <div key={k.l} className="rounded-lg border border-border bg-secondary/50 p-3">
                <p className="font-display text-lg font-bold">{k.v}</p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{k.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileSection() {
  const features = [
    { icon: Smartphone, t: "Tablet & phone ready", d: "Run checklists in the field on any device." },
    { icon: Cloud, t: "Offline capability", d: "Capture data without signal — sync when back online." },
    { icon: FileSearch, t: "Photo & evidence", d: "Attach images, files, voice notes and signatures." },
    { icon: GitBranch, t: "Immediate sync", d: "Findings stream live to the central platform." },
  ];
  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeader eyebrow="Mobile Execution" title="Conduct audits anywhere" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-xl border border-border bg-card p-5">
              <Icon className="h-5 w-5 text-[var(--teal)]" strokeWidth={1.6} />
              <h3 className="mt-3 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapaSection() {
  const points = [
    "Automatic assignment of corrective actions",
    "Due-date tracking with escalation rules",
    "Root cause analysis & categorisation",
    "Verification and effectiveness reviews",
    "Management oversight & approvals",
  ];
  return (
    <section className="bg-[var(--navy-deep)] py-24 text-white">
      <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="order-2 lg:order-1 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-white/80">CAPA Pipeline</p>
            <span className="chip-on-dark">Live</span>
          </div>
          <div className="mt-5 space-y-3">
            {[
              { id: "CAPA-2014", t: "Update permit-to-work register", d: "Due in 3 days", c: "warning" },
              { id: "CAPA-2009", t: "Calibrate gas detectors — Plant 02", d: "Due tomorrow", c: "warning" },
              { id: "CAPA-1998", t: "Retrain contractor — height work", d: "Overdue 2d", c: "destructive" },
              { id: "CAPA-1991", t: "Update supplier audit checklist", d: "Verified", c: "success" },
            ].map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                <div>
                  <p className="font-mono text-xs text-white/60">{r.id}</p>
                  <p className="font-medium text-white">{r.t}</p>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{
                    background: `color-mix(in oklch, var(--${r.c}) 22%, transparent)`,
                    color: `oklch(0.92 0.1 ${r.c === "success" ? 160 : r.c === "warning" ? 80 : 25})`,
                  }}
                >{r.d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <span className="chip-on-dark"><AlertTriangle className="h-3 w-3" /> CAPA</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            Findings tracked all the way to closure.
          </h2>
          <p className="mt-4 text-white/70 md:text-lg">
            Automated CAPA workflows ensure nothing slips. Escalations, verification
            and effectiveness reviews are baked into every action.
          </p>
          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-white/85">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.78_0.18_160)]" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function DashboardSection() {
  const kpis = [
    { icon: Gauge, label: "Compliance score", value: "94.2%", trend: "+2.1%", tone: "success" as const },
    { icon: AlertTriangle, label: "Overdue findings", value: "12", trend: "-4 wk", tone: "warning" as const },
    { icon: TrendingUp, label: "Audit completion", value: "87%", trend: "+6%", tone: "success" as const },
    { icon: MapPin, label: "Sites active", value: "42", trend: "all green", tone: "success" as const },
  ];
  const heat = Array.from({ length: 35 }, (_, i) => (i * 7 + 13) % 100);
  return (
    <section id="dashboard" className="py-24">
      <div className="container-page">
        <SectionHeader
          eyebrow="Analytics"
          title="Turn audit data into business decisions"
          subtitle="Live dashboards for executives and operators — compliance scoring, trend analysis, heatmaps and overdue tracking."
        />
        <div className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-elev)] md:p-8">
          <div className="grid gap-4 md:grid-cols-4">
            {kpis.map(({ icon: Icon, label, value, trend, tone }) => (
              <div key={label} className="rounded-xl border border-border bg-secondary/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
                  <Icon className="h-4 w-4 text-[var(--teal)]" />
                </div>
                <p className="mt-2 font-display text-3xl font-bold">{value}</p>
                <p className={`mt-1 text-xs font-medium ${tone === "success" ? "text-[var(--success)]" : "text-[var(--warning)]"}`}>{trend}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold">Audit completion trend</h3>
                <span className="text-xs text-muted-foreground">Last 12 months</span>
              </div>
              <svg viewBox="0 0 600 200" className="mt-4 h-44 w-full">
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.52 0.09 195)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="oklch(0.52 0.09 195)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 50, 100, 150].map((y) => (
                  <line key={y} x1="0" x2="600" y1={y + 20} y2={y + 20} stroke="oklch(0.92 0.01 250)" />
                ))}
                <path d="M0,150 C50,140 90,120 140,110 C190,100 220,130 270,115 C320,100 360,70 410,75 C460,80 500,55 560,45 L600,40 L600,200 L0,200 Z" fill="url(#g1)" />
                <path d="M0,150 C50,140 90,120 140,110 C190,100 220,130 270,115 C320,100 360,70 410,75 C460,80 500,55 560,45 L600,40" fill="none" stroke="oklch(0.52 0.09 195)" strokeWidth="2.5" />
                <path d="M0,170 C60,165 110,158 160,150 C210,145 250,160 300,150 C350,140 390,125 440,118 C490,112 540,98 600,90" fill="none" stroke="oklch(0.62 0.16 145)" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-full bg-[var(--teal)]" /> Completed audits</span>
                <span className="flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-full bg-[var(--success)]" /> Verified CAPA</span>
              </div>
            </div>

            <div className="rounded-xl border border-border p-5">
              <h3 className="font-display font-semibold">Risk heatmap</h3>
              <p className="text-xs text-muted-foreground">Sites × categories</p>
              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {heat.map((v, i) => {
                  const hue = v < 33 ? 145 : v < 66 ? 80 : 25;
                  return <div key={i} className="aspect-square rounded-[3px]" style={{ background: `oklch(${0.55 + (v / 400)} ${0.12 + v / 800} ${hue})`, opacity: 0.35 + v / 150 }} />;
                })}
              </div>
              <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
                <span>Low</span><span>Medium</span><span>High</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section className="bg-secondary py-24">
      <div className="container-page">
        <SectionHeader
          eyebrow="Workflow"
          title="Simple, structured, scalable"
          subtitle="A repeatable 8-step lifecycle that scales from a single site to a global enterprise programme."
        />
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workflow.map((s) => (
            <li key={s.n} className="relative rounded-xl border border-border bg-card p-5">
              <span className="font-display text-xs font-bold tracking-widest text-[var(--teal)]">{s.n}</span>
              <h3 className="mt-2 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function MultiSite() {
  return (
    <section className="py-24">
      <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="chip"><Building2 className="h-3 w-3" /> Enterprise Governance</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            One platform across all sites and business units.
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Standardised governance with central oversight and local execution.
            Filter by region, business unit, or site — and roll everything up to
            an executive view.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { i: Layers, t: "Site-level visibility" },
              { i: FileBarChart, t: "Consolidated reporting" },
              { i: ShieldCheck, t: "Standardised governance" },
              { i: MapPin, t: "Region & BU filters" },
            ].map(({ i: Icon, t }) => (
              <div key={t} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <Icon className="h-4 w-4 text-[var(--teal)]" />
                <span className="text-sm font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold">Site performance</h3>
            <span className="text-xs text-muted-foreground">Compliance %</span>
          </div>
          <div className="mt-5 space-y-3">
            {[
              { n: "EMEA — Rotterdam", v: 96 },
              { n: "APAC — Singapore", v: 91 },
              { n: "NAM — Houston", v: 88 },
              { n: "LATAM — São Paulo", v: 82 },
              { n: "AFR — Lagos", v: 74 },
            ].map((s) => (
              <div key={s.n}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{s.n}</span>
                  <span className="text-muted-foreground">{s.v}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full" style={{
                    width: `${s.v}%`,
                    background: s.v >= 90 ? "var(--success)" : s.v >= 80 ? "var(--teal)" : "var(--warning)",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Industries() {
  return (
    <section id="industries" className="bg-secondary py-24">
      <div className="container-page">
        <SectionHeader
          eyebrow="Industries"
          title="Configurable for every sector"
          subtitle="Pre-built templates and best-practice checklists for the industries that depend on rigorous compliance."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind) => (
            <div key={ind.name} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold">{ind.name}</h3>
              <ul className="mt-3 space-y-2">
                {ind.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--teal)]" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Security() {
  const items = [
    { i: Lock, t: "Enterprise security", d: "SSO, SAML, granular RBAC and full audit trails." },
    { i: Cloud, t: "Cloud-native", d: "Highly available, regionally hosted with encrypted backups." },
    { i: GitBranch, t: "Integrations", d: "REST API, webhooks and connectors to ERP, EHS and BI tools." },
  ];
  return (
    <section className="py-24">
      <div className="container-page grid gap-8 md:grid-cols-3">
        {items.map(({ i: Icon, t, d }) => (
          <div key={t} className="flex gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--teal)]/10 text-[var(--teal)]">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="cta" className="bg-hero py-20 text-white">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="chip-on-dark">Get started</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            See Auditly in action.
          </h2>
          <p className="mt-4 text-white/75 md:text-lg">
            Book a 30-minute walkthrough tailored to your standards, sites and audit programme.
          </p>
          <form className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              required
              placeholder="Work email"
              className="flex-1 rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[var(--teal)] focus:outline-none"
            />
            <button className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--teal)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110">
              Request demo <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-3 text-xs text-white/50">No credit card required · SOC-grade security</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-[var(--navy-deep)] py-12 text-white/70">
      <div className="container-page flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <Logo tone="light" />
          <p className="mt-3 max-w-sm text-sm text-white/55">
            Intelligent compliance. Connected audits. Actionable insights.
          </p>
        </div>
        <div className="flex flex-wrap gap-8 text-sm">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-widest text-white/40">Platform</p>
            <ul className="mt-2 space-y-1">
              <li><a href="#modules" className="hover:text-white">Modules</a></li>
              <li><a href="#dashboard" className="hover:text-white">Analytics</a></li>
              <li><a href="#industries" className="hover:text-white">Industries</a></li>
            </ul>
          </div>
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-widest text-white/40">Company</p>
            <ul className="mt-2 space-y-1">
              <li><a href="#cta" className="hover:text-white">Contact</a></li>
              <li><a href="#cta" className="hover:text-white">Request demo</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container-page mt-10 border-t border-white/10 pt-6 text-xs text-white/40">
        © {new Date().getFullYear()} Auditly. All rights reserved.
      </div>
    </footer>
  );
}
