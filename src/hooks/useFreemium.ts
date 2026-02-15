import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface OracleProduct {
  id: string;
  oracle_type: string;
  name: string;
  description: string | null;
  price: number;
  is_free: boolean;
  preview_lines: number;
}

interface UseFreemiumReturn {
  product: OracleProduct | null;
  hasAccess: boolean;
  loading: boolean;
  purchaseReading: (readingId?: string) => Promise<boolean>;
}

export function useFreemium(oracleType: string): UseFreemiumReturn {
  const { user } = useAuth();
  const [product, setProduct] = useState<OracleProduct | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [oracleType, user?.id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      // Fetch oracle product config
      const { data: prod } = await supabase
        .from("oracle_products")
        .select("*")
        .eq("oracle_type", oracleType)
        .single();

      if (prod) {
        setProduct(prod as OracleProduct);

        // If free, always grant access
        if (prod.is_free) {
          setHasAccess(true);
          setLoading(false);
          return;
        }

        // Check if user has purchased this oracle type
        if (user?.id) {
          const { data: purchases } = await supabase
            .from("oracle_purchases")
            .select("id")
            .eq("user_id", user.id)
            .eq("oracle_type", oracleType)
            .limit(1);

          setHasAccess((purchases?.length || 0) > 0);
        } else {
          setHasAccess(false);
        }
      }
    } catch (err) {
      console.error("useFreemium error:", err);
    }
    setLoading(false);
  };

  const purchaseReading = async (readingId?: string): Promise<boolean> => {
    if (!user?.id || !product) return false;

    try {
      // Create order
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: product.price,
          status: "pending_payment",
          payment_provider: "manual_pix",
          payment_method: "pix",
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // Create order item (use oracle product as virtual product)
      await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: 1,
      });

      // Create payment transaction
      await supabase.from("payment_transactions").insert({
        order_id: order.id,
        provider: "manual_pix",
        method: "pix",
        status: "pending",
        amount: product.price,
      });

      // Store oracle purchase reference (will be activated when payment is approved)
      await supabase.from("oracle_purchases").insert({
        user_id: user.id,
        oracle_type: oracleType,
        reading_id: readingId || null,
        price: product.price,
        order_id: order.id,
      });

      return true;
    } catch (err) {
      console.error("purchaseReading error:", err);
      return false;
    }
  };

  return { product, hasAccess, loading, purchaseReading };
}
