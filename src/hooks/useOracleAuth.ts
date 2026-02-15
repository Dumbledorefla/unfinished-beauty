import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { savePendingState, getPendingState, clearPendingState, PendingOracleState } from "@/lib/pending-oracle";

interface UseOracleAuthOptions {
  methodId: string;
  returnTo: string;
}

/**
 * Hook that manages the Form → Auth → Result flow for oracle methods.
 * 
 * Returns:
 * - pendingState: restored state after login (null if none)
 * - requireAuth: call with user data + optional method state to check auth; returns true if user is authenticated
 * - isAuthenticated
 */
export function useOracleAuth({ methodId, returnTo }: UseOracleAuthOptions) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [restoredState, setRestoredState] = useState<PendingOracleState | null>(null);
  const hasRestored = useRef(false);

  // On mount, check if there's a pending state for this method and user is now logged in
  useEffect(() => {
    if (isLoading || hasRestored.current) return;
    
    if (isAuthenticated) {
      const pending = getPendingState();
      if (pending && pending.methodId === methodId) {
        hasRestored.current = true;
        setRestoredState(pending);
        clearPendingState();
      }
    }
  }, [isAuthenticated, isLoading, methodId]);

  /**
   * Call this after the user submits their data.
   * If not authenticated, saves state and redirects to /auth.
   * Returns true if authenticated (proceed with generation).
   */
  function requireAuth(
    userData: { name: string; birthDate: string; [key: string]: any },
    methodState?: any
  ): boolean {
    if (isAuthenticated) return true;

    savePendingState({
      methodId,
      returnTo,
      userData,
      methodState,
    });

    navigate(`/auth?next=${encodeURIComponent(returnTo)}`);
    return false;
  }

  function clearRestored() {
    setRestoredState(null);
  }

  return { restoredState, requireAuth, clearRestored, isAuthenticated, isLoading, user };
}
