import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "./useAuth";
import { orgsApi, Organization } from "@/api/orgs";

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
    try {
      const list = await orgsApi.list();
      setOrgs(list);
      const orgOrg = list.find((o) => o.type === "organization");
      if (orgOrg) {
        setCurrentId(orgOrg.id);
        localStorage.setItem(STORAGE_KEY, orgOrg.id);
      } else if (list.length > 0) {
        setCurrentId(list[0].id);
        localStorage.setItem(STORAGE_KEY, list[0].id);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

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
