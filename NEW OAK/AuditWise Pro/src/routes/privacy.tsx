import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — OakAudix" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
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
        <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: January 2025</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/85">
          <section>
            <h2 className="font-display text-xl font-bold mb-3">1. Introduction</h2>
            <p>OakAudix ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our audit management platform.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold mb-3">2. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>Name, email address, and phone number when you create an account</li>
              <li>Organization details including industry, company size, and address</li>
              <li>Audit data, findings, and evidence you upload to the platform</li>
              <li>Communication data when you contact our support team</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold mb-3">3. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>Provide, maintain, and improve our audit management services</li>
              <li>Process your account registration and manage your subscription</li>
              <li>Send you technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold mb-3">4. Data Security</h2>
            <p>We implement appropriate technical and organizational security measures to protect your personal information. However, no electronic transmission or storage method is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold mb-3">5. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:info@oak-global.com.ng" className="text-primary hover:underline">info@oak-global.com.ng</a>.</p>
          </section>
        </div>
      </main>

      <SiteFooter simple />
    </div>
  );
}
