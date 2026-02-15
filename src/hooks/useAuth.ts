import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isProfileLoaded: boolean;
  profile: { display_name: string | null; email: string | null; avatar_url: string | null } | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
    isProfileLoaded: false,
    profile: null,
  });

  useEffect(() => {
    const fetchProfileAndRole = async (user: User | null) => {
      let profile = null;
      let isAdmin = false;

      if (user) {
        const [profileRes, roleRes] = await Promise.all([
          supabase.from("profiles").select("display_name, email, avatar_url").eq("user_id", user.id).single(),
          supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
        ]);
        profile = profileRes.data;
        isAdmin = !!roleRes.data;
      }

      return { profile, isAdmin };
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user ?? null;
        // Set authenticated immediately, then fetch profile in background
        setState(prev => ({ ...prev, user, session, isAuthenticated: !!session, isLoading: false }));
        
        if (user) {
          setTimeout(() => {
            fetchProfileAndRole(user).then(({ profile, isAdmin }) => {
              setState(prev => ({ ...prev, profile, isAdmin, isProfileLoaded: true }));
            });
          }, 0);
        } else {
          setState(prev => ({ ...prev, profile: null, isAdmin: false, isProfileLoaded: true }));
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setState(prev => ({ ...prev, user, session, isAuthenticated: !!session, isLoading: false }));
      
      if (user) {
        fetchProfileAndRole(user).then(({ profile, isAdmin }) => {
          setState(prev => ({ ...prev, profile, isAdmin, isProfileLoaded: true }));
        });
      } else {
        setState(prev => ({ ...prev, isProfileLoaded: true }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { ...state, signOut };
}
