import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, Copy, Upload, CheckCircle2, Clock, AlertCircle, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { uploadPaymentProof } from "@/lib/storage";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";

type CheckoutStep = "method" | "pix-manual" | "pix-auto" | "upload" | "status";
type PaymentMethod = "pix_auto" | "pix_manual";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<CheckoutStep>("method");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState("pending_payment");
  const [uploading, setUploading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [pixAutoData, setPixAutoData] = useState<{
    qr_code_url?: string;
    pix_copy_paste?: string;
    expires_at?: string;
  } | null>(null);
  const [pixSettings, setPixSettings] = useState<{ key: string; name: string; bank: string }>({
    key: "", name: "", bank: "",
  });
  const [pagarmeEnabled, setPagarmeEnabled] = useState(false);

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
            toast.success("Pagamento aprovado! 🎉");
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  const createOrder = async (method: PaymentMethod) => {
    if (!user || items.length === 0) return;
    setCreatingPayment(true);
    try {
      const { data: order, error: orderErr } = await supabase.from("orders").insert({
        user_id: user.id,
        total_amount: totalPrice,
        status: "pending_payment",
        payment_provider: method === "pix_auto" ? "pagarme" : "manual_pix",
        payment_method: "pix",
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

      if (method === "pix_auto") {
        // Call create-payment edge function
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        const res = await supabase.functions.invoke("create-payment", {
          body: { order_id: order.id, method: "pix" },
        });

        if (res.error || !res.data?.success) {
          const errMsg = res.data?.message || res.error?.message || "Erro ao gerar PIX automático";
          toast.error(errMsg + ". Redirecionando para PIX manual...");
          // Fallback to manual
          await supabase.from("orders").update({ payment_provider: "manual_pix" }).eq("id", order.id);
          setStep("pix-manual");
          return;
        }

        setPixAutoData(res.data.payment);
        setStep("pix-auto");
        toast.success("QR Code PIX gerado!");
      } else {
        // Manual PIX
        await supabase.from("payment_transactions").insert({
          order_id: order.id,
          provider: "manual_pix",
          method: "pix",
          status: "pending",
          amount: totalPrice,
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
    } finally { setUploading(false); }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-foreground">Carregando...</div>;

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-16 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Step: Choose Method */}
          {step === "method" && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="gold-text flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-foreground/60 text-sm mb-1">Total a pagar</p>
                  <p className="text-3xl font-bold text-primary">R$ {totalPrice.toFixed(2)}</p>
                </div>

                <div className="space-y-3">
                  {pagarmeEnabled && (
                    <Button
                      onClick={() => createOrder("pix_auto")}
                      disabled={items.length === 0 || creatingPayment}
                      className="w-full h-auto py-4 bg-primary text-primary-foreground flex flex-col items-center gap-1"
                    >
                      {creatingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
                      <span className="font-semibold">PIX Automático</span>
                      <span className="text-xs opacity-80">QR Code gerado instantaneamente</span>
                    </Button>
                  )}

                  {pixSettings.key && (
                    <Button
                      variant={pagarmeEnabled ? "outline" : "default"}
                      onClick={() => createOrder("pix_manual")}
                      disabled={items.length === 0 || creatingPayment}
                      className={`w-full h-auto py-4 flex flex-col items-center gap-1 ${!pagarmeEnabled ? "bg-primary text-primary-foreground" : ""}`}
                    >
                      <Copy className="w-5 h-5" />
                      <span className="font-semibold">PIX Manual</span>
                      <span className="text-xs opacity-80">Copie a chave e envie comprovante</span>
                    </Button>
                  )}

                  {!pixSettings.key && !pagarmeEnabled && (
                    <div className="text-center text-foreground/50 py-4">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                      <p>Nenhum meio de pagamento configurado. Entre em contato com o suporte.</p>
                    </div>
                  )}
                </div>

                <Button variant="outline" onClick={() => navigate("/carrinho")} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Carrinho
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step: PIX Automático */}
          {step === "pix-auto" && pixAutoData && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="gold-text flex items-center gap-2">
                  <QrCode className="w-5 h-5" /> PIX Automático
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400 mb-1" />
                  <p className="text-foreground font-semibold text-sm">QR Code gerado!</p>
                </div>

                {pixAutoData.qr_code_url && (
                  <div className="flex justify-center">
                    <img src={pixAutoData.qr_code_url} alt="QR Code PIX" className="w-48 h-48 rounded-lg border border-primary/20" />
                  </div>
                )}

                {pixAutoData.pix_copy_paste && (
                  <div className="p-4 rounded-lg bg-secondary/40 border border-primary/10">
                    <p className="text-xs text-foreground/60 mb-1">PIX Copia e Cola</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-foreground flex-1 break-all line-clamp-3">{pixAutoData.pix_copy_paste}</code>
                      <Button size="icon" variant="ghost" onClick={() => copyToClipboard(pixAutoData.pix_copy_paste!, "PIX Copia e Cola")}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-foreground/60">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Aguardando pagamento...</span>
                  </div>
                  {pixAutoData.expires_at && (
                    <p className="text-xs text-foreground/40 mt-1">
                      Expira em: {new Date(pixAutoData.expires_at).toLocaleTimeString("pt-BR")}
                    </p>
                  )}
                </div>

                <p className="text-xs text-foreground/40 text-center">
                  O pagamento será confirmado automaticamente.
                </p>

                <p className="text-xs text-foreground/50 font-mono text-center">Pedido: {orderId?.slice(0, 12)}</p>
              </CardContent>
            </Card>
          )}

          {/* Step: PIX Manual */}
          {step === "pix-manual" && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="gold-text flex items-center gap-2">
                  <QrCode className="w-5 h-5" /> Pagamento via PIX Manual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-foreground/60 text-sm mb-1">Total a pagar</p>
                  <p className="text-3xl font-bold text-primary">R$ {totalPrice.toFixed(2)}</p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-secondary/40 border border-primary/10">
                    <p className="text-xs text-foreground/60 mb-1">Chave PIX</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-foreground flex-1 break-all">{pixSettings.key}</code>
                      <Button size="icon" variant="ghost" onClick={() => copyToClipboard(pixSettings.key, "Chave PIX")}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {pixSettings.name && (
                    <div className="text-sm text-foreground/70">
                      <span className="text-foreground/50">Favorecido:</span> {pixSettings.name}
                      {pixSettings.bank && <> · {pixSettings.bank}</>}
                    </div>
                  )}
                  <ol className="text-sm text-foreground/60 space-y-2 mt-4">
                    <li>1. Abra seu app bancário</li>
                    <li>2. Copie a chave PIX acima</li>
                    <li>3. Faça o PIX no valor de <strong className="text-primary">R$ {totalPrice.toFixed(2)}</strong></li>
                    <li>4. Clique em "Enviar Comprovante"</li>
                  </ol>
                </div>

                <Button onClick={() => setStep("upload")} className="w-full bg-primary text-primary-foreground">
                  Enviar Comprovante
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step: Upload Proof */}
          {step === "upload" && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="gold-text flex items-center gap-2">
                  <Upload className="w-5 h-5" /> Enviar Comprovante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-foreground font-semibold">Pedido criado!</p>
                  <p className="text-foreground/60 text-sm">Envie o comprovante do PIX.</p>
                </div>

                <div>
                  <Label>Comprovante (imagem ou PDF)</Label>
                  <Input type="file" accept="image/*,.pdf" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="mt-1" />
                  {proofFile && <p className="text-xs text-foreground/50 mt-1">{proofFile.name}</p>}
                </div>

                <Button onClick={handleUploadProof} disabled={!proofFile || uploading} className="w-full bg-primary text-primary-foreground">
                  {uploading ? "Enviando..." : "Enviar Comprovante"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step: Status */}
          {step === "status" && (
            <Card className="glass-card">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                {orderStatus === "paid" ? (
                  <>
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Pagamento Aprovado! 🎉</h2>
                    <p className="text-foreground/60">Seu acesso já foi liberado automaticamente.</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-orange-400" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Pagamento em Análise</h2>
                    <p className="text-foreground/60">
                      Seu comprovante foi enviado e está sendo analisado. Você receberá uma notificação quando aprovado.
                    </p>
                  </>
                )}
                <p className="text-xs text-foreground/40 font-mono">Pedido: {orderId?.slice(0, 12)}</p>
                <Button onClick={() => navigate("/perfil")} className="mt-4 bg-primary text-primary-foreground">
                  Ver Meus Pedidos
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}
