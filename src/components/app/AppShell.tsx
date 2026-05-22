import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Moon,
  Receipt,
  Settings,
  Sun,
  User,
  Users,
  Wallet as WalletIcon,
  Workflow,
} from "lucide-react";
import { useTheme } from "next-themes";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/audits", label: "My audits", icon: ClipboardCheck },
  { to: "/app/processes", label: "Processes", icon: Workflow },
  { to: "/app/licenses", label: "Audit packs", icon: Receipt },
  { to: "/app/findings", label: "Findings", icon: AlertTriangle },
  { to: "/app/question-bank", label: "Question bank", icon: BookOpen },
  { to: "/app/team", label: "Audit team", icon: Users },
  { to: "/app/settings", label: "Profile settings", icon: Settings },
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const { orgs, currentOrg, setCurrentOrg } = useOrg();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  const navigate = useNavigate();
  const location = useLocation();
  const [balance, setBalance] = useState<number | null>(null);
  const [showTopLoader, setShowTopLoader] = useState(true);
  const [topLoaderProgress, setTopLoaderProgress] = useState(18);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  /* ── Wallet balance ─────────────────────────────────────────── */
  useEffect(() => {
    if (!currentOrg) return;
    supabase
      .from("credit_wallets")
      .select("balance")
      .eq("org_id", currentOrg.id)
      .maybeSingle()
      .then(({ data }) => setBalance(data?.balance ?? 0));
  }, [currentOrg]);

  /* ── Top loader ─────────────────────────────────────────────── */
  useEffect(() => {
    setShowTopLoader(true);
    setTopLoaderProgress(18);

    const progressTimer = window.setInterval(() => {
      setTopLoaderProgress((value) => (value >= 88 ? value : value + 14));
    }, 80);

    const finishTimer = window.setTimeout(() => {
      setTopLoaderProgress(100);
      window.setTimeout(() => setShowTopLoader(false), 180);
    }, 520);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(finishTimer);
    };
  }, [location.pathname, currentOrg?.id]);

  /* ── Close user menu on outside click ──────────────────────── */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  /* ── Derived display values ─────────────────────────────────── */
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email ?? "";

  return (
    <div className="app-shell-bg min-h-screen">
      {/* Top progress loader */}
      {showTopLoader && (
        <div className="fixed inset-x-0 top-0 z-50 h-1.5 bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-primary via-accent to-primary/70 transition-[width] duration-150 ease-out"
            style={{ width: `${topLoaderProgress}%` }}
          />
        </div>
      )}

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 overflow-hidden border-r border-border/80 bg-card/95 backdrop-blur lg:block">
        <div className="flex h-full flex-col justify-between">
          <div className="flex flex-col overflow-hidden">
            {/* Current workspace display */}
            <div className="px-4 pt-5 pb-2">
              <div className="rounded-2xl border border-border bg-secondary/60 px-3 py-2.5">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Current workspace</div>
                <div className="mt-0.5 truncate text-sm font-semibold text-foreground">
                  {currentOrg?.name ?? "Loading..."}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {currentOrg?.type === "individual" ? "Personal audit space" : "Team audit command"}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1.5 px-3 py-3 overflow-y-auto max-h-[calc(100vh-210px)]">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-card"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Bottom: user card */}
          <div className="border-t border-border/80 px-4 py-4 bg-card/95 space-y-3.5">
            {/* Theme Toggle Pill Segment Selector with Premium Slide Effect */}
            <div className="relative flex items-center rounded-2xl border border-border/60 bg-background/50 p-1 select-none overflow-hidden h-9">
              {/* Sliding highlight */}
              <div 
                className={`absolute top-[3px] bottom-[3px] left-[3px] w-[calc(50%-3px)] rounded-xl bg-primary shadow-sm transition-transform duration-300 ease-out ${
                  (mounted ? theme : "light") === "dark" ? "translate-x-full" : "translate-x-0"
                }`}
              />
              
              <button
                onClick={() => setTheme("light")}
                title="Light Mode"
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-1 text-xs font-bold transition-colors duration-300 z-10 ${
                  (mounted ? theme : "light") === "light"
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Light</span>
              </button>
              
              <button
                onClick={() => setTheme("dark")}
                title="Dark Mode"
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-1 text-xs font-bold transition-colors duration-300 z-10 ${
                  (mounted ? theme : "light") === "dark"
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Dark</span>
              </button>
            </div>

            {/* User card with dropdown */}
            <div ref={userMenuRef} className="user-dropdown">
              {/* Dropdown menu (appears above) */}
              {userMenuOpen && (
                <div className="user-dropdown-menu">
                  <button
                    onClick={async () => {
                      setUserMenuOpen(false);
                      await signOut();
                      navigate("/");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}

              {/* Trigger */}
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-left transition hover:bg-secondary"
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{displayName}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{displayEmail}</div>
                </div>
                <ChevronRight
                  className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${userMenuOpen ? "-rotate-90" : "rotate-90"}`}
                />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content area ────────────────────────────────────── */}
      <div className="lg:pl-64">
        {/* App header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/70 bg-card/80 px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            {/* Brand identity in header — one line */}
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-primary text-white text-xs font-bold shadow-sm">
              O
            </span>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-foreground tracking-tight whitespace-nowrap">OAK Global International</span>
              <span className="hidden text-xs text-muted-foreground sm:inline-block whitespace-nowrap">· Audit Workspace</span>
              {orgs.length > 1 ? (
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs text-muted-foreground">·</span>
                  <select
                    value={currentOrg?.id ?? ""}
                    onChange={(e) => setCurrentOrg(e.target.value)}
                    className="rounded-xl border border-border/80 bg-background/50 px-2.5 py-1 text-xs font-medium text-foreground focus:outline-none transition hover:bg-secondary"
                  >
                    {orgs.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} {org.type === "individual" ? "(personal)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                currentOrg?.name && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{currentOrg.name}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <Link
            to="/app/wallet"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium transition hover:bg-secondary"
          >
            <WalletIcon className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">{balance ?? 0}</span>
            <span className="text-muted-foreground">credit{balance === 1 ? "" : "s"} · Top up</span>
          </Link>
        </header>

        <main className="mx-auto max-w-[1600px] px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
};
