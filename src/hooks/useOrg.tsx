import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Organization = {
  id: string;
  name: string;
  type: "individual" | "organization";
  industry: string | null;
  address: string | null;
  logo_url: string | null;
};

type Ctx = {
  orgs: Organization[];
  currentOrg: Organization | null;
  setCurrentOrg: (id: string) => void;
  loading: boolean;
  refresh: () => Promise<void>;
};

const OrgCtx = createContext<Ctx>({
  orgs: [], currentOrg: null, setCurrentOrg: () => {}, loading: true, refresh: async () => {},
});

const STORAGE_KEY = "oak.currentOrgId";

export const OrgProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(localStorage.getItem(STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setOrgs([]); setLoading(false); return; }
    const { data } = await supabase
      .from("organizations")
      .select("id,name,type,industry,address,logo_url")
      .order("created_at", { ascending: true });
    const list = (data ?? []) as Organization[];
    setOrgs(list);
    if (!currentId || !list.find((o) => o.id === currentId)) {
      const preferred = list.find((o) => o.type === "organization") ?? list[0];
      if (preferred) {
        setCurrentId(preferred.id);
        localStorage.setItem(STORAGE_KEY, preferred.id);
      }
    }
    setLoading(false);
  }, [user, currentId]);

  useEffect(() => { refresh(); }, [refresh]);

  const setCurrentOrg = (id: string) => {
    setCurrentId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const currentOrg = orgs.find((o) => o.id === currentId) ?? null;

  return (
    <OrgCtx.Provider value={{ orgs, currentOrg, setCurrentOrg, loading, refresh }}>
      {children}
    </OrgCtx.Provider>
  );
};

export const useOrg = () => useContext(OrgCtx);