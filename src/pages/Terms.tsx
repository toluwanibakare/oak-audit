import { Link } from "react-router-dom";
import { ArrowLeft, FileText, AlertTriangle, Scale, ShieldAlert } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden relative">
      {/* Decorative background meshes */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/10 blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/10 blur-[100px] -z-10" />

      {/* Guest top navigation bar */}
      <header className="border-b border-border bg-card/85 backdrop-blur py-4 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <img src={logo} alt="Logo" className="h-8 w-auto shrink-0 object-contain" />
            <div className="flex flex-col min-w-0">
              <span className="font-display text-[12px] sm:text-[13px] font-extrabold text-foreground leading-none truncate uppercase">
                OakAudix
              </span>
              <span className="font-display text-[8.5px] sm:text-[9.5px] text-muted-foreground font-normal leading-none mt-0.5 tracking-wide block">
                Powered By OakAudix
              </span>
            </div>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl w-full mx-auto py-12 px-6 relative z-10 animate-fade-in-up">
        <div className="bg-card border border-border rounded-[32px] p-6 sm:p-10 shadow-card premium-glass-card space-y-8">
          <div className="border-b border-border pb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Terms Of Service</h1>
            <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5" />
              Effective Date: May 23, 2026
            </p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 text-warning flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-xs leading-normal">
                <strong>CRITICAL LEGAL WARRANTY:</strong> The OAK ISO Audit platform is a proprietary ISO software system. Replication, duplication, scraping, reverse-engineering, or unauthorized distribution of this codebase, layouts, and pre-built questions is strictly prohibited.
              </div>
            </div>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By registering a ISO workspace, funding your credit wallet, or using OakAudix's platform, you agree to be bound by these Terms of Service. If you are registering an account on behalf of a company or individual auditor workspace, you warrant that you possess full administrative permissions to bind that organization.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-primary" />
                2. Absolute Proprietary Protection & Intellectual Property
              </h2>
              <p>
                The entire Platform, including but not limited to source code, React components, CSS stylesheets, custom database RPC scripts, pre-built ISO checklists (ISO 9001, 14001, 45001, 27001, HSE, and cross-mapped IMS databases), icons, illustrations, and logos, is the absolute proprietary intellectual property of **OakAudix**.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>No Duplication:</strong> Under no circumstances may any user, organization, or external developer duplicate, clone, scrape, mimic, or replicate the platform's UI workflows or checklists.</li>
                <li><strong>Secured Assets:</strong> Any attempt to copy our source code or framework constitutes a severe infringement of our copyright, subject to immediate legal actions, injunctions, and claims for statutory damages.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                3. Credit Wallet & Licensing
              </h2>
              <p>
                Auditing on OakAudix operates on a proprietary pay-per-audit credit wallet system:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Rate:</strong> The exchange rate is **1 Credit = ₦10,000**. Credits are paid via the Paystack billing gate.</li>
                <li><strong>Locks:</strong> Unlocking an audit pack is a pay-per-standard and pay-per-auditor transaction. Access to the standard and question bank remains active for exactly **1 week** from activation.</li>
                <li><strong>No Refunds:</strong> All spent credits are final once the audit record is activated and standard checklists are seeded. No refunds are available for unused or active audit packs.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                4. Compliance Review Gates
              </h2>
              <p>
                To maintain the integrity of OakAudix's platform:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Both corporate and individual auditor workspaces must complete Profile Settings and pass compliance review by ISO administrators before licensing or unlocking audit packs.</li>
                <li>We reserve the right to suspend any workspace that provides false, misleading, or fraudulent company details or profile metadata.</li>
              </ul>
            </section>

            <section className="space-y-3 pt-4 border-t border-border">
              <h3 className="font-display text-base font-bold text-foreground">Terms Of Service Queries</h3>
              <p>
                For contract inquiries, institutional custom pricing review, or legal matters, please reach our board:
              </p>
              <address className="not-italic text-xs font-mono bg-secondary/50 border border-border p-4 rounded-xl mt-2 space-y-1 text-foreground">
                <p>OakAudix — Compliance & Corporate Governance Board</p>
                <p>Email: o.kolawole@oak-global.com.ng / info@oak-global.com.ng</p>
                <p>Phone: +234 802 364 4148</p>
              </address>
            </section>
          </div>
        </div>
      </main>

      {/* Guest footer */}
      <footer className="border-t border-border bg-card/80 py-5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} OakAudix. All rights reserved.</span>
          <span>
            Built by{" "}
            <a 
              href="http://tmb.it.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold text-primary hover:underline transition"
            >
              TMB
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
