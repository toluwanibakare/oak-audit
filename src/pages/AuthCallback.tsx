import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("oa_token");
    if (token) {
      navigate("/app", { replace: true });
    } else {
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div className="space-y-4">
          <p className="text-2xl font-bold text-foreground">Verification Failed</p>
          <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
          <button
            onClick={() => navigate("/auth")}
            className="pill-cta px-6 py-2 text-sm font-semibold"
          >
            Back To Sign In
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
