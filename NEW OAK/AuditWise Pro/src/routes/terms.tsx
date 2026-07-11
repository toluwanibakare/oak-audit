import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — OakAudix" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card/85 backdrop-blur py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--gradient-accent)] text-white shadow-sm">
              <Shield className="h-4 w-4" />
            </span>
            <span className="font-display text-sm font-extrabold text-foreground">OakAudix</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto py-12 px-6">
        <h1 className="font-display text-3xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: January 2025</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/85">
          <section>
            <h2 className="font-display text-xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using OakAudix, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold mb-3">2. Description of Service</h2>
            <p>OakAudix provides an integrated management system audit platform that enables organizations to plan, execute, and report ISO compliance audits, track corrective actions, and generate management-ready reports.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold mb-3">3. User Responsibilities</h2>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You agree not to use the platform for any unlawful purpose</li>
              <li>You are responsible for all content you upload and share through the platform</li>
              <li>You must not attempt to bypass or compromise the platform's security features</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold mb-3">4. Intellectual Property</h2>
            <p>The OakAudix platform, including its code, design, and content, is the proprietary intellectual property of OAK GLOBAL INTERNATIONAL. You may not copy, modify, distribute, or create derivative works without explicit written permission.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold mb-3">5. Limitation of Liability</h2>
            <p>OakAudix shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the platform.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold mb-3">6. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:info@oak-global.com.ng" className="text-primary hover:underline">info@oak-global.com.ng</a>.</p>
          </section>
        </div>
      </main>

      <SiteFooter simple />
    </div>
  );
}
