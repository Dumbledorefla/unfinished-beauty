import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, Copy, Upload, CheckCircle2, Clock, AlertCircle,
  ArrowLeft, CreditCard, Loader2, Timer, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import CouponInput from "@/components/CouponInput";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useCoupon } from "@/hooks/useCoupon";
import { supabase } from "@/integrations/supabase/client";
import { uploadPaymentProof } from "@/lib/storage";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";

type CheckoutStep = "method" | "pix-manual" | "pix-auto" | "upload" | "status";
type PaymentMethod = "pix_auto" | "pix_manual";

function useCountdown(targetDate: string | null) {
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

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { coupon, discountAmount, loading: couponLoading, applyCoupon, removeCoupon, calculateFinalPrice } = useCoupon();

  const [step, setStep] = useState<CheckoutStep>("method");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState("pending_payment");
  const [uploading, setUploading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pixAutoData, setPixAutoData] = useState<{
    qr_code_url?: string;
    pix_copy_paste?: string;
    expires_at?: string;
  } | null>(null);
  const [pixSettings, setPixSettings] = useState<{ key: string; name: string; bank: string }>({
    key: "", name: "", bank: "",
  });
  const [pagarmeEnabled, setPagarmeEnabled] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { timeLeft, expired } = useCountdown(pixAutoData?.expires_at || null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth?redirect=/checkout");
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    supabase.from("site_settings").select("key, value").in("key", ["pix_key", "pix_name", "pix_bank", "pagarme_enabled"])
      .then(({ data }) => {
        if (data) {
          const map = Object.fromEntries(data.map((s) => [s.key, s.value]));
          setPixSettings({ key: map.pix_key || "", name: map.pix_name || "", bank: map.pix_bank || "" });
          setPagarmeEnabled(map.pagarme_enabled === "true");
        }
      });
  }, []);

  // Realtime subscription for order status updates
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

  // Polling fallback — verifica status a cada 5s quando em pix-auto
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

  const createOrder = async (method: PaymentMethod) => {
    if (!user || items.length === 0) return;
    setCreatingPayment(true);

    try {
      const finalPrice = calculateFinalPrice(totalPrice);

      const { data: order, error: orderErr } = await supabase.from("orders").insert({
        user_id: user.id,
        total_amount: finalPrice,
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
          amount: finalPrice,
        });
        setStep("pix-manual");
        toast.success("Pedido criado! Faça o PIX e envie o comprovante.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar pedido");
    } finally {
      setCreatingPayment(false);
    }
  };

  const handleUploadProof = async () => {
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
  };

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copiado!`);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-muted-foreground text-sm">Preparando checkout...</p>
      </div>
    );
  }

  const finalPrice = calculateFinalPrice(totalPrice);

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-16 max-w-lg">
        <AnimatePresence mode="wait">
          {/* Step: Choose Method */}
          {step === "method" && (
            <motion.div key="method" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardHeader>
                  <CardTitle className="gold-text flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Forma de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-6 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-foreground/60 text-sm mb-1">Total a pagar</p>
                    <p className="text-3xl font-bold text-primary">R$ {totalPrice.toFixed(2)}</p>
                    <p className="text-xs text-foreground/40 mt-1">{items.length} {items.length === 1 ? "item" : "itens"}</p>
                  </div>

                  {/* Cupom de desconto */}
                  <CouponInput
                    onApply={(code) => applyCoupon(code, totalPrice)}
                    onRemove={removeCoupon}
                    appliedCoupon={coupon}
                    discountAmount={discountAmount}
                    loading={couponLoading}
                  />

                  {/* Mostrar total com desconto */}
                  {discountAmount > 0 && (
                    <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-sm text-foreground/60 line-through">R$ {totalPrice.toFixed(2)}</p>
                      <p className="text-2xl font-bold text-emerald-400">R$ {finalPrice.toFixed(2)}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {pagarmeEnabled && (
                      <Button
                        onClick={() => createOrder("pix_auto")}
                        disabled={items.length === 0 || creatingPayment}
                        className="w-full h-auto py-4 bg-primary text-primary-foreground flex flex-col items-center gap-1"
                      >
                        {creatingPayment ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <QrCode className="w-5 h-5" />
                              <span className="font-semibold">PIX Automático</span>
                            </div>
                            <span className="text-xs opacity-80">QR Code gerado na hora · Aprovação instantânea</span>
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      onClick={() => createOrder("pix_manual")}
                      disabled={items.length === 0 || creatingPayment}
                      variant="outline"
                      className="w-full h-auto py-4 flex flex-col items-center gap-1 border-primary/20"
                    >
                      {creatingPayment ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Copy className="w-5 h-5" />
                            <span className="font-semibold">PIX Manual</span>
                          </div>
                          <span className="text-xs opacity-60">Copie a chave e envie o comprovante</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Pagamento seguro · Acesso imediato após confirmação</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step: PIX Automático */}
          {step === "pix-auto" && pixAutoData && (
            <motion.div key="pix-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardHeader>
                  <CardTitle className="gold-text flex items-center gap-2">
                    <QrCode className="w-5 h-5" /> PIX Automático
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Timer */}
                  {timeLeft && !expired && (
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <Timer className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-orange-300">
                        Expira em{" "}
                        <strong>
                          {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                        </strong>
                      </span>
                    </div>
                  )}
                  {expired && (
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <span className="text-sm text-destructive">QR Code expirado. Crie um novo pedido.</span>
                    </div>
                  )}

                  {/* QR Code */}
                  {pixAutoData.qr_code_url && !expired && (
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-xl">
                        <img src={pixAutoData.qr_code_url} alt="QR Code PIX" className="w-48 h-48" />
                      </div>
                    </div>
                  )}

                  {/* Valor */}
                  <div className="text-center">
                    <p className="text-foreground/60 text-sm">Valor</p>
                    <p className="text-2xl font-bold text-primary">R$ {finalPrice.toFixed(2)}</p>
                  </div>

                  {/* Copia e Cola */}
                  {pixAutoData.pix_copy_paste && !expired && (
                    <div className="space-y-2">
                      <Label className="text-foreground/70 text-xs">PIX Copia e Cola</Label>
                      <div className="flex gap-2">
                        <code className="flex-1 text-xs font-mono p-3 rounded-lg bg-secondary/60 border border-primary/10 text-foreground/70 break-all max-h-20 overflow-auto">
                          {pixAutoData.pix_copy_paste}
                        </code>
                        <Button
                          size="icon"
                          variant={copied ? "default" : "outline"}
                          onClick={() => copyToClipboard(pixAutoData.pix_copy_paste!, "PIX Copia e Cola")}
                          className="shrink-0"
                        >
                          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Status de verificação */}
                  {!expired && (
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      <span className="text-sm text-foreground/60">
                        Aguardando confirmação do pagamento...
                      </span>
                    </div>
                  )}

                  <Button variant="ghost" onClick={() => navigate("/")} className="w-full text-foreground/50">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao início
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step: PIX Manual */}
          {step === "pix-manual" && (
            <motion.div key="pix-manual" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardHeader>
                  <CardTitle className="gold-text flex items-center gap-2">
                    <Copy className="w-5 h-5" /> PIX Manual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-foreground/60 text-sm mb-1">Total a pagar</p>
                    <p className="text-2xl font-bold text-primary">R$ {finalPrice.toFixed(2)}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/40 border border-primary/10">
                    <p className="text-xs text-foreground/60 mb-1">Chave PIX</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-foreground flex-1 break-all">{pixSettings.key}</code>
                      <Button
                        size="icon"
                        variant={copied ? "default" : "ghost"}
                        onClick={() => copyToClipboard(pixSettings.key, "Chave PIX")}
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {pixSettings.name && (
                    <div className="text-sm text-foreground/70">
                      <span className="text-foreground/50">Favorecido:</span> {pixSettings.name}
                      {pixSettings.bank && <> · {pixSettings.bank}</>}
                    </div>
                  )}

                  <ol className="text-sm text-foreground/60 space-y-2">
                    <li className="flex gap-2"><span className="text-primary font-bold">1.</span> Abra seu app bancário</li>
                    <li className="flex gap-2"><span className="text-primary font-bold">2.</span> Copie a chave PIX acima</li>
                    <li className="flex gap-2"><span className="text-primary font-bold">3.</span> Faça o PIX no valor de <strong className="text-primary">R$ {finalPrice.toFixed(2)}</strong></li>
                    <li className="flex gap-2"><span className="text-primary font-bold">4.</span> Clique em "Enviar Comprovante" abaixo</li>
                  </ol>

                  <Button onClick={() => setStep("upload")} className="w-full bg-primary text-primary-foreground">
                    <Upload className="w-4 h-4 mr-2" />
                    Enviar Comprovante
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step: Upload Proof */}
          {step === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardHeader>
                  <CardTitle className="gold-text flex items-center gap-2">
                    <Upload className="w-5 h-5" /> Enviar Comprovante
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                    <p className="text-foreground font-semibold">Pedido criado!</p>
                    <p className="text-foreground/60 text-sm">Envie o comprovante do PIX para liberarmos seu acesso.</p>
                  </div>

                  <div>
                    <Label>Comprovante (imagem ou PDF)</Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                    {proofFile && (
                      <p className="text-xs text-foreground/50 mt-1">{proofFile.name}</p>
                    )}
                  </div>

                  <Button
                    onClick={handleUploadProof}
                    disabled={!proofFile || uploading}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    {uploading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" /> Enviar Comprovante</>
                    )}
                  </Button>

                  <Button variant="ghost" onClick={() => setStep("pix-manual")} className="w-full text-foreground/50">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step: Status */}
          {step === "status" && (
            <motion.div key="status" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardContent className="pt-8 pb-8 text-center space-y-4">
                  {orderStatus === "paid" ? (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                      </motion.div>
                      <h2 className="text-xl font-serif font-bold text-foreground">Pagamento Aprovado!</h2>
                      <p className="text-foreground/60">
                        Seu acesso foi liberado automaticamente. Aproveite sua experiência mística!
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Clock className="w-10 h-10 text-orange-400 animate-pulse" />
                      </div>
                      <h2 className="text-xl font-serif font-bold text-foreground">Pagamento em Análise</h2>
                      <p className="text-foreground/60">
                        Seu comprovante foi recebido e está sendo analisado. Você receberá uma notificação quando aprovado.
                      </p>
                    </>
                  )}

                  <p className="text-xs text-foreground/40 font-mono">
                    Pedido: {orderId?.slice(0, 12)}
                  </p>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button onClick={() => navigate("/perfil")} className="bg-primary text-primary-foreground">
                      Ver Meus Pedidos
                    </Button>
                    <Button variant="ghost" onClick={() => navigate("/")} className="text-foreground/50">
                      Voltar ao Início
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
