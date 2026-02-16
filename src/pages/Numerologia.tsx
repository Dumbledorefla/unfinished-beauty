import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, RotateCcw } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import OracleLayout from "@/components/OracleLayout";
import UserDataForm from "@/components/UserDataForm";
import FreemiumPaywall from "@/components/FreemiumPaywall";
import { supabase } from "@/integrations/supabase/client";
import { useOracleAuth } from "@/hooks/useOracleAuth";
import { useFreemium } from "@/hooks/useFreemium";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import { useStreak } from "@/hooks/useStreak";

export default function Numerologia() {
  usePageSEO({ title: "Mapa Numerológico Grátis — Descubra Seus Números de Destino e Propósito", description: "Calcule seus números pessoais de destino, expressão e alma. Descubra o que seu nome e data de nascimento revelam sobre seu propósito de vida.", path: "/numerologia" });
  useStructuredData([
    { type: "service", name: "Mapa Numerológico", description: "Calcule seus números pessoais de destino, expressão e alma.", url: `${window.location.origin}/numerologia` },
    { type: "breadcrumb", items: [{ name: "Início", url: window.location.origin }, { name: "Numerologia", url: `${window.location.origin}/numerologia` }] },
  ]);
  const { restoredState, requireAuth, clearRestored } = useOracleAuth({ methodId: "numerologia", returnTo: "/numerologia" });
  const { product, hasAccess, purchaseReading } = useFreemium("numerologia");
  const { recordActivity } = useStreak();
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
      recordActivity();
      setStep("result");
    } catch {
      setError(true);
      setStep("result");
    }
  };

  return (
    <OracleLayout title="Numerologia" icon={<Calculator className="w-5 h-5" />}
      extraContent={
        step === "form" ? (
          <div className="space-y-6 mt-8">
             <Card className="bg-card/60 backdrop-blur-md border-white/8 p-6">
              <h3 className="font-semibold text-foreground mb-3">O que é a Numerologia?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A Numerologia é uma ciência milenar que revela padrões ocultos no seu nome e data de nascimento. Cada número carrega uma vibração única que influencia sua personalidade, seus talentos e seu caminho de vida.
              </p>
            </Card>
             <Card className="bg-card/60 backdrop-blur-md border-white/8 p-6">
              <h3 className="font-semibold text-foreground mb-3">O que você vai descobrir</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>🔢 Número do Destino — seu propósito de vida</li>
                <li>💎 Número da Expressão — como o mundo te vê</li>
                <li>❤️ Número da Alma — seus desejos mais profundos</li>
              </ul>
            </Card>
            <Card className="bg-card/60 backdrop-blur-md border-white/8 p-6">
              <h3 className="font-semibold text-foreground mb-3">Explore mais</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/tarot/dia" className="p-3 rounded-xl bg-secondary/40 border border-border/20 hover:border-primary/30 transition-all text-center">
                  <p className="font-semibold text-foreground text-sm">🔮 Tarot do Dia</p>
                  <p className="text-xs text-muted-foreground">Sua carta de hoje</p>
                </Link>
                <Link to="/mapa-astral" className="p-3 rounded-xl bg-secondary/40 border border-border/20 hover:border-primary/30 transition-all text-center">
                  <p className="font-semibold text-foreground text-sm">🗺️ Mapa Astral</p>
                  <p className="text-xs text-muted-foreground">Seu céu completo</p>
                </Link>
              </div>
            </Card>
          </div>
        ) : undefined
      }
    >
      <AnimatePresence mode="wait">
        {step === "form" && (
          <UserDataForm key="form" title="Seu Mapa Numerológico" description="Seu nome completo e data de nascimento guardam segredos poderosos. Vamos revelá-los." onSubmit={handleStart} />
        )}
        {step === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-8xl mb-6">🔢</motion.div>
            <p className="text-foreground/70 text-lg">As cartas estão se revelando...</p>
          </motion.div>
        )}
        {step === "result" && error && (
          <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 space-y-4">
            <p className="text-foreground/70 text-lg">Não foi possível gerar sua interpretação agora.</p>
            <Button onClick={() => lastData && runGeneration(lastData)} variant="outline" className="border-white/25 text-white hover:bg-white/5">Tentar novamente</Button>
          </motion.div>
        )}
        {step === "result" && !error && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
             <Card className="bg-card/80 backdrop-blur-md border-white/12">
              <CardContent className="pt-6">
                <h3 className="font-serif text-xl font-bold text-amber-400 mb-4">🔢 O que seus números revelam sobre você</h3>
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
              <Button onClick={() => { setStep("form"); setInterpretation(""); setError(false); }} variant="outline" className="border-white/25 text-white hover:bg-white/5">
                <RotateCcw className="w-4 h-4 mr-2" /> Novo Cálculo
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OracleLayout>
  );
}
