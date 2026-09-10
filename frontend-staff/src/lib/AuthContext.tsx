import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  /** APIリクエストに付けるAuthorizationヘッダー。未ログイン時はundefined。 */
  authHeader: HeadersInit | undefined;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * 看護師・医師のログイン状態を管理する。Supabase Authのセッションをそのまま使う。
 * ログイン成功後のJWTを @shared/api/client の api.get/post/patch に
 * Authorizationヘッダーとして渡すことで、バックエンド側の認証チェックを通す。
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const authHeader: HeadersInit | undefined = session
    ? { Authorization: `Bearer ${session.access_token}` }
    : undefined;

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut, authHeader }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
