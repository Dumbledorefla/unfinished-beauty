const STORAGE_KEY = "oracle_pending_state";
const EXPIRY_MINUTES = 30;

export interface PendingOracleState {
  methodId: string;
  returnTo: string;
  userData: {
    name: string;
    birthDate: string;
    [key: string]: any;
  };
  methodState?: any;
  createdAt: number;
  expiresAt: number;
}

export function savePendingState(state: Omit<PendingOracleState, "createdAt" | "expiresAt">) {
  const now = Date.now();
  const full: PendingOracleState = {
    ...state,
    createdAt: now,
    expiresAt: now + EXPIRY_MINUTES * 60 * 1000,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(full));
}

export function getPendingState(): PendingOracleState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state: PendingOracleState = JSON.parse(raw);
    if (Date.now() > state.expiresAt) {
      clearPendingState();
      return null;
    }
    return state;
  } catch {
    clearPendingState();
    return null;
  }
}

export function clearPendingState() {
  sessionStorage.removeItem(STORAGE_KEY);
}
