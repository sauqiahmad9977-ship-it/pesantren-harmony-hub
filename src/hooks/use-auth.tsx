import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  apiLogin, apiRegister, apiLogout, apiGetMe,
  type AuthUser,
} from "@/lib/api-client";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "ustadz" | "staff";

interface AuthContextValue {
  user: AuthUser | null;
  roles: Role[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<string>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize session and listen for changes
  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          // Set user immediately from local session to avoid network delay
          const u: AuthUser = {
            id: session.user.id,
            email: session.user.email || "",
            full_name: session.user.user_metadata?.full_name || session.user.email || "",
            phone: session.user.phone || session.user.user_metadata?.phone || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            created_at: session.user.created_at,
          };
          const r = (session.user.user_metadata?.roles || ["staff"]) as Role[];
          setUser(u);
          setRoles(r);

          // Fetch fresh data in background
          apiGetMe().then(({ user: freshU, roles: freshR }) => {
            if (mounted) {
              setUser(freshU);
              setRoles(freshR as Role[]);
            }
          }).catch(err => console.error("Background sync failed:", err));
        }
      } catch (err) {
        console.error("Failed to get initial session:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (session) {
        try {
          const { user: u, roles: r } = await apiGetMe();
          setUser(u);
          setRoles(r as Role[]);
        } catch (error) {
          console.error("Failed to fetch user details on auth change:", error);
          setUser(null);
          setRoles([]);
        }
      } else {
        setUser(null);
        setRoles([]);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { user: u, roles: r } = await apiLogin(email, password);
    setUser(u);
    setRoles(r as Role[]);
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string): Promise<string> => {
    const { user: u, roles: r, message } = await apiRegister(email, password, fullName);
    setUser(u);
    setRoles(r as Role[]);
    return message || "Pendaftaran berhasil";
  }, []);

  const signOut = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setRoles([]);
  }, []);

  return (
    <AuthContext.Provider value={{ user, roles, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
