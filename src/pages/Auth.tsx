import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SiteNav } from "@/components/SiteNav";
import { 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  Globe, 
  Hash, 
  Lock, 
  Mail, 
  MapPin, 
  Phone, 
  TextQuote, 
  User 
} from "lucide-react";

// Validation schemas
const step1Schema = z.object({
  full_name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

const step2Schema = z.object({
  org_name: z.string().trim().min(2, "Organization name must be at least 2 characters").max(150),
  industry: z.string().min(1, "Please select your industry"),
  website: z.string().trim().min(4, "Please enter a valid website domain or URL"),
  phone: z.string().trim().min(5, "Contact phone number is required").max(50),
  size: z.string().min(1, "Please select your company size"),
  address: z.string().trim().min(5, "Office address is required").max(500),
  description: z.string().trim().min(10, "Please provide a description of at least 10 characters").max(1000),
});

const signinSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

const INDUSTRIES = [
  "Oil & Gas", "Construction", "Manufacturing", "Healthcare", "ICT",
  "Logistics & Maritime", "Financial Services", "Public Sector", "Education", "Other",
];

const Auth = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"signin" | "signup">(
    params.get("mode") === "signup" ? "signup" : "signin",
  );
  
  // Multi-step signup flow states
  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] = useState<"individual" | "organization">("individual");
  const [busy, setBusy] = useState(false);

  // Form states to preserve inputs when navigating back/forth
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (user) navigate("/app", { replace: true });
  }, [user, navigate]);

  // Clean form when switching mode
  useEffect(() => {
    setStep(1);
  }, [mode]);

  const handleNextStep = () => {
    const parsed = step1Schema.safeParse({
      full_name: fullName,
      email: email,
      password: password,
    });
    
    if (!parsed.success) {
      toast({ 
        title: "Account Setup Error", 
        description: parsed.error.issues[0].message, 
        variant: "destructive" 
      });
      return;
    }
    
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    
    try {
      if (mode === "signup") {
        // Validate Step 1 fields
        const parsedStep1 = step1Schema.safeParse({
          full_name: fullName,
          email: email,
          password: password,
        });
        
        if (!parsedStep1.success) {
          toast({ 
            title: "Account Setup Error", 
            description: parsedStep1.error.issues[0].message, 
            variant: "destructive" 
          });
          setStep(1);
          setBusy(false);
          return;
        }

        let serializedAddress = "";
        let finalOrgName = undefined;
        let finalIndustry = undefined;

        if (accountType === "organization") {
          // Validate Step 2 fields
          const parsedStep2 = step2Schema.safeParse({
            org_name: orgName,
            industry: industry,
            website: website,
            phone: phone,
            size: size,
            address: address,
            description: description,
          });

          if (!parsedStep2.success) {
            toast({ 
              title: "Company Details Error", 
              description: parsedStep2.error.issues[0].message, 
              variant: "destructive" 
            });
            setBusy(false);
            return;
          }

          finalOrgName = parsedStep2.data.org_name;
          finalIndustry = parsedStep2.data.industry;
          
          // Serialize structured details to store in single address column
          serializedAddress = JSON.stringify({
            address: parsedStep2.data.address,
            website: parsedStep2.data.website,
            size: parsedStep2.data.size,
            phone: parsedStep2.data.phone,
            description: parsedStep2.data.description,
          });
        }

        const { error } = await supabase.auth.signUp({
          email: parsedStep1.data.email,
          password: parsedStep1.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: {
              full_name: parsedStep1.data.full_name,
              account_type: accountType,
              org_name: finalOrgName,
              industry: finalIndustry,
              address: serializedAddress || undefined,
            },
          },
        });
        
        if (error) throw error;
        toast({ 
          title: "Registration successful", 
          description: "Please check your email inbox to verify your account." 
        });
      } else {
        // Sign-in
        const parsed = signinSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast({ 
            title: "Sign In Error", 
            description: parsed.error.issues[0].message, 
            variant: "destructive" 
          });
          setBusy(false);
          return;
        }
        
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        
        if (error) throw error;
        navigate("/app", { replace: true });
      }
    } catch (err: any) {
      toast({ 
        title: "Authentication failed", 
        description: err.message ?? "Try again", 
        variant: "destructive" 
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDemo = async () => {
    setBusy(true);
    const demoEmail = "demo@oakglobal.app";
    const demoPass = "Oak-Demo!7xPq2NvR9zKt";
    try {
      let { error } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPass });
      if (error) {
        const { error: signUpErr } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPass,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { 
              full_name: "Demo User", 
              account_type: "organization", 
              org_name: "OAK Demo Org", 
              industry: "Construction" 
            },
          },
        });
        if (signUpErr) throw signUpErr;
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPass });
        if (signInErr) throw signInErr;
      }
      try { await supabase.rpc("grant_demo_credits"); } catch { /* non-fatal */ }
      navigate("/app", { replace: true });
    } catch (err: any) {
      toast({ title: "Demo sign-in failed", description: err.message ?? "Try again", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  // Determine width of our visual step progress bar
  const progressWidth = mode === "signin" ? "0%" : accountType === "individual" ? "100%" : step === 1 ? "50%" : "100%";

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradients */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] overflow-hidden">
        <div className="orb right-[-120px] top-[-80px] h-[460px] w-[460px]" />
        <div className="orb left-[-100px] top-[300px] h-[260px] w-[260px] opacity-50" />
      </div>
      
      <SiteNav />
      
      <main className="mx-auto flex max-w-lg flex-col px-6 py-10">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-elevated transition-all duration-300">
          
          {/* Visual Step Progress Indicator */}
          {mode === "signup" && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                  {accountType === "individual" 
                    ? "Step 1 of 1: Credentials" 
                    : `Step ${step} of 2: ${step === 1 ? "Credentials" : "Company Profile"}`}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  {accountType === "individual" ? "100%" : step === 1 ? "50%" : "100%"} Complete
                </span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                  style={{ width: progressWidth }}
                />
              </div>
            </div>
          )}

          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            {mode === "signup" 
              ? (step === 1 ? "Create your account" : "Tell us about your organization") 
              : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup" 
              ? (step === 1 ? "Start auditing in minutes." : "Required for determining your custom pricing tier.")
              : "Sign in to your OAK Global workspace."}
          </p>

          {/* Account Type Selector - Only visible in Step 1 of Sign Up */}
          {mode === "signup" && step === 1 && (
            <div className="mt-6 grid grid-cols-2 gap-2 rounded-full border border-border bg-secondary p-1">
              {(["individual", "organization"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAccountType(t)}
                  className={`rounded-full py-2 text-sm font-semibold capitalize transition-all duration-200 ${
                    accountType === t 
                      ? "bg-card shadow-card text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "individual" ? "Individual auditor" : "Organization"}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            
            {/* ── STEP 1 (SIGNUP) / SIGNIN FIELDS ── */}
            {step === 1 && (
              <>
                {mode === "signup" && (
                  <Field 
                    label="Full name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    icon={User}
                    placeholder="e.g. Adaeze Okonkwo" 
                    required 
                  />
                )}
                <Field 
                  label="Email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                  placeholder="you@company.com" 
                  required 
                />
                <Field 
                  label="Password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={Lock}
                  placeholder="••••••••" 
                  required 
                />
              </>
            )}

            {/* ── STEP 2 (ORGANIZATION DETAILS) ── */}
            {mode === "signup" && step === 2 && accountType === "organization" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
                <Field 
                  label="Organization name" 
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  icon={Building2}
                  placeholder="e.g. Lagos Port Authority" 
                  required 
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField 
                    label="Industry" 
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    icon={Building2}
                    required
                  >
                    <option value="">Select industry…</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </SelectField>

                  <SelectField 
                    label="Company size" 
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    icon={Hash}
                    required
                  >
                    <option value="">Select size…</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </SelectField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field 
                    label="Company website" 
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    icon={Globe}
                    placeholder="e.g. oak-global.com.ng" 
                    required 
                  />

                  <Field 
                    label="Contact phone number" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    icon={Phone}
                    placeholder="e.g. +234 800 000 0000" 
                    required 
                  />
                </div>

                <TextareaField 
                  label="Brief description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  icon={TextQuote}
                  placeholder="Describe your organization's business and audit needs..."
                  rows={2}
                  required 
                />

                <TextareaField 
                  label="Office address" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  icon={MapPin}
                  placeholder="Physical office address" 
                  rows={2}
                  required 
                />
              </div>
            )}

            {/* ── ACTION CONTROLS ── */}
            <div className="pt-2 flex gap-3">
              {/* Back button (Only visible in step 2 of Organization signup) */}
              {mode === "signup" && step === 2 && accountType === "organization" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setStep(1)}
                  className="rounded-full px-5 h-11 border border-border bg-background text-sm font-semibold hover:bg-secondary flex items-center justify-center gap-1.5 transition duration-200 disabled:opacity-60"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}

              {/* Submit / Next Button */}
              {mode === "signup" && step === 1 && accountType === "organization" ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="pill-cta flex-1 h-11 text-sm font-semibold flex items-center justify-center gap-1.5 transition duration-200"
                >
                  Continue to company profile
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={busy} 
                  className="pill-cta flex-1 h-11 text-sm font-semibold flex items-center justify-center gap-1.5 transition duration-200 disabled:opacity-60"
                >
                  {busy ? "Please wait…" : (
                    mode === "signup" ? (
                      <>
                        Create account
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    ) : "Sign in"
                  )}
                </button>
              )}
            </div>

            {/* Demo user fallback (Only visible on Sign In) */}
            {mode === "signin" && (
              <button
                type="button"
                onClick={handleDemo}
                disabled={busy}
                className="w-full h-11 rounded-xl border border-dashed border-muted-foreground/30 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-60"
              >
                Sign in as Demo User
              </button>
            )}
          </form>

          {/* Switch mode links */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="font-semibold text-foreground hover:underline transition">Sign in</button>
              </>
            ) : (
              <>New to OAK Global?{" "}
                <button onClick={() => setMode("signup")} className="font-semibold text-foreground hover:underline transition">Create an account</button>
              </>
            )}
          </div>
        </div>
        
        <Link to="/" className="mx-auto mt-6 text-xs text-muted-foreground hover:text-foreground transition">
          ← Back to home
        </Link>
      </main>
    </div>
  );
};

// ── CUSTOM STYLED UTILITY SUBCOMPONENTS ──

const Field = ({ 
  label, 
  icon: Icon, 
  ...rest 
}: { 
  label: string; 
  icon?: any 
} & React.InputHTMLAttributes<HTMLInputElement>) => (
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

export default Auth;