import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ClipboardList, Search, AlertTriangle, CheckSquare,
  TrendingUp, Building2, Users, BookOpen, BarChart3, Settings, Sparkles,
  Bell, Plus, Search as SearchIcon, ChevronDown, LogOut, X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

type Item = { label: string; to?: string; children?: { label: string; to: string }[] };

const NAV: { icon: any; label: string; to?: string; children?: { label: string; to: string }[] }[] = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  {
    icon: ClipboardList, label: "Audit Management", children: [
      { label: "Audit Program", to: "/audits/program" },
      { label: "Audit Plans", to: "/audits/plans" },
      { label: "Audit Schedule", to: "/audits/schedule" },
      { label: "Audit Calendar", to: "/audits/calendar" },
    ],
  },
  {
    icon: Search, label: "Audit Execution", children: [
      { label: "Conduct Audit", to: "/execution/conduct" },
      { label: "Audit Checklists", to: "/execution/checklists" },
      { label: "Audit Findings", to: "/execution/findings" },
      { label: "Evidence Collection", to: "/execution/evidence" },
      { label: "Auditor Notes", to: "/execution/notes" },
    ],
  },
  {
    icon: AlertTriangle, label: "Nonconformities", children: [
      { label: "Major NC", to: "/nc/major" },
      { label: "Minor NC", to: "/nc/minor" },
      { label: "Observations", to: "/nc/observations" },
      { label: "Opportunities for Improvement", to: "/nc/ofi" },
    ],
  },
  {
    icon: CheckSquare, label: "Corrective Actions", children: [
      { label: "Open Actions", to: "/actions/open" },
      { label: "In Progress", to: "/actions/in-progress" },
      { label: "Overdue Actions", to: "/actions/overdue" },
      { label: "Closed Actions", to: "/actions/closed" },
    ],
  },
  {
    icon: TrendingUp, label: "Risk Management", children: [
      { label: "Risk Register", to: "/risk/register" },
      { label: "Risk Assessment", to: "/risk/assessment" },
      { label: "Risk Treatment", to: "/risk/treatment" },
      { label: "Opportunities Register", to: "/risk/opportunities" },
    ],
  },
  {
    icon: Building2, label: "Organization", children: [
      { label: "Departments", to: "/org/departments" },
      { label: "Processes", to: "/org/processes" },
      { label: "Locations", to: "/org/locations" },
      { label: "Assets", to: "/org/assets" },
    ],
  },
  {
    icon: Users, label: "User Management", children: [
      { label: "Users", to: "/users/all" },
      { label: "Roles", to: "/users/roles" },
      { label: "Teams", to: "/users/teams" },
      { label: "Permissions", to: "/users/permissions" },
    ],
  },
  {
    icon: BookOpen, label: "ISO Library", children: [
      { label: "Standards", to: "/library/standards" },
      { label: "Procedures", to: "/library/procedures" },
      { label: "Policies", to: "/library/policies" },
      { label: "Forms", to: "/library/forms" },
      { label: "Templates", to: "/library/templates" },
    ],
  },
  { icon: BarChart3, label: "Reports & Analytics", to: "/reports" },
  { icon: Sparkles, label: "AI Assistant", to: "/ai" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    await signOut();
  };
  return (
    <>
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowLogout(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-foreground">Sign Out</h3>
              <button onClick={() => setShowLogout(false)} disabled={signingOut} className="h-8 w-8 grid place-items-center rounded-md hover:bg-secondary text-muted-foreground disabled:opacity-30">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">Are you sure you want to sign out?</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowLogout(false)} disabled={signingOut} className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary transition disabled:opacity-30">
                Cancel
              </button>
              <button onClick={handleSignOut} disabled={signingOut} className="flex-1 rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {signingOut ? <>Signing out<span className="animate-pulse">...</span></> : "Yes, Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col h-screen sticky top-0">
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-sidebar-border">
        <img src={logo} alt="OakAudix" className="h-8 w-auto object-contain" />
        <div className="leading-tight">
          <div className="text-sm font-semibold">OakAudix</div>
          <div className="annotation">AUDIT & COMPLIANCE PLATFORM</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 text-sm">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.to && pathname === item.to;
          const expanded = item.children?.some((c) => pathname.startsWith(c.to));
          if (item.to && !item.children) {
            return (
              <Link key={item.label} to={item.to}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent ${active ? "bg-sidebar-accent font-medium" : ""}`}>
                <Icon className="h-4 w-4 text-ink-soft" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          }
          return (
            <div key={item.label}>
              <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${expanded ? "bg-sidebar-accent font-medium" : ""}`}>
                <Icon className="h-4 w-4 text-ink-soft" />
                <span className="flex-1 truncate">{item.label}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </div>
              <div className="ml-6 border-l border-sidebar-border pl-2 mt-0.5 space-y-0.5">
                {item.children?.map((c) => {
                  const ca = pathname === c.to;
                  return (
                    <Link key={c.to} to={c.to}
                      className={`block px-2 py-1 rounded text-[13px] text-muted-foreground hover:bg-sidebar-accent hover:text-foreground ${ca ? "bg-sidebar-accent text-foreground font-medium" : ""}`}>
                      {c.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full wire-box grid place-items-center text-xs font-bold bg-sidebar-accent">
          {user?.full_name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">{user?.full_name || "User"}</div>
          <div className="annotation">{user?.account_type === "organization" ? "ORGANIZATION" : "INDIVIDUAL"}</div>
        </div>
        <button onClick={() => setShowLogout(true)} className="h-6 w-6 grid place-items-center rounded hover:bg-sidebar-accent text-muted-foreground hover:text-foreground" title="Sign out">
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
    </>
  );
}

function TopBar() {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center gap-3 px-6 sticky top-0 z-10">
      <div className="flex-1 max-w-xl relative">
        <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search audits, findings, risks, clauses…"
          className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-muted/40 text-sm outline-none focus:border-ring"
        />
      </div>
      <Link to="/audits/new" className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90">
        <Plus className="h-4 w-4" /> New Audit
      </Link>
      <button className="h-9 w-9 grid place-items-center rounded-md border border-border relative">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-foreground" />
      </button>
      <div className="h-9 w-9 rounded-full wire-box" />
    </header>
  );
}

export function AppShell({ children, title, annotation }: { children: ReactNode; title?: string; annotation?: string }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 space-y-6">
          {title && (
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                {annotation && <div className="annotation mb-1">{annotation}</div>}
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="annotation">WIREFRAME</span>
                <span>·</span>
                <span>1440px · 12-col grid</span>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
