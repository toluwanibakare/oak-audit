import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const SiteNav = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="relative z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <span className="font-display text-base font-bold">O</span>
          </span>
          <span className="font-display text-base font-semibold tracking-tight">
            OAK Global<span className="ml-1 text-muted-foreground">ISO Audit</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="/#features" className="hover:text-foreground">Features</a>
          <a href="/#pricing" className="hover:text-foreground">Pricing</a>
          <a href="/#how" className="hover:text-foreground">How it works</a>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/app" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
              <button
                onClick={async () => { await signOut(); navigate("/"); }}
                className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
              <Link to="/auth?mode=signup" className="pill-cta px-5 py-2.5">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};