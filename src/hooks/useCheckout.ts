import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useCoupon } from "@/hooks/useCoupon";
import { supabase } from "@/integrations/supabase/client";
import { uploadPaymentProof } from "@/lib/storage";
import { toast } from "sonner";

export type CheckoutStep = "method" | "pix-manual" | "pix-auto" | "upload" | "status";
export type PaymentMethod = "pix_auto" | "pix_manual";

export interface PixAutoData {
  qr_code_url?: string;
  pix_copy_paste?: string;
  expires_at?: string;
}

export interface PixSettings {
  key: string;
  name: string;
  bank: string;
}

export function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number } | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        minutes: Math.floor(diff / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return { timeLeft, expired };
}

export function useCheckout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const couponState = useCoupon();
  const { coupon, discountAmount, calculateFinalPrice } = couponState;

  const [step, setStep] = useState<CheckoutStep>("method");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState("pending_payment");
  const [uploading, setUploading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pixAutoData, setPixAutoData] = useState<PixAutoData | null>(null);
  const [pixSettings, setPixSettings] = useState<PixSettings>({ key: "", name: "", bank: "" });
  const [pagarmeEnabled, setPagarmeEnabled] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finalPrice = calculateFinalPrice(totalPrice);
  const countdown = useCountdown(pixAutoData?.expires_at || null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth?redirect=/checkout");
  }, [isLoading, isAuthenticated]);

  // Load site settings
  useEffect(() => {
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["pix_key", "pix_name", "pix_bank", "pagarme_enabled"])
      .then(({ data }) => {
        if (data) {
          const map = Object.fromEntries(data.map((s) => [s.key, s.value]));
          setPixSettings({ key: map.pix_key || "", name: map.pix_name || "", bank: map.pix_bank || "" });
          setPagarmeEnabled(map.pagarme_enabled === "true");
        }
      });
  }, []);

  // Realtime subscription for order status
  useEffect(() => {
    if (!orderId) return;
    const channel = supabase
      .channel(`order-${orderId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `id=eq.${orderId}`,
      }, (payload) => {
        const newStatus = payload.new?.status;
        if (newStatus) {
          setOrderStatus(newStatus);
          if (newStatus === "paid") {
            setStep("status");
            toast.success("Pagamento aprovado! Seu acesso foi liberado.");
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  // Polling fallback for pix-auto
  useEffect(() => {
    if (step !== "pix-auto" || !orderId) return;

    pollingRef.current = setInterval(async () => {
      const { data } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single();

      if (data?.status === "paid") {
        setOrderStatus("paid");
        setStep("status");
        toast.success("Pagamento aprovado! Seu acesso foi liberado.");
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [step, orderId]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const createOrder = useCallback(async (method: PaymentMethod) => {
    if (!user || items.length === 0) return;
    setCreatingPayment(true);

    try {
      const price = calculateFinalPrice(totalPrice);

      const { data: order, error: orderErr } = await supabase.from("orders").insert({
        user_id: user.id,
        total_amount: price,
        status: "pending_payment",
        payment_provider: method === "pix_auto" ? "pagarme" : "manual_pix",
        payment_method: "pix",
        coupon_code: coupon?.code || null,
        discount_amount: discountAmount,
      }).select().single();

      if (orderErr) throw orderErr;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
      if (itemsErr) throw itemsErr;

      setOrderId(order.id);
      clearCart();

      // Increment coupon usage
      if (coupon) {
        await supabase.from("coupons").update({
          current_uses: (coupon as any).current_uses ? (coupon as any).current_uses + 1 : 1,
        }).eq("id", coupon.id);
      }

      if (method === "pix_auto") {
        const res = await supabase.functions.invoke("create-payment", {
          body: { order_id: order.id, method: "pix" },
        });

        if (res.error || !res.data?.success) {
          const errMsg = res.data?.message || res.error?.message || "Erro ao gerar PIX automático";
          toast.error(errMsg + ". Redirecionando para PIX manual...");
          await supabase.from("orders").update({ payment_provider: "manual_pix" }).eq("id", order.id);
          setStep("pix-manual");
          return;
        }

        setPixAutoData(res.data.payment);
        setStep("pix-auto");
        toast.success("QR Code PIX gerado com sucesso!");
      } else {
        await supabase.from("payment_transactions").insert({
          order_id: order.id,
          provider: "manual_pix",
          method: "pix",
          status: "pending",
          amount: price,
        });
        setStep("pix-manual");
        toast.success("Pedido criado! Faça o PIX e envie o comprovante.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar pedido");
    } finally {
      setCreatingPayment(false);
    }
  }, [user, items, totalPrice, coupon, discountAmount, calculateFinalPrice, clearCart]);

  const handleUploadProof = useCallback(async () => {
    if (!proofFile || !orderId || !user) return;
    setUploading(true);
    try {
      const path = await uploadPaymentProof(proofFile, user.id, orderId);
      await supabase.from("payment_proofs").insert({ order_id: orderId, file_path: path });
      await supabase.from("orders").update({ status: "payment_submitted" }).eq("id", orderId);
      setOrderStatus("payment_submitted");
      setStep("status");
      toast.success("Comprovante enviado! Aguarde a aprovação.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar comprovante");
    } finally {
      setUploading(false);
    }
  }, [proofFile, orderId, user]);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copiado!`);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return {
    // Auth/loading
    isLoading,
    // Cart
    items,
    totalPrice,
    finalPrice,
    // Coupon
    couponState,
    // Steps & state
    step,
    setStep,
    orderId,
    orderStatus,
    // Payment creation
    creatingPayment,
    createOrder,
    pagarmeEnabled,
    // PIX auto
    pixAutoData,
    countdown,
    // PIX manual
    pixSettings,
    // Upload
    proofFile,
    setProofFile,
    uploading,
    handleUploadProof,
    // Clipboard
    copied,
    copyToClipboard,
    // Navigation
    navigate,
  };
}
