import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileText,
  Globe,
  LayoutGrid,
  Menu,
  Moon,
  Play,
  ShieldCheck,
  Sun,
  Users,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import heroAudit from "@/assets/hero-audit.jpg";
import heroSide from "@/assets/hero-side.jpg";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.png";

/* ─── data ─────────────────────────────────────────────────── */

const features = [
  {
    icon: ClipboardList,
    color: "bg-primary/10 text-primary",
    title: "End-to-End Audit Management",
    body: "From scope definition to findings and PDF exports — run the entire audit cycle inside one clean platform without disconnected spreadsheets.",
  },
  {
    icon: ShieldCheck,
    color: "bg-accent/15 text-accent",
    title: "ISO Multi-Standard Coverage",
    body: "ISO 9001, 14001, 45001, 27001 and IMS. Pre-built audit packs keep your team aligned to the right clauses every time.",
  },
  {
    icon: BarChart3,
    color: "bg-primary/10 text-primary",
    title: "Real-Time Analytics Dashboard",
    body: "Turn findings, conformity rates, and response trends into a live management view. Report-ready data at your fingertips.",
  },
  {
    icon: Users,
    color: "bg-accent/15 text-accent",
    title: "Team & Role Management",
    body: "Assign auditors, define scopes per team, and keep evidence traceable to the right person at every stage of the audit.",
  },
  {
    icon: FileText,
    color: "bg-primary/10 text-primary",
    title: "Automated CAPA & Findings",
    body: "Findings are auto-built during audit execution. Corrective action records are linked to evidence and tracked through to closure.",
  },
  {
    icon: Globe,
    color: "bg-accent/15 text-accent",
    title: "Credit-Based Access Control",
    body: "Unlock audit packs only for the teams, sites, or clients that need them. Scale up or down without committing to blanket subscriptions.",
  },
];

const individualPlans = [
  {
    name: "ISO Standard Pack (Individual)",
    price: "Personal Auditor Access",
    tagline: "Self-managed audit for a single ISO standard",
    color: "border-border/60 hover:border-primary/50",
    badge: "Individual Pack",
    features: [
      "Full access to any 1 standard (9001 / 14001 / 27001)",
      "Seeded standard process question banks & checklists",
      "Immediate workspace access — zero compliance review delay",
      "Auto-generate professional reports & watermarks",
      "Personal auditor dashboard & compliance scoring",
    ],
    cta: "Start auditing free",
    ctaStyle: "pill-secondary w-full justify-center",
  },
  {
    name: "HSE Safety Pack (Individual)",
    price: "Safety Specialist",
    tagline: "For comprehensive health & safety check runs",
    color: "border-primary/60 hover:border-primary/80",
    badge: "Safety Special",
    features: [
      "Full access to the 150-item HSE question bank",
      "Site inspection checklists & dynamic observation notes",
      "Audit title & lead auditor sign-off locks",
      "Action tracking & self-managed CAPA logs",
      "Custom report templates with photo attachments",
    ],
    cta: "Start safety audit",
    ctaStyle: "pill-cta w-full justify-center",
  },
];

const organizationPlans = [
  {
    name: "ISO Multi-Standard Corporate",
    price: "Corporate Teams",
    tagline: "Audit any single standard for your entire enterprise",
    color: "border-border/60 hover:border-accent/50",
    badge: "Enterprise Pack",
    features: [
      "Enterprise access to ISO 9001 / 14001 / 45001 / 27001",
      "Central team management & audit task assignment",
      "Custom corporate logos & custom watermarks",
      "Real-time corporate compliance dashboards",
      "Traceable multi-site auditor records",
    ],
    cta: "Configure workspace",
    ctaStyle: "pill-secondary w-full justify-center",
  },
  {
    name: "IMS Integrated Enterprise",
    price: "Full GRC Command",
    tagline: "All standards integrated into one unified room",
    color: "border-accent/70 hover:border-accent",
    badge: "Most Popular",
    features: [
      "Cross-mapped integrated checklists (IMS)",
      "Dedicated management review workflows",
      "Central processes & KPI dashboard",
      "Administrative controls & custom billing plans",
      "Advanced action tracking across all sites & departments",
    ],
    cta: "Request GRC Setup",
    ctaStyle: "pill-cta w-full justify-center",
  },
];

