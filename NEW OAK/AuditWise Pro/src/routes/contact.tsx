import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Mail, Phone } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — OakAudix" },
      { name: "description", content: "Contact OakAudix support and compliance team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card/85 backdrop-blur py-4 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--gradient-accent)] text-white shadow-sm">
              <Shield className="h-4 w-4" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-display text-[12px] sm:text-[13px] font-extrabold text-foreground leading-none truncate uppercase">
                OakAudix
              </span>
              <span className="font-display text-[8.5px] sm:text-[9.5px] text-muted-foreground font-normal leading-none mt-0.5 tracking-wide block">
                Powered By Oak Global International
              </span>
            </div>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition">
            Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto py-12 px-4">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Get In Touch</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Need technical assistance, billing review, or clarification on ISO standards? Our compliance administrators are ready to help.
                </p>
              </div>

              <div className="bg-card border border-border rounded-[28px] p-6 sm:p-8">
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Your Name</label>
                      <input type="text" className="h-11 w-full rounded-xl border border-border bg-background/50 text-sm px-3.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. John Doe" required />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Email Address</label>
                      <input type="email" className="h-11 w-full rounded-xl border border-border bg-background/50 text-sm px-3.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="you@company.com" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Subject</label>
                    <input type="text" className="h-11 w-full rounded-xl border border-border bg-background/50 text-sm px-3.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="How can we help?" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Message</label>
                    <textarea className="w-full rounded-xl border border-border bg-background/50 text-sm px-3.5 py-2.5 min-h-[140px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y" placeholder="Tell us more about your inquiry..." required />
                  </div>
                  <button type="submit" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-[28px] p-6 shadow-card space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
              <div>
                <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  ISO Compliance Board
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Direct corporate resolution channels.</p>
              </div>

              <div className="space-y-4">
                <a href="mailto:o.kolawole@oak-global.com.ng" className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-background/50 hover:bg-secondary/40 transition group">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Corporate Affairs & Legal</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-foreground group-hover:text-primary transition block whitespace-nowrap">
                      o.kolawole@oak-global.com.ng
                    </span>
                  </div>
                </a>

                <a href="mailto:info@oak-global.com.ng" className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-background/50 hover:bg-secondary/40 transition group">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">General Inquiries</span>
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition break-all block">
                      info@oak-global.com.ng
                    </span>
                  </div>
                </a>

                <a href="tel:+2348023644148" className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-background/50 hover:bg-secondary/40 transition group">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Support Board Phone</span>
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition">
                      +234 802 364 4148
                    </span>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-card border border-border rounded-[28px] p-6 shadow-card space-y-4">
              <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                Support Desk SLA
              </h4>
              <div className="text-xs text-muted-foreground space-y-2.5">
                <div className="flex justify-between items-center py-1 border-b border-border/50">
                  <span>Operating Hours</span>
                  <span className="font-bold text-foreground">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/50">
                  <span>Business Days</span>
                  <span className="font-bold text-foreground">Monday - Friday (WAT)</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Resolution Target</span>
                  <span className="font-bold text-success flex items-center gap-1">Under 24 Hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter simple />
    </div>
  );
}
