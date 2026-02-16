import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CouponData {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  description: string | null;
}

interface UseCouponReturn {
  coupon: CouponData | null;
  discountAmount: number;
  loading: boolean;
  applyCoupon: (code: string, orderTotal: number) => Promise<boolean>;
  removeCoupon: () => void;
  calculateFinalPrice: (orderTotal: number) => number;
}

export function useCoupon(): UseCouponReturn {
  const [coupon, setCoupon] = useState<CouponData | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const applyCoupon = useCallback(async (code: string, orderTotal: number): Promise<boolean> => {
    if (!code.trim()) {
      toast.error("Digite um código de cupom.");
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("Cupom não encontrado ou inativo.");
        return false;
      }

      // Validate expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast.error("Este cupom expirou.");
        return false;
      }

      // Validate usage limit
      if (data.max_uses !== null && data.current_uses >= data.max_uses) {
        toast.error("Este cupom atingiu o limite de uso.");
        return false;
      }

      // Validate minimum order
      if (data.min_order_amount && orderTotal < Number(data.min_order_amount)) {
        toast.error(`Pedido mínimo de R$ ${Number(data.min_order_amount).toFixed(2)} para este cupom.`);
        return false;
      }

      // Calculate discount
      let discount: number;
      if (data.discount_type === "percentage") {
        discount = orderTotal * (Number(data.discount_value) / 100);
      } else {
        discount = Number(data.discount_value);
      }
      discount = Math.min(discount, orderTotal);

      setCoupon({
        id: data.id,
        code: data.code,
        discount_type: data.discount_type as "percentage" | "fixed",
        discount_value: Number(data.discount_value),
        min_order_amount: Number(data.min_order_amount),
        description: data.description,
      });
      setDiscountAmount(discount);

      const label = data.discount_type === "percentage"
        ? `${Number(data.discount_value)}% de desconto`
        : `R$ ${Number(data.discount_value).toFixed(2)} de desconto`;

      toast.success(`Cupom aplicado! ${label}`);
      return true;
    } catch (err) {
      toast.error("Erro ao validar cupom. Tente novamente.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setDiscountAmount(0);
    toast.info("Cupom removido.");
  }, []);

  const calculateFinalPrice = useCallback((orderTotal: number): number => {
    return Math.max(0, orderTotal - discountAmount);
  }, [discountAmount]);

  return { coupon, discountAmount, loading, applyCoupon, removeCoupon, calculateFinalPrice };
}
