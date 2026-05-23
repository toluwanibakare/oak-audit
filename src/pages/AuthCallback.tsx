import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * AuthCallback
 *
 * Supabase verification emails redirect here with either:
 *   - A PKCE code:  ?code=xxx  (newer flow)
 *   - A token hash: #access_token=xxx&type=signup  (legacy/magic-link flow)
 *
 * We call exchangeCodeForSession() which handles both cases.
 * Once the session is established the user is redirected to /app.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // exchangeCodeForSession reads the ?code= query param automatically
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error) {
          // If there's no code param (legacy hash flow), Supabase's
          // onAuthStateChange in useAuth will have already set the session.
          // Check if we have an active session before showing an error.
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            navigate("/app", { replace: true });
            return;
          }
          throw error;
        }

        navigate("/app", { replace: true });
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err?.message ?? "Verification failed. Please try again.");
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div className="space-y-4">
          <p className="text-2xl font-bold text-foreground">Verification failed</p>
          <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
          <button
            onClick={() => navigate("/auth")}
            className="pill-cta px-6 py-2 text-sm font-semibold"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center">
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <svg
          className="h-8 w-8 animate-spin text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        Verifying your email, please wait…
      </div>
    </div>
  );
};

export default AuthCallback;
