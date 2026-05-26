import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";

type SiteNavProps = {
  onSwitchToSignIn?: () => void;
  onSwitchToSignUp?: () => void;
};

export const SiteNav = ({ onSwitchToSignIn, onSwitchToSignUp }: SiteNavProps = {}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === "/auth";
  const params = new URLSearchParams(location.search);
  const isSignUpMode = params.get("mode") === "signup";

  return (
    <header className="relative z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="OAK Logo" className="h-9 w-auto" />
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
                onClick={async () => { await signOut(); navigate("/auth"); }}
                className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              {isAuthPage ? (
                isSignUpMode ? (
                  <button
                    onClick={() => onSwitchToSignIn ? onSwitchToSignIn() : navigate("/auth")}
                    className="rounded-full bg-secondary px-5 py-2 text-sm font-medium text-foreground hover:bg-muted transition duration-200"
                  >
                    Sign in
                  </button>
                ) : (
                  <button
                    onClick={() => onSwitchToSignUp ? onSwitchToSignUp() : navigate("/auth?mode=signup")}
                    className="pill-cta px-5 py-2.5"
                  >
                    Sign up
                  </button>
                )
              ) : (
                <>
                  <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
                  <Link to="/auth?mode=signup" className="pill-cta px-5 py-2.5">Sign up</Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};