import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { newsletterApi } from "@/lib/api/newsletter";
import {
  ShieldCheck, ClipboardCheck, Workflow, Smartphone, BarChart3, Bell,
  Users, Building2, FileSearch, Layers, ArrowRight, CheckCircle2,
  AlertTriangle, TrendingUp, MapPin, Activity, Lock, Cloud, GitBranch,
  Gauge, FileBarChart, BadgeCheck, ChevronDown, ChevronUp, Mail, Phone,
} from "lucide-react";
import logo from "@/assets/logo.png";
import heroDashboard from "@/assets/hero-dashboard.jpg";

const LIFECYCLE_STORAGE_KEY = "oakaudix:lastLifecycle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OakAudix | Digital Audit Management Platform" },
      { name: "description", content: "Intelligent compliance, connected audits, and actionable insights. Manage audits, CAPA, risk, and governance across all your sites." },
      { property: "og:title", content: "OakAudix | Digital Audit Management Platform" },
      { property: "og:description", content: "End-to-end audit lifecycle on one enterprise platform." },
    ],
  }),
  component: Landing,
});

const modules = [
  { icon: ClipboardCheck, title: "Audit Planning & Scheduling", desc: "Build annual programmes, auto-schedule recurring audits and assign teams in minutes." },
  { icon: Smartphone, title: "Mobile Audit Execution", desc: "Conduct inspections on any device, online or offline, with photos, voice notes and signatures." },
  { icon: AlertTriangle, title: "Findings & CAPA", desc: "Capture nonconformities, assign corrective actions and track them to verified closure." },
  { icon: Activity, title: "Risk-Based Tracking", desc: "Prioritise audits by risk score, monitor exposure and surface trends before they escalate." },
  { icon: FileSearch, title: "Evidence & Documents", desc: "Centralised, version-controlled evidence library with full audit trail retention." },
  { icon: BarChart3, title: "Real-Time Analytics", desc: "Live dashboards for compliance scores, overdue actions, heatmaps and executive KPIs." },
  { icon: Bell, title: "Notifications & Escalations", desc: "Configurable workflows escalate overdue actions to the right people, automatically." },
  { icon: Users, title: "Team & Role Management", desc: "Granular permissions for auditors, owners, reviewers and executives across business units." },
  { icon: Building2, title: "Multi-Site Compliance", desc: "Standardised governance with site-level execution and consolidated enterprise reporting." },
];

const standards = ["ISO 9001", "ISO 14001", "ISO 45001", "ISO 27001", "IMS", "Internal Standards", "Regulatory Frameworks"];

const workflowSteps = [
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
  const [showTop, setShowTop] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );

    const els = document.querySelectorAll("[data-scroll], [data-scroll-stagger]");
    els.forEach((el) => observer.observe(el));

    const onScroll = () => {
      const y = window.scrollY;
      setShowTop(y > 400);
      setScrolled(y > 60);
      setParallaxY(y * 0.15);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Header scrolled={scrolled} />
      <Hero parallaxY={parallaxY} />
      <div data-scroll="up"><LogosBar /></div>
      <div data-scroll="up"><Modules /></div>
      <div data-scroll="left"><Lifecycle /></div>
      <div data-scroll="right"><MobileSection /></div>
      <div data-scroll="up"><CapaSection /></div>
      <div data-scroll="up"><DashboardSection /></div>
      <div data-scroll="left"><WorkflowSection /></div>
      <div data-scroll="right"><MultiSite /></div>
      <div data-scroll="up"><Industries /></div>
      <div data-scroll="up"><PricingSection /></div>
      <div data-scroll="up"><Security /></div>
      <div data-scroll="up"><CTA /></div>
      <div data-scroll="up"><Footer /></div>
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 grid h-10 w-10 place-items-center rounded-md bg-white text-[var(--navy-deep)] shadow-lg border border-border/50 transition-all duration-500 hover:scale-110 hover:shadow-xl active:scale-95 ${
          showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </div>
  );
}