const workflow = [
  {
    step: "01",
    title: "Define Your Processes",
    body: "Create or import your internal processes. Map them to the ISO standards you need to audit.",
  },
  {
    step: "02",
    title: "Unlock Audit Packs",
    body: "Use credits to activate the audit packs relevant to your team, site, or client scope.",
  },
  {
    step: "03",
    title: "Execute with Evidence",
    body: "Run audits clause-by-clause. Capture evidence, observations, and conformity status in real time.",
  },
  {
    step: "04",
    title: "Auto-Build Findings & CAPA",
    body: "Nonconformities are automatically raised as findings. Assign corrective actions and track them to closure.",
  },
  {
    step: "05",
    title: "Export Polished Reports",
    body: "Generate management-ready PDF summaries and analytics reports in one click.",
  },
];

/* ─── component ─────────────────────────────────────────────── */

export default function Landing() {
  const { user, loading } = useAuth();
  const isLoggedIn = !loading && !!user;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pricingType, setPricingType] = useState<"individual" | "organization">("individual");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Manual theme synchronization to documentElement to bypass next-themes issues
  useEffect(() => {
    if (mounted && theme) {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme, mounted]);

  // IntersectionObserver to add transition classes when sections enter viewport
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
          entry.target.classList.remove('section-hidden');
        }
      });
    }, { threshold: 0.1 });
    sections.forEach(sec => {
      sec.classList.add('section-hidden');
      observer.observe(sec);
    });
    return () => observer.disconnect();
  }, [mounted]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
          {/* Logo + brand name + tagline in one line */}
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <img src={logo} alt="OAK Logo" className="h-9 w-auto shrink-0 object-contain" />
            <div className="flex flex-col min-w-0">
              <span className="font-display text-[13.5px] sm:text-[14.5px] font-extrabold text-foreground leading-none truncate">
                OAK Global International
              </span>
              <span className="font-display text-[9px] sm:text-[10.5px] text-primary font-bold leading-none mt-1 tracking-wide block">
                ISO Audit Platform
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#how-it-works" className="transition hover:text-foreground">How it works</a>
            <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {/* Premium Theme Toggle button */}
            <button
              onClick={() => setTheme((mounted ? theme : "light") === "dark" ? "light" : "dark")}
              className="group relative grid h-8.5 w-8.5 shrink-0 place-items-center rounded-lg border border-border bg-background/50 text-foreground transition-all duration-300 hover:bg-secondary hover:text-primary focus:outline-none"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              <Sun className={`h-3.5 w-3.5 transition-all duration-300 text-amber-500 ${
                (mounted ? theme : "light") === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
              }`} />
              <Moon className={`absolute h-3.5 w-3.5 transition-all duration-300 text-primary ${
                (mounted ? theme : "light") === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
              }`} />
            </button>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              {isLoggedIn ? (
                <Link to="/app" className="pill-cta text-xs px-4 py-2">
                  <span>Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <>
                  <Link to="/auth" className="pill-secondary text-xs px-3.5 py-2">Sign in</Link>
                  <Link to="/auth?mode=signup" className="pill-cta text-xs px-4 py-2">
                    <span>Get started</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground transition hover:bg-secondary hover:text-foreground md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Navigation Drawer Backdrop ─────────────────────── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Mobile Navigation Drawer Menu ─────────────────────────── */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 border-l border-border/80 bg-card/95 backdrop-blur-md p-6 transition-transform duration-300 ease-in-out md:hidden shadow-elevated ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <img src={logo} alt="OAK Logo" className="h-7 w-auto object-contain" />
                <span className="font-display font-bold text-xs text-foreground uppercase tracking-wider">Navigation</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex flex-col gap-2 font-display text-sm font-semibold">
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 hover:bg-secondary text-muted-foreground hover:text-foreground transition"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 hover:bg-secondary text-muted-foreground hover:text-foreground transition"
              >
                How it works
              </a>
              <a
                href="#pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 hover:bg-secondary text-muted-foreground hover:text-foreground transition"
              >
                Pricing
              </a>
            </nav>
          </div>

          <div className="border-t border-border/50 pt-6 space-y-3">
            {isLoggedIn ? (
              <Link
                to="/app"
                onClick={() => setIsMobileMenuOpen(false)}
                className="pill-cta w-full justify-center text-center text-xs py-3.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="pill-secondary w-full justify-center text-center text-xs py-3.5"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth?mode=signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="pill-cta w-full justify-center text-center text-xs py-3.5"
                >
                  <span>Get started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="hero-section">
          {/* Background image */}
          <div
            className="hero-bg"
            style={{ backgroundImage: `url(${heroBg})` }}
          />
          {/* Overlay: light blue → light green gradient */}
          <div className="hero-overlay" />
          
          {/* Digital Grid Pattern Texture */}
          <div className="hero-grid-pattern" />

          {/* Content — centered */}
          <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 sm:py-24 text-center text-white">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm shadow-sm">
                <BadgeCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                ISO-Ready Audit Platform
              </span>
            </div>

            <h1 className="animate-fade-in-up-delay-1 mt-5 text-balance font-display text-3xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-sm">
              Audit operations that feel{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-sky-100 to-emerald-100 font-extrabold">modern, clear</span>
              <br className="hidden sm:block" /> and easy to run.
            </h1>

            <p className="animate-fade-in-up-delay-2 mx-auto mt-5 max-w-2xl text-sm sm:text-base leading-6 sm:leading-7 text-white/85 md:text-lg">
              OAK Global International gives auditors one clean place to manage processes, run audits,
              collect evidence, track findings, and export polished reports — without the usual friction.
            </p>

            <div className="animate-fade-in-up-delay-3 mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 max-w-xs mx-auto sm:max-w-none">
              {isLoggedIn ? (
                <Link to="/app" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-primary shadow-elevated transition hover:scale-105 hover:bg-slate-50 duration-300">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link to="/auth?mode=signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-primary shadow-elevated transition hover:scale-105 hover:bg-slate-50 duration-300">
                  Start auditing free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {/* Watch Demo — placeholder */}
              <button
                onClick={() => {
                  alert("Demo video coming soon!");
                }}
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 hover:scale-105 duration-300"
              >
                <Play className="h-3.5 w-3.5 fill-white text-white shrink-0" />
                Watch demo
              </button>
            </div>

            {/* Trust indicators */}
            <div className="animate-fade-in-up-delay-3 mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-white/70">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ISO 9001 · 14001 · 45001 · 27001
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Ready in under 5 minutes
              </span>
            </div>
          </div>
        </section>

        {/* ── Social proof strip ───────────────────────────────── */}
        <section className="border-b border-border bg-card py-10">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { value: "End-to-End", label: "Audit Flow", sub: "From scope to PDF without leaving the workspace" },
                { value: "ISO-Ready", label: "Coverage", sub: "Quality, OH&S, environment, information security & IMS" },
                { value: "2026 Design", label: "Experience", sub: "Premium interface with fast navigation and cleaner reporting" },
              ].map(({ value, label, sub }) => (
                <div key={label} className="text-center">
                  <div className="font-display text-2xl font-extrabold text-primary">{value}</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{label}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 relative overflow-hidden">
          {/* Glowing background orbs for immersive design */}
          <div className="glow-orb glow-orb-primary -top-20 -right-20 h-[320px] w-[320px]" />
          <div className="glow-orb glow-orb-accent -bottom-20 -left-20 h-[320px] w-[320px]" />
          
          <div className="text-center relative z-10">
            <span className="eyebrow-chip-green">
              <LayoutGrid className="h-3.5 w-3.5" />
              Platform features
            </span>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-foreground">
              Everything your audit team needs
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
              Built specifically for compliance and audit professionals who need clarity, traceability, and speed —
              not another bloated enterprise tool.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
            {features.map(({ icon: Icon, color, title, body }) => (
              <div
                key={title}
                className="group premium-glass-card p-6"
              >
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl card-icon-container shadow-sm ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature image split ──────────────────────────────── */}
        <section className="bg-secondary/40 py-20 relative overflow-hidden">
          <div className="glow-orb glow-orb-primary top-10 left-10 h-[300px] w-[300px]" />
          
          <div className="mx-auto max-w-7xl px-6 lg:px-10 relative z-10">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <span className="eyebrow-chip">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Built for confidence
                </span>
                <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight">
                  Keep every audit decision traceable.
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  Evidence, findings, CAPA, and analytics are tied together so the report tells the same
                  story the audit actually uncovered. No gaps, no guessing.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Auto-built findings detected while auditing",
                    "Pack-based access — unlock only what you need",
                    "Analytics ready for management review",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent animate-pulse" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex gap-3">
                  <Link to="/auth?mode=signup" className="pill-cta">
                    Start auditing
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="overflow-hidden rounded-[28px] shadow-elevated border border-border/80 transition-transform duration-500 hover:scale-[1.02]">
                  <img
                    src={heroAudit}
                    alt="Black professional auditor reviewing compliance reports"
                    className="h-[200px] sm:h-[280px] w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-[28px] shadow-elevated hidden sm:block border border-border/80 transition-transform duration-500 hover:scale-[1.02]">
                  <img
                    src={heroSide}
                    alt="Black audit team reviewing compliance evidence together"
                    className="h-[180px] w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 relative overflow-hidden">
          <div className="glow-orb glow-orb-accent -top-10 right-10 h-[300px] w-[300px]" />
          
          <div className="text-center relative z-10">
            <span className="eyebrow-chip">
              <ClipboardList className="h-3.5 w-3.5 text-primary" />
              How it works
            </span>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight">
              A simpler order for real audit work
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              The experience is built to match how audit teams naturally move — from process setup
              through evidence, findings, and reporting.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 relative z-10">
            {workflow.map(({ step, title, body }, index) => (
              <div key={step} className="relative group">
                {/* connector line */}
                {index < workflow.length - 1 && (
                  <div className="absolute left-[calc(50%+28px)] top-7 hidden h-0.5 w-[calc(100%-16px)] bg-gradient-to-r from-primary/30 to-accent/30 lg:block animate-pulse" />
                )}
                <div className="workflow-card">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white shadow-card transition-transform duration-500 group-hover:scale-110">
                    {step}
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-foreground">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── MSAT Assessment Tool Showcase ────────────────────── */}
        <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-20 border-y border-border/80 relative overflow-hidden">
          <div className="glow-orb glow-orb-primary -top-40 -left-40 h-[400px] w-[400px]" />
          
          <div className="mx-auto max-w-7xl px-6 lg:px-10 relative z-10">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="flex flex-col gap-4">
                  <span className="eyebrow-chip-green w-fit">
                    <BadgeCheck className="h-3.5 w-3.5 text-accent" />
                    Partner Platform
                  </span>
                  <h2 className="font-display text-4xl font-extrabold tracking-tight text-foreground">
                    Try Our Management Assessment Platform: MSAT
                  </h2>
                  <p className="text-base leading-7 text-muted-foreground">
                    Looking for a comprehensive, institution-grade compliance tool? The <strong>MSAT Assessment Tool</strong> is a dedicated Management Assessment System tailored for benchmarking organizations against international standards.
                  </p>
                  
                  <div className="grid gap-4 sm:grid-cols-2 mt-2">
                    {[
                      {
                        title: "Dynamic Assessment Builder",
                        desc: "Design customizable, structured templates matching your business rules.",
                      },
                      {
                        title: "Versioned Scoring Matrices",
                        desc: "Accurately score compliance maturity across different iterations.",
                      },
                      {
                        title: "Action Plan PDF Exports",
                        desc: "Download complete, presentation-ready compliance roadmaps in one click.",
                      },
                      {
                        title: "Audit-Trail-Aware Model",
                        desc: "Keep records secure and verifiable for institutional onboarding.",
                      },
                    ].map((feat) => (
                      <div key={feat.title} className="bg-card/85 backdrop-blur-sm rounded-2xl border border-border/80 p-4 shadow-sm hover:shadow-card hover:border-primary/30 transition-all duration-300">
                        <h4 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                           <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                          {feat.title}
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground leading-normal">{feat.desc}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <a
                      href="https://assessment.ibmssp.org.ng"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pill-cta text-sm inline-flex items-center gap-2 transition-transform duration-300 hover:scale-105"
                    >
                      Explore MSAT Platform
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <span className="text-xs text-muted-foreground">
                      Visit: <a href="https://assessment.ibmssp.org.ng" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">assessment.ibmssp.org.ng</a>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2 flex flex-col justify-center items-center bg-card/75 backdrop-blur-md rounded-[32px] border border-border/80 p-6 sm:p-8 shadow-elevated text-center relative overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-2xl">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl -z-10 animate-pulse" />
                <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-accent/10 blur-3xl -z-10 animate-pulse" />
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 animate-bounce">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">MSAT Assessment Tool</h3>
                <p className="text-xs text-muted-foreground mt-2 max-w-sm">
                  "It is quality rather than quantity that matters." <br />
                  <span className="font-semibold block mt-1 text-primary">— Lucius Annaeus Seneca</span>
                </p>
                
                <div className="mt-6 w-full rounded-2xl border border-border bg-secondary/30 p-4 text-left space-y-2">
                  <div className="flex justify-between items-center text-xs border-b border-border/60 pb-2">
                    <span className="font-medium text-muted-foreground">System Status</span>
                    <span className="inline-flex items-center gap-1 font-bold text-accent">
                      <span className="h-2 w-2 rounded-full bg-accent animate-ping" /> Active
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex justify-between">
                    <span>Contact Assessor:</span>
                    <a href="tel:+2348023644148" className="font-semibold text-foreground hover:underline">+234 802 364 4148</a>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex justify-between">
                    <span>Inquiries:</span>
                    <a href="mailto:f.kolawole@ibmssp.org.ng" className="font-semibold text-foreground hover:underline">f.kolawole@ibmssp.org.ng</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────── */}
        <section id="pricing" className="bg-secondary/40 py-24 relative overflow-hidden border-b border-border">
          {/* Glow decoration */}
          <div className="glow-orb glow-orb-accent -bottom-40 -left-40 h-[380px] w-[380px]" />
          <div className="glow-orb glow-orb-primary -top-40 -right-40 h-[380px] w-[380px]" />
          
          <div className="mx-auto max-w-7xl px-6 lg:px-10 relative z-10">
            <div className="text-center">
              <span className="eyebrow-chip-green">
                <BadgeCheck className="h-3.5 w-3.5 text-accent" />
                Simple pricing allocation
              </span>
              <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-foreground">
                Flexible packs for every auditor
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
                Activate audit packs only for the standard and auditor scope you need. Zero upfront subscription commitments.
              </p>

              {/* Pricing Type Toggle Segment Selector with Premium Sliding Effect */}
              <div className="mt-8 flex justify-center">
                <div className="pricing-pill-toggle w-80 relative flex items-center h-12 bg-background/60 border border-border/80 rounded-full p-1 shadow-sm">
                  {/* sliding block */}
                  <div 
                    className={`absolute top-[4px] bottom-[4px] left-[4px] w-[calc(50%-4px)] rounded-full bg-primary shadow-md transition-transform duration-300 ease-out ${
                      pricingType === "organization" ? "translate-x-full" : "translate-x-0"
                    }`}
                  />
                  <button
                    onClick={() => setPricingType("individual")}
                    className={`relative flex flex-1 items-center justify-center py-2 text-xs font-bold transition-colors duration-300 z-10 ${
                      pricingType === "individual" ? "text-white animate-fade-in" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Individual auditor
                  </button>
                  <button
                    onClick={() => setPricingType("organization")}
                    className={`relative flex flex-1 items-center justify-center py-2 text-xs font-bold transition-colors duration-300 z-10 ${
                      pricingType === "organization" ? "text-white animate-fade-in" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Organization
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto transition-all duration-500">
              {(pricingType === "individual" ? individualPlans : organizationPlans).map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-[28px] border bg-card/65 backdrop-blur-md p-8 shadow-card hover:shadow-elevated transition-all duration-500 premium-glass-card !overflow-visible ${plan.color}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-8">
                      <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-card animate-pulse">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="mt-2">
                    <div className="font-display text-lg font-bold text-foreground">{plan.name}</div>
                    <p className="mt-1 text-xs text-muted-foreground leading-normal">{plan.tagline}</p>
                    <div className="mt-4 flex items-center">
                      <span className="inline-flex items-center rounded-xl bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                        {plan.price}
                      </span>
                    </div>
                  </div>

                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent animate-pulse" />
                        <span className="leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Link to="/auth?mode=signup" className={plan.ctaStyle}>
                      {plan.cta}
                      <ArrowRight className="h-4 w-4 animate-bounce-right" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="mt-10 text-center text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
              All activations are credit-allocated and managed securely through the GRC console. Annual custom allocations available with additional discounts. Contact compliance admin to unlock.
            </p>
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────── */}
        <section className="relative overflow-hidden py-24">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${heroBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 hero-overlay" />
          <div className="hero-grid-pattern" />
          
          <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white">
            <h2 className="font-display text-4xl font-extrabold tracking-tight">
              Ready to modernise your audit operations?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/80 leading-relaxed">
              Join audit teams across Africa using OAK Global's platform to run ISO-ready audits faster
              and with greater confidence.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 max-w-xs mx-auto sm:max-w-none">
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-primary shadow-elevated transition hover:scale-105 duration-300"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => alert("Demo video coming soon!")}
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 hover:scale-105 duration-300"
              >
                <Play className="h-3.5 w-3.5 fill-white text-white shrink-0" />
                Watch demo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Top section */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between pb-8 border-b border-border/60">
            <div className="flex items-center gap-3">
              <img src={logo} alt="OAK Logo" className="h-9 w-auto shrink-0 object-contain" />
              <div>
                <span className="font-display text-base font-bold text-foreground block">OAK Global International</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">ISO Audit Platform</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground">
              <a 
                href="https://oak-global.com.ng" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline transition"
              >
                Visit Our Corporate Website (oak-global.com.ng)
              </a>
              <span className="text-muted-foreground/40 hidden sm:inline">•</span>
              <Link to="/privacy" className="hover:text-foreground transition">Privacy Policy</Link>
              <span className="text-muted-foreground/30 hidden sm:inline">•</span>
              <Link to="/terms" className="hover:text-foreground transition">Terms of Service</Link>
              <span className="text-muted-foreground/30 hidden sm:inline">•</span>
              <Link to="/contact" className="hover:text-foreground transition">Contact Us</Link>
            </div>
          </div>
          
          {/* Bottom section */}
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row pt-8">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} OAK Global International. All rights reserved.
            </p>
            
            <p className="text-xs text-muted-foreground text-center sm:text-right">
              Built by{" "}
              <a 
                href="http://tmb.it.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-bold text-primary hover:underline hover:text-accent transition inline-flex items-center gap-0.5"
              >
                TMB
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
