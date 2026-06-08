import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ReactNode, useEffect, useRef, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Receipt,
  Settings,
  Sun,
  User,
  Users,
  Wallet as WalletIcon,
  Workflow,
  Lock,
  LifeBuoy,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import logo from "@/assets/logo.png";

const ORG_NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/licenses", label: "Audit Packs", icon: Receipt },
  { to: "/app/processes", label: "Processes", icon: Workflow },
  { to: "/app/team", label: "My Team", icon: Users },
  { to: "/app/question-bank", label: "Question Banks", icon: BookOpen },
  { to: "/app/audits", label: "My Audits", icon: ClipboardCheck },
  { to: "/app/findings", label: "Findings", icon: AlertTriangle },
  { to: "/app/mrm", label: "Management Review", icon: FileText },
  { to: "/contact", label: "Help & Support", icon: LifeBuoy },
];

const INDIVIDUAL_NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/licenses", label: "Audit Packs", icon: Receipt },
  { to: "/app/processes", label: "Processes", icon: Workflow },
  { to: "/app/question-bank", label: "Question Banks", icon: BookOpen },
  { to: "/app/audits", label: "My Audits", icon: ClipboardCheck },
  { to: "/app/findings", label: "Findings", icon: AlertTriangle },
  { to: "/contact", label: "Help & Support", icon: LifeBuoy },
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const { orgs, currentOrg, setCurrentOrg } = useOrg();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  /* ── Wallet balance & Real-time Sync ─────────────────────────── */
  useEffect(() => {
    if (!currentOrg) return;
    
    // Initial load
    supabase
      .from("credit_wallets")
      .select("balance")
      .eq("org_id", currentOrg.id)
      .maybeSingle()
      .then(({ data }) => setBalance(data?.balance ?? 0));

    // Real-time subscription
    const channel = supabase
      .channel(`appshell_wallet_${currentOrg.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "credit_wallets",
          filter: `org_id=eq.${currentOrg.id}`,
        },
        (payload: any) => {
          setBalance(payload.new?.balance ?? 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const addressData = useMemo(() => {
    if (!currentOrg?.address) return null;
    try {
      return JSON.parse(currentOrg.address);
    } catch {
      return null;
    }
  }, [currentOrg]);

  const isIndividual = currentOrg?.type === "individual";

  const isCompanyPendingReview = useMemo(() => {
    // Both individual and organization accounts go through compliance admin review
    return currentOrg && addressData?.reviewStatus !== "approved";
  }, [currentOrg, addressData]);

  const isLockedRoute = useMemo(() => {
    const path = location.pathname;
    return path.startsWith("/app") && path !== "/app" && path !== "/app/settings";
  }, [location.pathname]);

  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const displayName = fullName.split(" ")[0];
  const displayEmail = user?.email ?? "";
  const NAV = isIndividual ? INDIVIDUAL_NAV : ORG_NAV;

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col overflow-y-auto flex-1">
        {/* Account header - personal card for individual, workspace for org */}
        <div className="px-4 pt-5 pb-2">
          {isIndividual ? (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2.5 flex items-center gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-foreground">{displayName}</div>
                <div className="text-[11px] text-muted-foreground">Personal account</div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-secondary/60 px-3 py-2.5 flex items-center gap-3">
              {currentOrg?.logo_url ? (
                <img src={currentOrg.logo_url} alt="Workspace Logo" className="h-9 w-9 rounded-xl object-cover shrink-0 border border-border bg-background" />
              ) : (
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-4.5 w-4.5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Current workspace</div>
                <div className="mt-0.5 truncate text-sm font-bold text-foreground">
                  {currentOrg?.name ?? "Loading..."}
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">Team audit command</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`px-3 py-4 ${isIndividual ? "space-y-2" : "space-y-1.5"}`}>
          {NAV.map(({ to, label, icon: Icon, end }) => {
            const isLocked = isCompanyPendingReview && to !== "/app" && to !== "/app/settings";
            return (
              <NavLink
                key={to}
                to={isLocked ? "#" : to}
                end={end}
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault();
                    toast({
                      title: "Workspace under review",
                      description: "Your organization workspace is currently being reviewed by compliance administrators. Access to this section will be unlocked once approved.",
                    });
                    return;
                  }
                  setIsMobileOpen(false);
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3.5 ${isIndividual ? "py-3" : "py-2"} text-sm font-medium transition ${
                    isLocked
                      ? "text-muted-foreground/30 cursor-not-allowed select-none"
                      : isActive
                      ? "bg-primary text-primary-foreground shadow-card"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`
                }
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span className="flex-1 truncate whitespace-nowrap">{label}</span>
                {isLocked ? (
                  <Lock className="h-3.5 w-3.5 shrink-0 opacity-40 text-warning" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" />
                )}
              </NavLink>
            );
          })}
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

        {/* User card linking directly to Settings */}
        <Link
          to="/app/settings"
          onClick={() => setIsMobileOpen(false)}
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background/70 px-3.5 py-2.5 text-left transition duration-200 hover:bg-secondary group"
        >
          {!isIndividual && currentOrg?.logo_url ? (
            <img src={currentOrg.logo_url} alt="Company Logo" className="h-8 w-8 rounded-full object-cover shrink-0 border border-border" />
          ) : (
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-150">{displayName}</div>
            <div className="truncate text-[11px] text-muted-foreground">{displayEmail}</div>
          </div>
          <Settings className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:rotate-45 group-hover:text-foreground" />
        </Link>
        <div className="pt-2 text-[10px] text-center text-muted-foreground/60 select-none font-medium">
          © {new Date().getFullYear()} ISO AUDIT PORT. All rights reserved.
        </div>
      </div>
    </div>
  );

  const renderUnderReviewBlock = () => {
    const cleanIndividualName = isIndividual ? (currentOrg?.name ?? "").replace(/'s workspace$/, "") : (currentOrg?.name ?? "");
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 text-center animate-fade-in">
        <div className="max-w-2xl w-full rounded-[32px] border border-border bg-card/60 backdrop-blur-md p-8 sm:p-10 shadow-elevated space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 text-warning animate-pulse">
            <AlertTriangle className="h-8 w-8" />
          </div>
          
          <div>
            <span className="inline-flex items-center rounded-full bg-warning/10 px-3 py-1 text-xs font-bold text-warning tracking-wide uppercase">
              {isIndividual ? "Account Under Review" : "Workspace Under Review"}
            </span>
            <h2 className="mt-4 font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isIndividual ? "Your auditor environment is being configured" : "Your ISO environment is being configured"}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {isIndividual 
                ? "Platform compliance administrators are reviewing your auditor profile details to activate your account and configure your pricing allocation."
                : "Platform compliance administrators are reviewing your company profile details to assess organizational size and activate tailored pricing structures for your audit runs."}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/30 p-5 text-left space-y-3.5">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {isIndividual ? "Submitted Profile Data" : "Submitted Company Data"}
            </div>
            
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-muted-foreground block">{isIndividual ? "Auditor Name" : "Company Name"}</span>
                <span className="font-semibold text-foreground">{cleanIndividualName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{isIndividual ? "Field of Expertise" : "Industry Sector"}</span>
                <span className="font-semibold text-foreground">{currentOrg?.industry || "Not set"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{isIndividual ? "Years of Experience" : "Company Strength / Size"}</span>
                <span className="font-semibold text-foreground">{isIndividual ? (addressData?.size ? `${addressData.size} years` : "Not set") : addressData?.size || "Not set"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{isIndividual ? "Professional Website" : "Corporate Website"}</span>
                <span className="font-semibold text-foreground">{addressData?.website || "Not set"}</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-border/50 text-[11px]">
              <span className="text-muted-foreground block">{isIndividual ? "Contact Address" : "Location / Address"}</span>
              <span className="font-semibold text-foreground">{addressData?.address || "Not set"}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground leading-normal flex items-center justify-center gap-2">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warning animate-ping animate-duration-1000" />
              Status: Awaiting Admin Approval
            </span>
            <span>·</span>
            <span>You will be notified immediately upon approval</span>
          </div>

          <div className="pt-2 flex flex-wrap gap-3 justify-center">
            <Link to="/app" className="pill-secondary justify-center text-xs px-5 py-2.5">
              ← Back to Dashboard
            </Link>
            <Link to="/app/settings" className="pill-cta justify-center text-xs px-5 py-2.5">
              Update Profile Details
            </Link>
            <button
              onClick={async () => {
                await signOut();
                window.location.href = "/auth";
              }}
              className="rounded-2xl border border-destructive/20 hover:border-destructive/40 bg-background hover:bg-destructive/5 px-5 py-2.5 text-xs font-semibold text-destructive transition duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  };

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

      {/* ── Sidebar (Desktop) ────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 overflow-hidden border-r border-border/80 bg-card/95 backdrop-blur lg:block">
        {renderSidebarContent()}
      </aside>

      {/* ── Mobile Navigation Drawer Backdrop ─────────────────────── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ── Mobile Navigation Drawer Sidebar ──────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 overflow-hidden border-r border-border/80 bg-card/95 backdrop-blur-md transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Sidebar Header with Close button */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-secondary/30">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-6 w-auto shrink-0 object-contain" />
            <span className="font-display font-bold text-xs text-foreground uppercase tracking-wider">Navigation</span>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="rounded-lg p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="h-[calc(100%-49px)] overflow-hidden">
          {renderSidebarContent()}
        </div>
      </aside>

      {/* ── Main content area ────────────────────────────────────── */}
      <div className="lg:pl-64">
        {/* App header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/70 bg-card/80 px-4 sm:px-6 backdrop-blur">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background/50 text-muted-foreground transition hover:bg-secondary hover:text-foreground lg:hidden animate-fade-in"
              aria-label="Open menu"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>

            <img src={logo} alt="Logo" className="h-7 w-auto shrink-0 object-contain hidden min-[380px]:block" />
            
            <div className="flex flex-col min-w-0">
              <span className="font-display text-xs sm:text-sm font-bold text-foreground tracking-tight whitespace-nowrap leading-none">
                ISO AUDIT PORT
              </span>
              <span className="text-[8px] sm:text-[9px] text-muted-foreground font-normal tracking-wide mt-0.5 leading-none">
                powered by Oak Global
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 min-w-0">
              {orgs.length > 1 ? (
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-xs text-muted-foreground shrink-0">·</span>
                  <select
                    value={currentOrg?.id ?? ""}
                    onChange={(e) => setCurrentOrg(e.target.value)}
                    className="rounded-xl border border-border/80 bg-background/50 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-medium text-foreground focus:outline-none transition hover:bg-secondary truncate max-w-[90px] sm:max-w-none"
                  >
                    {orgs.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : isIndividual ? (
                <>
                  <span className="text-xs text-muted-foreground shrink-0">·</span>
                  <span className="text-xs font-medium text-muted-foreground truncate max-w-[85px] sm:max-w-none">{displayName}</span>
                </>
              ) : (
                currentOrg?.name && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs text-muted-foreground shrink-0">·</span>
                    <span className="text-xs font-medium text-muted-foreground truncate max-w-[85px] sm:max-w-none">{currentOrg.name}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <Link
            to="/app/wallet"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-medium transition hover:bg-secondary shrink-0"
          >
            <WalletIcon className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-semibold text-foreground">{balance ?? 0}</span>
            <span className="text-muted-foreground hidden sm:inline">credit{balance === 1 ? "" : "s"} · Top up</span>
            <span className="text-muted-foreground sm:hidden">cr</span>
          </Link>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10">
          {isCompanyPendingReview && isLockedRoute ? renderUnderReviewBlock() : children}
        </main>
      </div>
    </div>
  );
};
