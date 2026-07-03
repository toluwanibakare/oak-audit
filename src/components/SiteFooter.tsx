import { Link } from "react-router-dom";
import { Shield, Mail, Phone } from "lucide-react";
import logo from "@/assets/logo.png";

interface SiteFooterProps {
  simple?: boolean;
}

export const SiteFooter = ({ simple }: SiteFooterProps) => {
  if (simple) {
    return (
      <footer className="relative border-t border-border bg-gradient-to-b from-background to-secondary/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} OakAudix. All rights reserved.</span>
          <span>
            Built by{" "}
            <a href="http://tmb.it.com" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline transition">
              TMB
            </a>
          </span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="overflow-hidden bg-gradient-to-b from-background to-secondary/40">
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-8 lg:px-10">
        {/* Top section: logo + tagline */}
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-inner">
              <img src={logo} alt="OakAudix" className="h-7 w-auto object-contain" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-foreground block">OakAudix</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] block">Powered by OAK Global International</span>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
            Integrated management system audit platform. Simplify ISO compliance, track corrective actions, and generate management-ready reports.
          </p>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-gradient-to-r from-border/0 via-border to-border/0" />

        {/* Middle section: links + contact */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Quick links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: "/", label: "Home" },
                { to: "/#pricing", label: "Pricing" },
                { to: "/app/licenses", label: "ISO Audit Library" },
                { to: "/contact", label: "Help & Support" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {[
                { to: "/privacy", label: "Privacy Policy" },
                { to: "/terms", label: "Terms of Service" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:info@oakaudix.app" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  info@oakaudix.app
                </a>
              </li>
              <li>
                <a href="tel:+2348023644148" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Phone className="h-3.5 w-3.5" />
                  </span>
                  +234 802 364 4148
                </a>
              </li>
              <li>
                <a href="https://oak-global.com.ng" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Shield className="h-3.5 w-3.5" />
                  </span>
                  oak-global.com.ng
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card/50 px-6 py-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} OakAudix. All rights reserved.
          </p>
          <span className="text-xs text-muted-foreground">
            Built by{" "}
            <a href="http://tmb.it.com" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline transition">
              TMB
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};