function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${tone === "dark" ? "text-primary" : "text-white"}`}>
      <img src={logo} alt="OakAudix" className="h-9 w-auto rounded-lg border border-white/30 bg-white p-1" />
      <div className="flex flex-col leading-none">
        <span className="font-display text-base font-bold tracking-tight">OakAudix</span>
        <span className="text-[9px] font-medium tracking-wide mt-0.5 whitespace-nowrap" style={{ color: tone === "dark" ? "var(--muted-foreground)" : "rgba(255,255,255,0.5)" }}>
          Powered by OakGlobal International
        </span>
      </div>
    </Link>
  );
}

function Header({ scrolled }: { scrolled: boolean }) {
  const { user } = useAuth();
  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-[var(--navy-deep)]/95 backdrop-blur-xl shadow-lg shadow-black/10"
          : "bg-[var(--navy-deep)]/80 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10">
        <Logo tone="light" />
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <a href="#modules" className="text-white/60 hover:text-white transition-colors duration-300">Features</a>
          <a href="#bundles" className="text-white/60 hover:text-white transition-colors duration-300">Pricing</a>
          <a href="#lifecycle" className="text-white/60 hover:text-white transition-colors duration-300">How It Works</a>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-5 py-2 text-sm font-semibold text-[var(--navy-deep)] shadow-sm transition-all duration-300 hover:brightness-95 hover:scale-105 active:scale-95"
            >
              Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link to="/auth" className="text-sm text-white/70 hover:text-white transition-colors duration-300">
                Sign In
              </Link>
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center gap-1.5 rounded-md bg-white px-5 py-2 text-sm font-semibold text-[var(--navy-deep)] shadow-sm transition-all duration-300 hover:brightness-95 hover:scale-105 active:scale-95"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero({ parallaxY }: { parallaxY: number }) {
  const { user } = useAuth();
  return (
    <section className="relative min-h-dvh overflow-hidden bg-hero text-white">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.25]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          transform: `translateY(${parallaxY}px)`,
        }}
      />
      <div className="container-page relative z-10 grid min-h-dvh gap-10 py-20 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="animate-fade-in-up">
          <span className="chip-on-dark animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>Audit & Compliance Management</span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl">
            Intelligent compliance.<br />
            <span className="text-gradient-teal">Connected audits.</span><br />
            Actionable insights.
          </h1>
          <p className="mt-5 max-w-lg text-base text-white/70 md:text-lg">
            Manage audits, compliance, risks and corrective actions from planning to closure on one connected platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-[var(--navy-deep)] shadow-sm transition-all duration-300 hover:brightness-95 hover:scale-105 active:scale-95">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link to="/auth?mode=signup" className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-[var(--navy-deep)] shadow-sm transition-all duration-300 hover:brightness-95 hover:scale-105 active:scale-95">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <a href="mailto:info@oak-global.com.ng" className="btn-glow inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition-all duration-300 hover:bg-white/10 hover:scale-105 active:scale-95">
              Request demo
            </a>
          </div>
        </div>
        <div className="relative group animate-slide-in-right">
          <div className="absolute -inset-4 rounded-3xl bg-[var(--teal)]/20 blur-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" aria-hidden />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 transition-all duration-500 group-hover:shadow-[0_40px_80px_-20px_oklch(0_0_0/0.7)]"
            style={{ transform: 'perspective(1000px) rotateY(-3deg)' }}>
            <img src={heroDashboard} alt="OakAudix Dashboard" className="w-full h-auto block" />
          </div>
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
          subtitle="Every module you need to run audits, CAPA and governance. Natively connected, configurable, and built for enterprise scale."
        />
        <div data-scroll-stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="card-hover rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
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
    { label: "Audit programme creation", to: "/auth", desc: "Design annual audit programmes across sites, standards and processes." },
    { label: "Automated scheduling", to: "/auth", desc: "Auto-generate recurring audits and assign lead auditors." },
    { label: "Checklist management", to: "/auth", desc: "Curate ISO, IMS, regulatory and supplier checklists in one library." },
    { label: "Mobile inspections", to: "/auth", desc: "Execute audits on any device with offline capability." },
    { label: "Findings capture", to: "/auth", desc: "Log nonconformities with notes, evidence and severity." },
    { label: "CAPA assignment & tracking", to: "/auth", desc: "Assign corrective actions and monitor to closure." },
    { label: "Verification & closure", to: "/auth", desc: "Verify CAPA effectiveness and formally close findings." },
    { label: "Audit history retention", to: "/auth", desc: "Retain full audit trails, evidence and reports for compliance." },
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
            Manage the entire audit lifecycle, digitally.
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
                  <div className="h-full rounded-full" style={{ width: `${row.p}%`, background: 'var(--gradient-accent)' }} />
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
    { icon: Cloud, t: "Offline capability", d: "Capture data without signal and sync when back online." },
    { icon: FileSearch, t: "Photo & evidence", d: "Attach images, files, voice notes and signatures." },
    { icon: GitBranch, t: "Immediate sync", d: "Findings stream live to the central platform." },
  ];
  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeader eyebrow="Mobile Execution" title="Conduct audits anywhere" />
        <div data-scroll-stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, t, d }) => (
            <div key={t} className="card-hover rounded-xl border border-border bg-card p-5">
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
          subtitle="Live dashboards for executives and operators with compliance scoring, trend analysis, heatmaps and overdue tracking."
        />
        <div className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-elev)] md:p-8">
          <div data-scroll-stagger className="grid gap-4 md:grid-cols-4">
            {kpis.map(({ icon: Icon, label, value, trend, tone }) => (
              <div key={label} className="card-hover rounded-xl border border-border bg-secondary/40 p-4">
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
        <ol data-scroll-stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((s) => (
            <li key={s.n} className="card-hover relative rounded-xl border border-border bg-card p-5">
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
            Filter by region, business unit, or site and roll everything up to
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
        <div data-scroll-stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind) => (
            <div key={ind.name} className="card-hover rounded-2xl border border-border bg-card p-6">
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

const pricingPacks = [
  {
    code: "9001",
    label: "ISO 9001",
    description: "Quality Management System",
    badge: null,
    color: "border-border/60 hover:border-primary/50",
    tiers: [
      { tier: "1 \u2013 5 Users",      price: "\u20A6500,000" },
      { tier: "5 \u2013 15 Users",     price: "\u20A61,000,000" },
      { tier: "16+ Users",        price: "\u20A61,500,000" },
    ],
  },
  {
    code: "14001",
    label: "ISO 14001",
    description: "Environmental Management System",
    badge: null,
    color: "border-border/60 hover:border-primary/50",
    tiers: [
      { tier: "1 \u2013 5 Users",      price: "\u20A6500,000" },
      { tier: "5 \u2013 15 Users",     price: "\u20A61,000,000" },
      { tier: "16+ Users",        price: "\u20A61,500,000" },
    ],
  },
  {
    code: "45001",
    label: "ISO 45001",
    description: "Occupational Health & Safety",
    badge: null,
    color: "border-border/60 hover:border-primary/50",
    tiers: [
      { tier: "1 \u2013 5 Users",      price: "\u20A6500,000" },
      { tier: "5 \u2013 15 Users",     price: "\u20A61,000,000" },
      { tier: "16+ Users",        price: "\u20A61,500,000" },
    ],
  },
  {
    code: "27001",
    label: "ISO 27001",
    description: "Information Security Management",
    badge: null,
    color: "border-border/60 hover:border-primary/50",
    tiers: [
      { tier: "1 \u2013 5 Users",      price: "\u20A6500,000" },
      { tier: "5 \u2013 15 Users",     price: "\u20A61,000,000" },
      { tier: "16+ Users",        price: "\u20A61,500,000" },
    ],
  },
  {
    code: "hse",
    label: "HSE Bundle",
    description: "ISO 14001 + ISO 45001 Combined",
    badge: "Bundle",
    color: "border-primary/40 hover:border-primary/70",
    tiers: [
      { tier: "1 \u2013 5 Users",      price: "\u20A61,000,000" },
      { tier: "5 \u2013 15 Users",     price: "\u20A61,500,000" },
      { tier: "16+ Users",        price: "\u20A62,000,000" },
    ],
  },
  {
    code: "ims",
    label: "IMS Bundle",
    description: "ISO 9001 + 14001 + 45001 Combined",
    badge: "Most Popular",
    color: "border-accent/50 hover:border-accent/80",
    tiers: [
      { tier: "1 \u2013 5 Users",      price: "\u20A61,500,000" },
      { tier: "5 \u2013 15 Users",     price: "\u20A62,000,000" },
      { tier: "16+ Users",        price: "\u20A62,500,000" },
    ],
  },
];

function PricingSection() {
  return (
    <section id="bundles" className="py-20 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center">
          <span className="chip"><BadgeCheck className="h-3.5 w-3.5" /> Transparent Pricing</span>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-foreground">
            Pay Per Audit. No Subscriptions.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
            Pay once when you run an audit with no recurring fees or credits. Your team size determines the price tier.
          </p>
        </div>

        <div data-scroll-stagger className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pricingPacks.map((pack) => (
            <div key={pack.code} className={`card-hover relative flex flex-col rounded-2xl border bg-card p-5 shadow-sm ${pack.color}`}>
              {pack.badge && (
                <span className="absolute top-4 right-4 inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                  {pack.badge}
                </span>
              )}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{pack.label}</p>
                  <h3 className="font-display text-sm font-bold text-foreground">{pack.description}</h3>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-border/50 bg-secondary/40 overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/30 bg-secondary/60 px-3 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Team Size</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Price / Audit</span>
                </div>
                {pack.tiers.map(({ tier, price }) => (
                  <div key={tier} className="flex items-center justify-between px-3 py-2.5 border-b last:border-0 border-border/20">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3 w-3 shrink-0" />
                      {tier}
                    </span>
                    <span className="font-display text-sm font-bold text-foreground">{price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1.5">
                {[
                  "Audit Planning & Execution",
                  "Report Analytics & Dashboard",
                  "CAPA Management",
                  "Document Repository",
                  "Email Notifications",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-border/40">
                <Link to="/auth?mode=signup" className="inline-flex w-full items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Pay securely via Paystack · Instant activation · One-time per audit run
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 mt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="chip"><BadgeCheck className="h-3.5 w-3.5" /> Frequently Asked Questions</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground">
            Got Questions? We Have Answers.
          </h2>
        </div>
        <div className="mx-auto max-w-3xl mt-10 space-y-3">
          {[
            { q: "How does pricing work?", a: "OakAudix uses a pay-per-audit model. You only pay when you run an audit. There are no subscriptions, monthly fees, or credit packs to manage. Your team size determines the price tier, and payment is processed securely via Paystack." },
            { q: "What payment methods do you accept?", a: "We accept all major Nigerian debit and credit cards via Paystack. This includes Visa, Mastercard, and Verve. International cards processed through Paystack are also supported." },
            { q: "Can I switch from Individual to Organisation later?", a: "Yes. You can upgrade your account type from your settings page at any time. Your audit history and data remain intact when you switch." },
            { q: "What ISO standards do you support?", a: "We support ISO 9001 (Quality), ISO 14001 (Environmental), ISO 45001 (Health & Safety), ISO 27001 (Information Security), and combined bundles (HSE for 14001+45001, IMS for 9001+14001+45001)." },
            { q: "Is there a free trial?", a: "We do not offer a free trial, but you can create an account and explore the platform without payment. You only pay when you are ready to run your first audit." },
            { q: "How are team sizes calculated?", a: "Your team size is determined by the number of active members in your workspace. You can manage team members from your organisation dashboard at any time." },
            { q: "Do you offer refunds?", a: "Once an audit is activated after payment, it is considered delivered. If you experience technical issues, our support team will work with you to resolve them. Contact us at info@oak-global.com.ng for assistance." },
          ].map((faq) => (
            <details key={faq.q} className="group rounded-xl border border-border bg-card overflow-hidden">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none text-sm font-semibold text-foreground hover:text-primary transition-colors">
                {faq.q}
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </div>
            </details>
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
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRef.current?.value) return;
    setSubscribing(true);
    setError(null);
    try {
      await newsletterApi.subscribe({ email: emailRef.current.value, source: "landing" });
      setSubscribed(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <section id="newsletter" className="bg-hero py-20 text-white">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="chip-on-dark">Stay connected</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            Stay ahead of compliance.
          </h2>
          <p className="mt-4 text-white/75 md:text-lg">
            Get product updates, regulatory news, and compliance tips delivered to your inbox.
          </p>
          {subscribed ? (
            <div className="mx-auto mt-8 max-w-md rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <CheckCircle2 className="mx-auto h-8 w-8 text-[var(--success)]" />
              <p className="mt-3 font-semibold text-white">You are subscribed!</p>
              <p className="mt-1 text-sm text-white/60">Thanks for joining the OakAudix community.</p>
            </div>
          ) : (
            <form className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row" onSubmit={handleSubscribe}>
              <div className="flex-1">
                <input
                  ref={emailRef}
                  type="email"
                  required
                  placeholder="Your email address"
                  className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[var(--teal)] focus:outline-none transition-all duration-300"
                />
                {error && <p className="mt-1 text-xs text-red-400 text-left">{error}</p>}
              </div>
              <button disabled={subscribing} className="btn-glow inline-flex items-center justify-center gap-2 rounded-md bg-[var(--teal)] px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 active:scale-95 disabled:opacity-60">
                {subscribing ? "Subscribing..." : "Subscribe"} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
          <p className="mt-3 text-xs text-white/50">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  const links = [
    {
      heading: "Platform",
      items: [
        { label: "Modules", href: "#modules" },
        { label: "Pricing", href: "#bundles" },
        { label: "Analytics", href: "#dashboard" },
        { label: "Industries", href: "#industries" },
      ],
    },
    {
      heading: "Company",
      items: [
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Terms of Service", to: "/terms" },
        { label: "Get started", to: "/auth?mode=signup" },
      ],
    },
    {
      heading: "Support",
      items: [
        { label: "Open a Ticket", to: "/contact" },
        { label: "Contact", to: "/contact" },
        { label: "info@oak-global.com.ng", href: "mailto:info@oak-global.com.ng" },
        { label: "+234 123 456 789", href: "tel:+234123456789" },
      ],
    },
  ];
  return (
    <footer className="relative bg-[var(--navy-deep)] text-white/60 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="relative z-10 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[var(--teal)]/30 before:to-transparent">
        <div className="container-page py-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
            <div>
              <Logo tone="light" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
                Enterprise audit and compliance management platform. Plan, execute, track, and report across all your sites.
              </p>
            </div>
            {links.map((col) => (
              <div key={col.heading}>
                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30">
                  {col.heading}
                </p>
                <ul className="mt-5 space-y-3">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      {"to" in item ? (
                        <Link to={item.to!} className="group/link inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-all duration-300">
                          <span className="inline-block transition-transform duration-300 group-hover/link:translate-x-0.5">{item.label}</span>
                        </Link>
                      ) : (
                        <a href={item.href!} className="group/link inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-all duration-300">
                          <span className="inline-block transition-transform duration-300 group-hover/link:translate-x-0.5">{item.label}</span>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/[0.06]">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-xs sm:flex-row">
          <span className="text-white/30">
            &copy; {year} OakAudix. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <span className="text-white/20">&middot;</span>
            <span className="text-white/25">
              Built by{" "}
              <a href="http://tmb.it.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-white/40 hover:text-white transition-colors duration-300">
                TMB
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
