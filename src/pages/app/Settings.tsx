import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";

export default function Settings() {
  const { currentOrg, refresh } = useOrg();
  const { toast } = useToast();
  
  // Structured form states
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [size, setSize] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!currentOrg) return;
    setName(currentOrg.name);
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
    
    // Serialize additional properties inside the address column to stay robust without migrations
    const serializedAddress = JSON.stringify({
      address,
      website,
      size,
      phone,
      description,
    });

    const { error } = await supabase.from("organizations").update({
      name,
      industry,
      address: serializedAddress,
    }).eq("id", currentOrg.id);

    if (error) return toast({ title: error.message, variant: "destructive" });
    toast({ title: "Profile settings saved successfully." });
    refresh();
  };

  const uploadLogo = async (file: File) => {
    if (!currentOrg) return;
    setUploading(true);
    const path = `${currentOrg.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("logos").getPublicUrl(path);
      await supabase.from("organizations").update({ logo_url: data.publicUrl }).eq("id", currentOrg.id);
      refresh();
      toast({ title: "Logo updated successfully." });
    } else toast({ title: error.message, variant: "destructive" });
    setUploading(false);
  };

  return (
    <AppShell>
      <Header title="Profile settings" subtitle="Update your organization profile, contact info, and business details." />
      
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left column: Profile Details Form */}
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 lg:col-span-2 shadow-card">
          <h3 className="font-display text-lg font-bold text-foreground">Company Profile</h3>
          <p className="text-xs text-muted-foreground">This information will be reviewed by the OAK Global team to determine custom pricing tiers for your organization.</p>
          
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <Field label="Organization name">
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. OAK Global International" />
            </Field>

            <Field label="Company website">
              <input className="input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="e.g. www.oak-global.com.ng" />
            </Field>

            <Field label="Contact phone number">
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +234 800 000 0000" />
            </Field>

            <Field label="Industry">
              <select 
                className="input" 
                value={industry} 
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="">Select industry...</option>
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

            <Field label="Company size">
              <select 
                className="input" 
                value={size} 
                onChange={(e) => setSize(e.target.value)}
              >
                <option value="">Select size...</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Brief description">
                <textarea 
                  className="input min-h-[72px] pt-2" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe your organization's business, primary services, and audit needs..."
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Office address">
                <textarea 
                  className="input min-h-[72px] pt-2" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Physical office address"
                />
              </Field>
            </div>
          </div>
          
          <div className="pt-2 border-t border-border mt-6">
            <button onClick={save} className="pill-cta">Save changes</button>
          </div>
        </div>

        {/* Right column: Branding & Logo */}
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card h-fit">
          <h3 className="font-display text-lg font-bold text-foreground">Branding</h3>
          <p className="text-xs text-muted-foreground">Upload your organization logo to customize reports and dashboard elements.</p>
          
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-background/50 text-center mt-4">
            {currentOrg?.logo_url ? (
              <img 
                src={currentOrg.logo_url} 
                alt="Organization Logo" 
                className="h-24 w-24 rounded-2xl border border-border object-cover bg-card shadow-sm mb-4" 
              />
            ) : (
              <div className="h-24 w-24 rounded-2xl border border-dashed border-border bg-muted/30 flex items-center justify-center text-2xl font-bold text-muted-foreground mb-4">
                {name ? name.charAt(0).toUpperCase() : "O"}
              </div>
            )}
            
            <label className="pill-secondary text-xs cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                disabled={uploading} 
                onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} 
                className="hidden" 
              />
              {uploading ? "Uploading..." : "Upload new logo"}
            </label>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

const Field = ({ label, children }: any) => (
  <label className="block"><span className="mb-1.5 block text-sm font-medium">{label}</span>{children}</label>
);