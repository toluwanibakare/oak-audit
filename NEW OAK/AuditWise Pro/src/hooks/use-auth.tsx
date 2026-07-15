import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { authApi } from "@/lib/api/auth";

type User = {
  id: string;
  email: string;
  full_name: string;
  current_role: string | null;
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
    const tokenAtStart = localStorage.getItem("oa_token");
    if (!tokenAtStart) {
      setLoading(false);
      return;
    }
    const timeout = setTimeout(() => setLoading(false), 10000);
    try {
      const data = await authApi.me();
      clearTimeout(timeout);
      setUser(data as User);
    } catch {
      clearTimeout(timeout);
      // Only remove token if it hasn't changed (avoid race with concurrent login)
      if (localStorage.getItem("oa_token") === tokenAtStart) {
        localStorage.removeItem("oa_token");
      }
    } finally {
      clearTimeout(timeout);
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
    window.location.href = "/";
  };

  return <Ctx.Provider value={{ user, loading, signOut, refreshUser: fetchUser }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
