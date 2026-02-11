import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: { display_name: string | null; email: string | null; avatar_url: string | null } | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    profile: null,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user ?? null;
        let profile = null;

        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("display_name, email, avatar_url")
            .eq("user_id", user.id)
            .single();
          profile = data;
        }

        setState({
          user,
          session,
          isAuthenticated: !!session,
          isLoading: false,
          profile,
        });
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      let profile = null;

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("display_name, email, avatar_url")
          .eq("user_id", user.id)
          .single();
        profile = data;
      }

      setState({
        user,
        session,
        isAuthenticated: !!session,
        isLoading: false,
        profile,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { ...state, signOut };
}
