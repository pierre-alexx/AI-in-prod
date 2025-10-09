"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
    });
    return () => {
      isMounted = false;
      sub?.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      signOut: async () => {
        await supabase.auth.signOut();
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      },
    }),
    [user, session, isLoading, supabase]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


