import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type EntityType = "user" | "product" | "order" | "consultation" | "taromante" | "course" | "setting" | "coupon" | "payment";

interface AuditEntry {
  action: string;
  entity_type: EntityType;
  entity_id?: string;
  details?: Record<string, any>;
}

export function useAuditLog() {
  const { user, profile } = useAuth();

  const log = useCallback(async (entry: AuditEntry) => {
    if (!user) return;

    try {
      await supabase.from("admin_audit_log").insert({
        admin_user_id: user.id,
        admin_name: profile?.display_name || user.email || "Admin",
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id || null,
        details: entry.details || null,
      });
    } catch (err) {
      console.error("Audit log error:", err);
    }
  }, [user, profile]);

  return { log };
}
