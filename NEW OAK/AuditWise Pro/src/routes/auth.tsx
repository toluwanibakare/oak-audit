import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { authApi } from "@/lib/api/auth";
import { orgsApi } from "@/lib/api/orgs";
import { useAuth } from "@/hooks/use-auth";
import { SiteNav } from "@/components/site-nav";
import { 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  Eye,
  EyeOff,
  Globe, 
  Lock, 
  Mail, 
  MapPin, 
  Phone, 
  User 
} from "lucide-react";

const passwordRules = [
  { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "One number (0-9)", test: (p: string) => /[0-9]/.test(p) },
  { id: "symbol", label: "One special character (!@#$…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100)
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const step2Schema = z.object({
  orgName: z.string().trim().min(1, "Organization name is required").max(200),
  industry: z.string().trim().min(1, "Industry is required"),
  orgAddress: z.string().trim().max(500).optional(),
});

const step1Schema = z.object({
  full_name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9]/, "Password must contain a symbol"),
});

const signinSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

const INDUSTRIES = [
  "Oil & Gas", "Construction", "Manufacturing", "Healthcare", "ICT",
  "Logistics & Maritime", "Financial Services", "Public Sector", "Education", "Other",
];

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, string>) => ({
    mode: (search.mode as "signin" | "signup" | "forgot") || "signin",
  }),
  component: Auth,
});

