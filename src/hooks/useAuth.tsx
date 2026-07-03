import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { authApi } from "@/api/auth";

type User = {
  id: string;
  email: string;
  full_name: string;
  account_type: string;
};

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({ user: null, loading: true, signOut: async () => {}, refreshUser: async () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("oa_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await authApi.me();
      setUser(data as User);
    } catch {
      localStorage.removeItem("oa_token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signOut = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem("oa_token");
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, signOut, refreshUser: fetchUser }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
