import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, RotateCcw } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import OracleLayout from "@/components/OracleLayout";
import UserDataForm from "@/components/UserDataForm";
import FreemiumPaywall from "@/components/FreemiumPaywall";
import { supabase } from "@/integrations/supabase/client";
import { useOracleAuth } from "@/hooks/useOracleAuth";
import { useFreemium } from "@/hooks/useFreemium";
import { usePageSEO } from "@/hooks/usePageSEO";

export default function Numerologia() {
  usePageSEO({ title: "Mapa Numerológico", description: "Calcule seus números pessoais e descubra propósito, talentos e desafios pela Numerologia.", path: "/numerologia" });
  const { restoredState, requireAuth, clearRestored } = useOracleAuth({ methodId: "numerologia", returnTo: "/numerologia" });
  const { product, hasAccess, purchaseReading } = useFreemium("numerologia");
  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [interpretation, setInterpretation] = useState("");
  const [error, setError] = useState(false);
  const [lastData, setLastData] = useState<{ userName: string; birthDate: string } | null>(null);

  useEffect(() => {
    if (restoredState) {
      const { userData } = restoredState;
      clearRestored();
      runGeneration({ userName: userData.name, birthDate: userData.birthDate });
    }
  }, [restoredState]);

  const handleStart = (data: { userName: string; birthDate: string }) => {
    if (!requireAuth({ name: data.userName, birthDate: data.birthDate })) return;
    runGeneration(data);
  };

  const runGeneration = async (data: { userName: string; birthDate: string }) => {
    setError(false);
    setStep("loading");
    setLastData(data);
    try {
      const { data: result } = await supabase.functions.invoke("oracle-interpret", {
        body: { type: "numerologia", data },
      });
      setInterpretation(result?.interpretation || "Interpretação indisponível.");
      setStep("result");
    } catch {
      setError(true);
      setStep("result");
    }
  };

  return (
    <OracleLayout title="Numerologia" icon={<Calculator className="w-5 h-5" />}>
      <AnimatePresence mode="wait">
        {step === "form" && (
          <UserDataForm key="form" title="Seus Dados para Numerologia" description="Para calcular seu mapa numerológico, precisamos do seu nome completo e data de nascimento." onSubmit={handleStart} />
        )}
        {step === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-8xl mb-6">🔢</motion.div>
            <p className="text-foreground/70 text-lg">Gerando sua interpretação…</p>
          </motion.div>
        )}
        {step === "result" && error && (
          <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 space-y-4">
            <p className="text-foreground/70 text-lg">Não foi possível gerar sua interpretação agora.</p>
            <Button onClick={() => lastData && runGeneration(lastData)} variant="outline" className="border-primary/30">Tentar novamente</Button>
          </motion.div>
        )}
        {step === "result" && !error && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-md border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-serif text-xl font-bold text-primary mb-4">🔢 Seu Mapa Numerológico</h3>
                <FreemiumPaywall
                  interpretation={interpretation}
                  oracleType="numerologia"
                  productName={product?.name || "Mapa Numerológico"}
                  price={product?.price || 9.90}
                  previewLines={product?.preview_lines || 4}
                  hasAccess={hasAccess}
                  onPurchase={() => purchaseReading()}
                />
              </CardContent>
            </Card>
            {hasAccess && <ShareButtons text={interpretation} title="Mapa Numerológico" />}
            <div className="text-center">
              <Button onClick={() => { setStep("form"); setInterpretation(""); setError(false); }} variant="outline" className="border-primary/30">
                <RotateCcw className="w-4 h-4 mr-2" /> Novo Cálculo
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OracleLayout>
  );
}
