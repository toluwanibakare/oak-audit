import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, RefreshCw, Clock } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden relative">
      {/* Decorative background meshes */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/10 blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/10 blur-[100px] -z-10" />

      {/* Guest top navigation bar */}
      <header className="border-b border-border bg-card/85 backdrop-blur py-4 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display font-extrabold text-sm uppercase tracking-wider text-foreground">
              OAK Global International
            </span>
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
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
            <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Last Updated: May 23, 2026
            </p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Eye className="h-4.5 w-4.5 text-primary" />
                1. Information We Collect
              </h2>
              <p>
                OAK Global International collects information necessary to facilitate ISO audit command workflows, credit allocations, and security records. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Account Credentials:</strong> Name, professional email address, phone number, physical contact address, and organizational metadata.</li>
                <li><strong>Audit Records:</strong> Scopes, processes, findings logs, auditor assignments, notes, evidence details, and Management Review records.</li>
                <li><strong>Transaction Records:</strong> Wallet balance logs, purchase reference logs, and billing history through Paystack. We do not store raw credit card details on our servers.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Lock className="h-4.5 w-4.5 text-primary" />
                2. How We Protect Your Data
              </h2>
              <p>
                We implement robust security frameworks to ensure total confidentiality and prevent data leakage:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Secure Transport:</strong> All data is encrypted in transit using industry-standard Transport Layer Security (TLS) and SSL protocols.</li>
                <li><strong>Row Level Security (RLS):</strong> Our secure databases enforce strict RLS policies, restricting workspace access strictly to authorized audit members and verified owners.</li>
                <li><strong>Access Control:</strong> Administrative activities bypass RLS solely via audited security-definer procedures reserved for approved GRC administrators.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-primary" />
                3. Sharing of Information
              </h2>
              <p>
                OAK Global International maintains an absolute policy of confidentiality. We **do not sell, rent, trade, or distribute** your organizational metrics, audit reports, finding databases, or contact records to any third-party advertisers, compliance boards, or external brokers. Data is stored solely to run compliance audits.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-primary" />
                4. Data Retention and Erasure
              </h2>
              <p>
                Audit licenses expire exactly **1 week** from activation, after which standard checklists remain archived in your workspace. You retain complete ownership of your data. Registered organizations can request full deletion of their auditor registers, finding categories, and compliance workspaces at any time by contacting our GRC helpdesk.
              </p>
            </section>

            <section className="space-y-3 pt-4 border-t border-border">
              <h3 className="font-display text-base font-bold text-foreground">Contact GRC Legal Board</h3>
              <p>
                For questions regarding data processing, privacy disclosures, or workspace isolation, please submit a ticket via our{" "}
                <Link to="/contact" className="text-primary hover:underline font-bold">Help & Support</Link>{" "}
                desk, or reach us at:
              </p>
              <address className="not-italic text-xs font-mono bg-secondary/50 border border-border p-4 rounded-xl mt-2 space-y-1 text-foreground">
                <p>OAK Global International — GRC Legal Affairs</p>
                <p>Email: o.kolawole@oak-global.com.ng / info@oak-global.com.ng</p>
                <p>Phone: +234 802 364 4148</p>
              </address>
            </section>
          </div>
        </div>
      </main>

      {/* Guest footer */}
      <footer className="border-t border-border bg-card/80 py-5 text-center text-xs text-muted-foreground relative z-10">
        © 2026 OAK Global International. All rights reserved.
      </footer>
    </div>
  );
}
