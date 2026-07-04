import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import SecuritySettings from "@/components/app/SecuritySettings";
import { Header } from "./Team";
import { auditorsApi } from "@/api/auditors";
import { orgsApi } from "@/api/orgs";
import { authApi } from "@/api/auth";

const SKIP_ONBOARDING_KEY = "oak.skip_onboarding";

export default function Settings() {
  const { currentOrg, refresh } = useOrg();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isIndividual = currentOrg?.type === "individual";
  const isForced = !currentOrg?.industry && !localStorage.getItem(SKIP_ONBOARDING_KEY);
  const [currentUserAuditor, setCurrentUserAuditor] = useState<any | undefined>(undefined);
  const [auditorName, setAuditorName] = useState("");
  
  // Structured form states
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [size, setSize] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const isDirty = useMemo(() => {
    if (!currentOrg) return false;
    
    const initialName = currentOrg.type === "individual"
      ? (user?.full_name || currentOrg.name)
      : currentOrg.name;
      
    const initialIndustry = currentOrg.industry ?? "";
    let initialAddress = "";
    let initialWebsite = "";
    let initialSize = "";
    let initialPhone = "";
    let initialDescription = "";
    
    const addr = currentOrg.address ?? "";
    if (addr.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(addr);
        initialAddress = parsed.address ?? "";
        initialWebsite = parsed.website ?? "";
        initialSize = parsed.size ?? "";
        initialPhone = parsed.phone ?? "";
        initialDescription = parsed.description ?? "";
      } catch (e) {
        initialAddress = addr;
      }
    } else {
      initialAddress = addr;
    }
    
    return (
      name.trim() !== initialName.trim() ||
      industry !== initialIndustry ||
      website.trim() !== initialWebsite.trim() ||
      size !== initialSize ||
      phone.trim() !== initialPhone.trim() ||
      address.trim() !== initialAddress.trim() ||
      description.trim() !== initialDescription.trim()
    );
  }, [currentOrg, user, name, industry, website, size, phone, address, description]);

  useEffect(() => {
    if (!user || !currentOrg) return;
    (async () => {
      try {
        const data = await auditorsApi.list(currentOrg.id);
        const match = data.find((a: any) => a.user_id === user.id) ?? null;
        setCurrentUserAuditor(match);
        setAuditorName(user?.full_name ?? "");
      } catch { setCurrentUserAuditor(null); }
    })();
  }, [user, currentOrg]);

  const isAuditor = currentUserAuditor?.role === "auditor";

  useEffect(() => {
    if (!currentOrg) return;
    const initialName = currentOrg.type === "individual"
      ? (user?.full_name || currentOrg.name)
      : currentOrg.name;
    setName(initialName);
    setIndustry(currentOrg.industry ?? "");
    
    // Parse the address field for structured JSON company metadata
    const addr = currentOrg.address ?? "";
    if (addr.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(addr);
        setAddress(parsed.address ?? "");
        setWebsite(parsed.website ?? "");
        setSize(parsed.size ?? "");
        setPhone(parsed.phone ?? "");
        setDescription(parsed.description ?? "");
        return;
      } catch (e) {
        // Fall back to plain address string
      }
    }
    setAddress(addr);
    setWebsite("");
    setSize("");
    setPhone("");
    setDescription("");
  }, [currentOrg]);

  const save = async () => {
    if (!currentOrg) return;
    
    const parsedAddr = (() => {
      if (!currentOrg?.address) return null;
      try { return JSON.parse(currentOrg.address); } catch { return null; }
    })();

    // Serialize additional properties inside the address column to stay robust without migrations
    const serializedAddress = JSON.stringify({
      address,
      website,
      size,
      phone,
      description,
      reviewStatus: parsedAddr?.reviewStatus || "pending"
    });

    const finalName = name;

    try {
      await orgsApi.update(currentOrg.id, {
        name: finalName,
        industry,
        address: serializedAddress,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || "Failed to save";
      return toast({ title: msg, variant: "destructive" });
    }

    toast({ title: "Profile settings saved successfully." });
    refresh();
  };

  const uploadLogo = async (file: File) => {
    if (!currentOrg) return;
    setUploading(true);
    try {
      await orgsApi.uploadLogo(currentOrg.id, file);
      await refresh();
      toast({ title: isIndividual ? "Profile photo updated successfully." : "Logo updated successfully." });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || "Upload failed";
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    }
    setUploading(false);
  };

  if (currentUserAuditor === undefined) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header 
        title="Profile Settings" 
        subtitle={isIndividual ? "Update your personal profile, professional details, and contact info." : "Update your organization profile, contact info, and business details."} 
      />

      {isForced && (
        <div className="mt-4 rounded-2xl border border-gold bg-gold/5 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-gold">Required</span>
            <p className="text-sm text-foreground">
              Please complete your profile details before using the workspace.
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.setItem(SKIP_ONBOARDING_KEY, "true");
              navigate("/app");
            }}
            className="shrink-0 rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs font-semibold hover:bg-secondary transition"
          >
            Skip for now
          </button>
        </div>
      )}
      
      {isAuditor ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-card">
            <h3 className="font-display text-lg font-bold text-foreground">My Account</h3>
            <p className="text-xs text-muted-foreground mt-1">Your personal account information.</p>
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <Field label="Full name">
                <div className="flex gap-2">
                  <input className="input flex-1" value={auditorName} onChange={(e) => setAuditorName(e.target.value)} placeholder="Your full name" />
                  <button
                    onClick={async () => {
                      try {
                        await authApi.updateName(auditorName);
                        toast({ title: "Name updated successfully" });
                      } catch (err: any) {
                        toast({ title: err?.response?.data?.error || "Failed to update name", variant: "destructive" });
                      }
                    }}
                    className={`pill-cta text-xs ${auditorName === (user?.full_name ?? "") ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={auditorName === (user?.full_name ?? "")}
                  >
                    Save
                  </button>
                </div>
              </Field>
              <Field label="Email address">
                <input className="input" value={user?.email ?? ""} disabled />
              </Field>
            </div>
            <div className="pt-2 border-t border-border mt-6 flex flex-wrap gap-4 items-center justify-between">
              <button
                onClick={async () => {
                  try { await authApi.logout(); } catch {}
                  signOut();
                  navigate("/auth");
                }}
                className="rounded-2xl border border-destructive/30 hover:border-destructive/60 bg-background/50 hover:bg-destructive/10 px-5 py-2.5 text-xs font-semibold text-destructive transition duration-200"
              >
                Sign out of account
              </button>
            </div>
          </div>
          <SecuritySettings />
        </div>
      ) : (
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left column: Profile Details Form */}
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6 lg:col-span-2 shadow-card">
          <h3 className="font-display text-lg font-bold text-foreground">
            {isIndividual ? "Personal Profile" : "Company Profile"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isIndividual 
              ? "This information will be reviewed by the OAK Global team to determine custom pricing tiers for your audit runs."
              : "This information will be reviewed by the OAK Global team to determine custom pricing tiers for your organization."}
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <Field label={isIndividual ? "Full name" : "Organization name"}>
              <input 
                className="input" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder={isIndividual ? "e.g. Adaeze Okonkwo" : "e.g. OakAudix"} 
              />
            </Field>

            <Field label={isIndividual ? "Professional website / Portfolio" : "Company website"}>
              <input 
                className="input" 
                value={website} 
                onChange={(e) => setWebsite(e.target.value)} 
                placeholder={isIndividual ? "e.g. www.adaeze-okonkwo.com" : "e.g. www.oak-global.com.ng"} 
              />
            </Field>

            <Field label="Contact phone number">
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +234 800 000 0000" />
            </Field>

            <Field label={isIndividual ? "Field of expertise" : "Industry"}>
              <select 
                className="input" 
                value={industry} 
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="">Select sector...</option>
                <option value="Oil & Gas">Oil & Gas</option>
                <option value="Construction">Construction</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Healthcare">Healthcare</option>
                <option value="ICT">ICT</option>
                <option value="Logistics & Maritime">Logistics & Maritime</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Public Sector">Public Sector</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </Field>

            <Field label={isIndividual ? "Auditor level / Experience" : "Company size"}>
              <select 
                className="input" 
                value={size} 
                onChange={(e) => setSize(e.target.value)}
              >
                {isIndividual ? (
                  <>
                    <option value="">Select experience...</option>
                    <option value="1-3">1-3 years (Associate Auditor)</option>
                    <option value="4-7">4-7 years (Senior Auditor)</option>
                    <option value="8+">8+ years (Lead Auditor / Consultant)</option>
                  </>
                ) : (
                  <>
                    <option value="">Select size...</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </>
                )}
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label={isIndividual ? "Professional bio / Background" : "Brief description"}>
                <textarea 
                  className="input min-h-[72px] pt-2" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder={isIndividual ? "Describe your professional background, certifications (e.g. IRCA, ISO), and audit expertise..." : "Describe your organization's business, primary services, and audit needs..."}
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label={isIndividual ? "Contact address" : "Office address"}>
                <textarea 
                  className="input min-h-[72px] pt-2" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder={isIndividual ? "Physical contact address / Mailing address" : "Physical office address"}
                />
              </Field>
            </div>
          </div>
          <div className="pt-2 border-t border-border mt-6 flex flex-wrap gap-4 items-center justify-between">
            <button 
              onClick={save} 
              disabled={!isDirty} 
              className={`pill-cta transition duration-200 ${!isDirty ? "opacity-50 cursor-not-allowed bg-secondary/80 text-muted-foreground border-transparent hover:bg-secondary/80" : ""}`}
            >
              Save changes
            </button>
            {isForced && (
              <button
                onClick={() => {
                  localStorage.setItem(SKIP_ONBOARDING_KEY, "true");
                  navigate("/app");
                }}
                className="rounded-2xl border border-border bg-background/50 hover:bg-secondary px-5 py-2.5 text-xs font-semibold text-muted-foreground transition duration-200"
              >
                Cancel
              </button>
            )}
            <button
              onClick={async () => {
                try { await authApi.logout(); } catch {}
                signOut();
                navigate("/auth");
              }}
              className="rounded-2xl border border-destructive/30 hover:border-destructive/60 bg-background/50 hover:bg-destructive/10 px-5 py-2.5 text-xs font-semibold text-destructive transition duration-200"
            >
              Sign out of account
            </button>
          </div>
        </div>

        {/* Right column: Branding & Logo */}
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card h-fit">
          <h3 className="font-display text-lg font-bold text-foreground">
            {isIndividual ? "Profile Photo" : "Branding"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isIndividual 
              ? "Upload your professional photo or avatar to customize reports and profile details."
              : "Upload your organization logo to customize reports and dashboard elements."}
          </p>
          
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-background/50 text-center mt-4">
            {currentOrg?.logo_url ? (
              <img 
                src={currentOrg.logo_url} 
                alt={isIndividual ? "Profile Avatar" : "Organization Logo"} 
                className={`h-24 w-24 border border-border object-cover bg-card shadow-sm mb-4 ${isIndividual ? "rounded-full" : "rounded-2xl"}`} 
              />
            ) : (
              <div className={`h-24 w-24 border border-dashed border-border bg-muted/30 flex items-center justify-center text-2xl font-bold text-muted-foreground mb-4 ${isIndividual ? "rounded-full" : "rounded-2xl"}`}>
                {name ? name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            
            <input 
              id="logo-upload"
              type="file" 
              accept="image/*" 
              disabled={uploading} 
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} 
              className="hidden" 
            />
            <button
              disabled={uploading}
              onClick={() => document.getElementById("logo-upload")?.click()}
              className="pill-secondary text-xs disabled:opacity-50"
            >
              {uploading ? "Uploading..." : isIndividual ? "Upload profile photo" : "Upload new logo"}
            </button>
          </div>
        </div>
      </div>
      )}

      <div className="mt-6">
        <SecuritySettings />
      </div>

      <div className="pt-10 pb-6 text-center text-xs text-muted-foreground/60 select-none font-medium border-t border-border/40 mt-10">
        © {new Date().getFullYear()} OakAudix. All rights reserved.
      </div>
    </AppShell>
  );
}

const Field = ({ label, children }: any) => (
  <label className="block"><span className="mb-1.5 block text-sm font-medium">{label}</span>{children}</label>
);