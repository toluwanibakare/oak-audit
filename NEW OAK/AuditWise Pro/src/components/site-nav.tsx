import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";
import { X } from "lucide-react";

export const SiteNav = () => {
  const { user, loading, signOut } = useAuth();
  const location = useRouterState({ select: (s) => s.location });
  const [showLogout, setShowLogout] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isAuthPage = location.pathname === "/auth";
  const searchParams = new URLSearchParams(location.search);
  const authMode = searchParams.get("mode") || "signin";

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
      <header className="relative z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-9 w-auto" />
            <span className="font-display">
              <span className="block text-base font-semibold tracking-tight leading-none">OakAudix</span>
              <span className="block text-[10px] text-muted-foreground font-normal tracking-wide mt-0.5">Powered By Oak Global International</span>
            </span>
          </Link>
          {!isAuthPage && (
            <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
              <a href="/#features" className="hover:text-foreground">Features</a>
              <a href="/#pricing" className="hover:text-foreground">Pricing</a>
              <a href="/#how" className="hover:text-foreground">How It Works</a>
            </nav>
          )}
          <div className="flex items-center gap-3">
            {loading ? null : user ? (
              <>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
                <button
                  onClick={() => setShowLogout(true)}
                  className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Sign In</Link>
                <Link to="/auth?mode=signup" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition duration-200">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
