import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, Copy, Upload, CheckCircle2, Clock, AlertCircle, ArrowLeft } from "lucide-react";
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

type CheckoutStep = "payment" | "upload" | "status";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<CheckoutStep>("payment");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState("pending_payment");
  const [uploading, setUploading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [pixSettings, setPixSettings] = useState<{ key: string; name: string; bank: string }>({
    key: "", name: "", bank: "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth?redirect=/checkout");
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    supabase.from("site_settings").select("key, value").in("key", ["pix_key", "pix_name", "pix_bank"])
      .then(({ data }) => {
        if (data) {
          const map = Object.fromEntries(data.map((s) => [s.key, s.value]));
          setPixSettings({ key: map.pix_key || "", name: map.pix_name || "", bank: map.pix_bank || "" });
        }
      });
  }, []);

  const createOrder = async () => {
    if (!user || items.length === 0) return;
    try {
      const { data: order, error: orderErr } = await supabase.from("orders").insert({
        user_id: user.id,
        total_amount: totalPrice,
        status: "pending_payment",
        payment_provider: "manual_pix",
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

      await supabase.from("payment_transactions").insert({
        order_id: order.id,
        provider: "manual_pix",
        method: "pix",
        status: "pending",
        amount: totalPrice,
      });

      setOrderId(order.id);
      setOrderStatus("pending_payment");
      setStep("upload");
      clearCart();
      toast.success("Pedido criado! Agora envie o comprovante.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar pedido");
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile || !orderId || !user) return;
    setUploading(true);
    try {
      const path = await uploadPaymentProof(proofFile, user.id, orderId);

      await supabase.from("payment_proofs").insert({
        order_id: orderId,
        file_path: path,
      });

      await supabase.from("orders").update({ status: "payment_submitted" }).eq("id", orderId);

      setOrderStatus("payment_submitted");
      setStep("status");
      toast.success("Comprovante enviado! Aguarde a aprovação.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar comprovante");
    } finally { setUploading(false); }
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixSettings.key);
    toast.success("Chave PIX copiada!");
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

          {/* Step: Payment Info */}
          {step === "payment" && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="gold-text flex items-center gap-2">
                  <QrCode className="w-5 h-5" /> Pagamento via PIX
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-foreground/60 text-sm mb-1">Total a pagar</p>
                  <p className="text-3xl font-bold text-primary">R$ {totalPrice.toFixed(2)}</p>
                </div>

                {pixSettings.key ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-secondary/40 border border-primary/10">
                      <p className="text-xs text-foreground/60 mb-1">Chave PIX</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-foreground flex-1 break-all">{pixSettings.key}</code>
                        <Button size="icon" variant="ghost" onClick={copyPixKey}><Copy className="w-4 h-4" /></Button>
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
                      <li>4. Clique em "Continuar" e envie o comprovante</li>
                    </ol>
                  </div>
                ) : (
                  <div className="text-center text-foreground/50 py-4">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <p>Chave PIX não configurada. Entre em contato com o suporte.</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => navigate("/carrinho")} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                  </Button>
                  <Button onClick={createOrder} disabled={!pixSettings.key || items.length === 0} className="flex-1 bg-primary text-primary-foreground">
                    Continuar
                  </Button>
                </div>
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
                  <p className="text-foreground/60 text-sm">Agora envie o comprovante do PIX.</p>
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
                <div className="w-16 h-16 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Pagamento em Análise</h2>
                <p className="text-foreground/60">
                  Seu comprovante foi enviado e está sendo analisado. Você receberá uma notificação quando o pagamento for aprovado.
                </p>
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
