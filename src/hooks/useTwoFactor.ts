import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TOTPSetup {
  id: string;
  type: string;
  totp: {
    qr_code: string;
    secret: string;
    uri: string;
  };
}

export function useTwoFactor() {
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<TOTPSetup | null>(null);

  const checkMFAStatus = useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) return { enrolled: false, verified: false };
    const totpFactor = data.totp?.[0];
    if (!totpFactor) return { enrolled: false, verified: false };
    return { enrolled: true, verified: totpFactor.status === "verified", factorId: totpFactor.id };
  }, []);

  const enrollMFA = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Chave do Oráculo",
      });
      if (error) throw error;
      setSetupData(data as TOTPSetup);
      return data;
    } catch (err: any) {
      toast.error("Erro ao configurar 2FA: " + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyMFA = useCallback(async (factorId: string, code: string) => {
    setLoading(true);
    try {
      const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeErr) throw challengeErr;
      const { error: verifyErr } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
      if (verifyErr) throw verifyErr;
      toast.success("2FA ativado com sucesso!");
      setSetupData(null);
      return true;
    } catch (err: any) {
      toast.error("Código inválido. Tente novamente.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const unenrollMFA = useCallback(async (factorId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      toast.success("2FA desativado.");
      return true;
    } catch (err: any) {
      toast.error("Erro ao desativar 2FA: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, setupData, checkMFAStatus, enrollMFA, verifyMFA, unenrollMFA };
}