function Auth() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(search.mode === "signup" || search.mode === "forgot" ? search.mode : "signin");

  const [busy, setBusy] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [signupOtp, setSignupOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [orgAddress, setOrgAddress] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);
  const RESEND_COOLDOWN = 60;
  const startResendTimer = () => {
    setResendTimer(RESEND_COOLDOWN);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigatingRef = useRef(false);

  const goToDashboard = () => {
    navigatingRef.current = true;
    setNavigating(true);
    window.location.href = "/dashboard";
  };

  useEffect(() => {
    if (user && !navigatingRef.current) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const switchMode = (newMode: "signin" | "signup" | "forgot") => {
    setRegistered(false);
    setStep(1);
    setOrgName("");
    setIndustry("");
    setOrgAddress("");
    setMode(newMode);
    try {
      navigate({ to: "/auth", search: { mode: newMode }, replace: true });
    } catch {}
  };

  const handleSendForgotPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setBusy(true);
    try {
      await authApi.forgotPassword({ email: forgotEmail });
      setOtpSent(true);
      startResendTimer();
    } catch (err: any) {
      const msg = err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(". ")
        : err?.response?.data?.error || err?.message || "Failed to send OTP";
    } finally {
      setBusy(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;
    const pwdCheck = passwordSchema.safeParse(newPassword);
    if (!pwdCheck.success) return;
    setBusy(true);

    try {
      await authApi.resetPassword({
        email: forgotEmail,
        otp: otpCode,
        password: newPassword,
        password_confirmation: newPassword,
      });

      setMode("signin");
      setForgotEmail("");
      setOtpSent(false);
      setOtpCode("");
      setNewPassword("");
    } catch (err: any) {
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (mode === "signup") {
      if (step === 1) {
        const parsed = step1Schema.safeParse({ full_name: fullName, email, password });
        if (!parsed.success) return;
        setStep(2);
        return;
      }

      setBusy(true);
      try {
        const parsed = step1Schema.safeParse({ full_name: fullName, email, password });
        if (!parsed.success) { setBusy(false); return; }

        const orgParsed = step2Schema.safeParse({ orgName, industry, orgAddress });
        if (!orgParsed.success) { setBusy(false); return; }

        const regResponse = await authApi.register({
          email: parsed.data.email,
          password: parsed.data.password,
          password_confirmation: parsed.data.password,
          full_name: parsed.data.full_name,
          newsletter,
        });

        if (regResponse.access_token) {
          localStorage.setItem("oa_token", regResponse.access_token);
          await refreshUser();
          try {
            await orgsApi.create({ name: orgParsed.data.orgName, industry: orgParsed.data.industry, address: orgParsed.data.orgAddress || undefined, type: "organization" });
          } catch {}
          goToDashboard();
          setBusy(false);
          return;
        }

        sessionStorage.setItem("oa_pending_org", JSON.stringify({ name: orgParsed.data.orgName, industry: orgParsed.data.industry, address: orgParsed.data.orgAddress || undefined, type: "organization" }));
        setRegistered(true);
      } catch (err: any) {
        if (err?.response?.data?.needs_verification && err?.response?.data?.email) {
          setEmail(err.response.data.email);
          sessionStorage.setItem("oa_pending_org", JSON.stringify({ name: orgName, industry, address: orgAddress || undefined, type: "organization" }));
          setRegistered(true);
          setBusy(false);
          return;
        }
      } finally {
        setBusy(false);
      }
    } else {
      const parsed = signinSchema.safeParse({ email, password });
      if (!parsed.success) return;

      setBusy(true);
      try {
        localStorage.setItem("oa_remember_me", rememberMe ? "true" : "false");
        sessionStorage.setItem("oa_session_marker", "true");

        const result = await authApi.login({
          email: parsed.data.email,
          password: parsed.data.password,
        });

        localStorage.setItem("oa_token", result.access_token);
        await refreshUser();
        goToDashboard();
      } finally {
        setBusy(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--surface)] via-background to-[var(--surface)]">
      {navigating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading dashboard...</p>
          </div>
        </div>
      )}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-[0.08]"
        style={{
          backgroundImage: `linear-gradient(var(--steel) 1px, transparent 1px), linear-gradient(90deg, var(--steel) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] overflow-hidden">
        <div className="orb right-[-120px] top-[-80px] h-[460px] w-[460px]" />
        <div className="orb left-[-100px] top-[300px] h-[260px] w-[260px] opacity-30" />
      </div>
      <SiteNav />

      <main className="mx-auto flex max-w-lg flex-col px-6 py-10">
        {registered ? (
          <div className="mt-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="text-center space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h1 className="font-display text-xl font-bold tracking-tight text-foreground">Verify Your Email</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-semibold text-foreground">{email}</span>
                </p>
              </div>

              <div className="max-w-[200px] mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="input w-full text-center font-mono font-bold text-2xl tracking-[8px] h-14"
                  value={signupOtp}
                  onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && signupOtp.length === 6 && !busy) {
                      document.getElementById("verify-otp-btn")?.click();
                    }
                  }}
                />
              </div>

              {signupOtp.length < 6 && signupOtp.length > 0 && (
                <p className="text-xs text-muted-foreground -mt-2">
                  {6 - signupOtp.length} digit(s) remaining
                </p>
              )}

              <button
                id="verify-otp-btn"
                disabled={signupOtp.length !== 6 || busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const result = await authApi.verifyOtp({ email, otp: signupOtp });
                    localStorage.setItem("oa_token", result.token);
                    await refreshUser();

                    const pendingOrg = sessionStorage.getItem("oa_pending_org");
                    if (pendingOrg) {
                      try {
                        await orgsApi.create(JSON.parse(pendingOrg));
                      } catch (orgErr) {
                        console.error("Org creation after verification failed", orgErr);
                      }
                      sessionStorage.removeItem("oa_pending_org");
                    }

                    goToDashboard();
                  } catch (err: any) {
                    setSignupOtp("");
                  } finally {
                    setBusy(false);
                  }
                }}
                className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 cursor-pointer"
              >
                {busy ? "Verifying..." : "Verify & Continue"}
              </button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <span className="text-xs text-muted-foreground">
                    Resend available in {resendTimer}s
                  </span>
                ) : (
                  <button
                    disabled={resending}
                    onClick={async () => {
                      setResending(true);
                      try {
                        await authApi.forgotPassword({ email });
                        startResendTimer();
                      } catch {
                      } finally {
                        setResending(false);
                      }
                    }}
                    className="text-xs font-medium text-primary hover:underline transition disabled:opacity-50 cursor-pointer"
                  >
                    {resending ? "Sending..." : "Resend Code"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {mode === "signup"
                ? (step === 1 ? "Create Your Account" : "About Your Company")
                : (mode === "forgot" ? "Reset Password" : "Welcome Back")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signup"
                ? (step === 1 ? "Step 1 of 2: Your personal details." : "Step 2 of 2: Tell us about your organization.")
                : (mode === "forgot" ? "Retrieve Access To Your OakAudix Workspace." : "Sign In To Your OakAudix Workspace.")}
            </p>

            {mode === "signup" && (
              <div className="mt-6 mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-primary">{step === 1 ? "Step 1" : "Step 2"}</span>
                  <span className="text-xs text-muted-foreground font-semibold">{step === 1 ? "50%" : "100%"} Complete</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out rounded-full" style={{ width: step === 1 ? "50%" : "100%" }} />
                </div>
              </div>
            )}

            {mode === "forgot" ? (
              <form onSubmit={otpSent ? handleResetPasswordSubmit : handleSendForgotPasswordOtp} className="mt-6 space-y-4">
                {!otpSent ? (
                  <>
                    <Field
                      label="Account Email Address"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      icon={Mail}
                      placeholder="you@company.com"
                      required
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full rounded-md bg-primary h-11 text-sm font-semibold text-primary-foreground flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 mt-2 cursor-pointer"
                    >
                      {busy ? "Sending OTP..." : "Send Reset OTP"}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground text-center">
                      Enter the OTP sent to <strong>{forgotEmail}</strong> and choose a new password.
                    </p>
                    <Field
                      label="OTP Code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      icon={Lock}
                      placeholder="000000"
                      required
                    />
                    <PasswordField
                      label="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full rounded-md bg-primary h-11 text-sm font-semibold text-primary-foreground flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 mt-2 cursor-pointer"
                    >
                      {busy ? "Resetting..." : "Reset Password & Sign In"}
                    </button>

                    <div className="text-center">
                      {resendTimer > 0 ? (
                        <span className="text-xs text-muted-foreground">
                          Resend OTP available in {resendTimer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={resending}
                          onClick={async () => {
                            setResending(true);
                            try {
                              await authApi.forgotPassword({ email: forgotEmail });
                              startResendTimer();
                            } catch {
                            } finally {
                              setResending(false);
                            }
                          }}
                          className="text-xs font-medium text-primary hover:underline transition disabled:opacity-50 cursor-pointer"
                        >
                          {resending ? "Sending..." : "Resend OTP"}
                        </button>
                      )}
                    </div>
                  </>
                )}

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="font-semibold text-foreground hover:underline transition cursor-pointer"
                  >
                    Back To Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {mode === "signup" && step === 1 && (
                  <Field
                    label="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    icon={User}
                    placeholder="e.g. Adaeze Okonkwo"
                    required
                  />
                )}
                {mode === "signup" && step === 1 && (
                  <Field
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={Mail}
                    placeholder="you@company.com"
                    required
                  />
                )}
                {mode === "signup" && step === 1 && (
                  <PasswordField
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    showRules
                  />
                )}
                {mode === "signup" && step === 2 && (
                  <>
                    <Field
                      label="Organization name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      icon={Building2}
                      placeholder="e.g. OAK Global International"
                      required
                    />
                    <Field
                      label="Industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      icon={Globe}
                      placeholder="e.g. Oil & Gas, Manufacturing, Healthcare"
                      required
                    />
                    <Field
                      label="Address (optional)"
                      value={orgAddress}
                      onChange={(e) => setOrgAddress(e.target.value)}
                      icon={MapPin}
                      placeholder="Your organization's address"
                    />
                  </>
                )}
                {mode === "signin" && (
                  <>
                    <Field
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      icon={Mail}
                      placeholder="you@company.com"
                      required
                    />
                    <PasswordField
                      label="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <div className="flex items-center justify-between -mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                        />
                        <span className="text-xs text-muted-foreground">Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </>
                )}
                {mode === "signup" && step === 2 && (
                  <div className="space-y-3">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                      />
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        I agree to the{" "}
                        <Link to="/terms" className="text-primary font-semibold hover:underline">Terms of Service</Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link>
                      </span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newsletter}
                        onChange={(e) => setNewsletter(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                      />
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        Send me product updates and tips (optional)
                      </span>
                    </label>
                  </div>
                )}
                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={busy ||
                      (mode === "signup" && step === 1 && (!fullName.trim() || !email.trim() || password.length < 8)) ||
                      (mode === "signup" && step === 2 && (!orgName.trim() || !industry.trim() || !termsAccepted))}
                    className="w-full rounded-md bg-primary h-11 text-sm font-semibold text-primary-foreground flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
                  >
                    {busy ? "Please wait..." : (
                      mode === "signup" ? (
                        step === 1 ? (
                          <><ArrowRight className="h-4 w-4" /> Continue</>
                        ) : (
                          <><CheckCircle2 className="h-4 w-4" /> Create Account</>
                        )
                      ) : "Sign In"
                    )}
                  </button>
                  {mode === "signup" && step === 2 && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full rounded-md border border-border h-11 text-sm font-semibold text-muted-foreground flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:bg-secondary/50 cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                  )}
                </div>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signup" ? (
                <>Already have an account?{" "}
                  <button onClick={() => switchMode("signin")} className="font-semibold text-foreground hover:underline transition cursor-pointer">Sign In</button>
                </>
              ) : (
                <>New to OakAudix?{" "}
                  <button onClick={() => switchMode("signup")} className="font-semibold text-foreground hover:underline transition cursor-pointer">Create An Account</button>
                </>
              )}
            </div>
          </div>
        )}

        <Link to="/" className="mx-auto mt-6 text-xs text-muted-foreground hover:text-foreground transition">
          ← Back To Home
        </Link>
      </main>
    </div>
  );
}

const Field = ({
  label,
  icon: Icon,
  ...rest
}: any) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    <div className="relative rounded-xl shadow-sm">
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Icon className="h-4 w-4 text-muted-foreground/80" />
        </div>
      )}
      <input
        {...rest}
        className={`h-11 w-full rounded-xl border border-border bg-background/50 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
          Icon ? "pl-10 pr-4" : "px-3.5"
        }`}
      />
    </div>
  </label>
);

const SelectField = ({
  label,
  icon: Icon,
  children,
  ...rest
}: {
  label: string;
  icon?: any;
  children: React.ReactNode
} & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    <div className="relative rounded-xl shadow-sm">
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Icon className="h-4 w-4 text-muted-foreground/80" />
        </div>
      )}
      <select
        {...rest}
        className={`h-11 w-full rounded-xl border border-border bg-background/50 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 cursor-pointer ${
          Icon ? "pl-10 pr-8" : "px-3.5"
        }`}
      >
        {children}
      </select>
    </div>
  </label>
);

const TextareaField = ({
  label,
  icon: Icon,
  ...rest
}: {
  label: string;
  icon?: any
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    <div className="relative rounded-xl shadow-sm">
      {Icon && (
        <div className="pointer-events-none absolute top-3.5 left-3.5">
          <Icon className="h-4 w-4 text-muted-foreground/80" />
        </div>
      )}
      <textarea
        {...rest}
        className={`w-full rounded-xl border border-border bg-background/50 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 pt-2.5 min-h-[72px] resize-none ${
          Icon ? "pl-10 pr-4" : "px-3.5"
        }`}
      />
    </div>
  </label>
);

const PasswordField = ({
  label,
  showRules,
  value,
  ...rest
}: {
  label: string;
  showRules?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) => {
  const [show, setShow] = useState(false);
  const pwd = typeof value === "string" ? value : "";
  const hasFocus = pwd.length > 0;
  return (
    <div className="block">
      <label>
        <span className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="relative rounded-xl shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Lock className="h-4 w-4 text-muted-foreground/80" />
          </div>
          <input
            {...rest}
            value={value}
            type={show ? "text" : "password"}
            className="h-11 w-full rounded-xl border border-border bg-background/50 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 pl-10 pr-11"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            tabIndex={-1}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </label>
      {showRules && hasFocus && (
        <div className="mt-2.5 rounded-lg border border-border/60 bg-muted/40 px-3.5 py-2.5 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Password requirements</p>
          {passwordRules.map((rule) => {
            const passed = rule.test(pwd);
            return (
              <div key={rule.id} className={`flex items-center gap-2 text-xs transition-colors ${passed ? "text-emerald-500" : "text-muted-foreground/70"}`}>
                <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold transition-all ${
                  passed ? "border-emerald-500 bg-emerald-500 text-white" : "border-border"
                }`}>
                  {passed ? "✓" : ""}
                </span>
                {rule.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
