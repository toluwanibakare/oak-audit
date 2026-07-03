import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";

const SKIP_ONBOARDING_KEY = "oak.skip_onboarding";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const { currentOrg } = useOrg();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }
  if (
    currentOrg &&
    !currentOrg.industry &&
    !location.pathname.startsWith("/app/settings") &&
    !localStorage.getItem(SKIP_ONBOARDING_KEY)
  ) {
    return <Navigate to="/app/settings" replace />;
  }
  return children;
};