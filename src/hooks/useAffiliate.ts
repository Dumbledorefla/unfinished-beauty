import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Affiliate {
  id: string;
  code: string;
  commission_rate: number;
  status: string;
  total_earned: number;
  total_withdrawn: number;
  total_referrals: number;
  total_conversions: number;
  pix_key: string | null;
  created_at: string;
}

interface Commission {
  id: string;
  order_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  created_at: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  pix_key: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  processed_at: string | null;
}

export function useAffiliate() {
  const { user, isAuthenticated } = useAuth();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAffiliate = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from("affiliates")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setAffiliate(data as unknown as Affiliate);

      const [commsRes, withsRes] = await Promise.all([
        supabase
          .from("affiliate_commissions")
          .select("*")
          .eq("affiliate_id", data.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("affiliate_withdrawals")
          .select("*")
          .eq("affiliate_id", data.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      setCommissions((commsRes.data as unknown as Commission[]) || []);
      setWithdrawals((withsRes.data as unknown as Withdrawal[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) fetchAffiliate();
  }, [isAuthenticated, fetchAffiliate]);

  const becomeAffiliate = useCallback(async () => {
    if (!user) return null;

    const { data: codeData } = await supabase.rpc("generate_affiliate_code");
    if (!codeData) {
      toast.error("Erro ao gerar código de afiliado.");
      return null;
    }

    const { data, error } = await supabase
      .from("affiliates")
      .insert({ user_id: user.id, code: codeData as string })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao se tornar afiliado: " + error.message);
      return null;
    }

    setAffiliate(data as unknown as Affiliate);
    toast.success("Parabéns! Você agora é um afiliado!");
    return data;
  }, [user]);

  const updatePixKey = useCallback(async (pixKey: string) => {
    if (!affiliate) return;
    const { error } = await supabase
      .from("affiliates")
      .update({ pix_key: pixKey })
      .eq("id", affiliate.id);

    if (error) {
      toast.error("Erro ao atualizar chave PIX.");
    } else {
      setAffiliate((prev) => prev ? { ...prev, pix_key: pixKey } : null);
      toast.success("Chave PIX atualizada!");
    }
  }, [affiliate]);

  const requestWithdrawal = useCallback(async (amount: number) => {
    if (!affiliate || !affiliate.pix_key) {
      toast.error("Configure sua chave PIX antes de solicitar saque.");
      return false;
    }

    const available = affiliate.total_earned - affiliate.total_withdrawn;
    if (amount > available) {
      toast.error("Saldo insuficiente para saque.");
      return false;
    }

    if (amount < 20) {
      toast.error("O valor mínimo para saque é R$ 20,00.");
      return false;
    }

    const { error } = await supabase
      .from("affiliate_withdrawals")
      .insert({
        affiliate_id: affiliate.id,
        amount,
        pix_key: affiliate.pix_key,
      });

    if (error) {
      toast.error("Erro ao solicitar saque.");
      return false;
    }

    setAffiliate((prev) => prev ? { ...prev, total_withdrawn: prev.total_withdrawn + amount } : null);
    toast.success("Saque solicitado! Será processado em até 3 dias úteis.");
    fetchAffiliate();
    return true;
  }, [affiliate, fetchAffiliate]);

  const getShareLink = useCallback(() => {
    if (!affiliate) return "";
    return `${window.location.origin}?ref=${affiliate.code}`;
  }, [affiliate]);

  return {
    affiliate,
    commissions,
    withdrawals,
    loading,
    becomeAffiliate,
    updatePixKey,
    requestWithdrawal,
    getShareLink,
    refetch: fetchAffiliate,
  };
}

/**
 * Hook para rastrear referência na URL.
 */
export function useTrackReferral() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      localStorage.setItem("affiliate_ref", refCode);
      const url = new URL(window.location.href);
      url.searchParams.delete("ref");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  useEffect(() => {
    const registerReferral = async () => {
      if (!isAuthenticated || !user) return;

      const refCode = localStorage.getItem("affiliate_ref");
      if (!refCode) return;

      const { data: existing } = await supabase
        .from("affiliate_referrals")
        .select("id")
        .eq("referred_user_id", user.id)
        .maybeSingle();

      if (existing) {
        localStorage.removeItem("affiliate_ref");
        return;
      }

      const { data: aff } = await supabase
        .from("affiliates")
        .select("id, user_id")
        .eq("code", refCode)
        .eq("status", "active")
        .single();

      if (!aff || aff.user_id === user.id) {
        localStorage.removeItem("affiliate_ref");
        return;
      }

      await supabase.from("affiliate_referrals").insert({
        affiliate_id: aff.id,
        referred_user_id: user.id,
      });

      await supabase.rpc("increment_affiliate_referrals", { aff_id: aff.id });
      localStorage.removeItem("affiliate_ref");
    };

    registerReferral();
  }, [isAuthenticated, user]);
}
