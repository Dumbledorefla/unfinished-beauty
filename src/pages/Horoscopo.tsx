import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, RotateCcw } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import OracleLayout from "@/components/OracleLayout";
import UserDataForm from "@/components/UserDataForm";
import FreemiumPaywall from "@/components/FreemiumPaywall";
import { getZodiacSign, zodiacEmojis } from "@/lib/tarot-cards";
import { supabase } from "@/integrations/supabase/client";
import { useOracleAuth } from "@/hooks/useOracleAuth";
import { useFreemium } from "@/hooks/useFreemium";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import { useStreak } from "@/hooks/useStreak";

export default function Horoscopo() {
  usePageSEO({ title: "Horóscopo do Dia Personalizado — Previsões de Amor, Trabalho e Saúde", description: "Receba previsões diárias personalizadas para amor, trabalho e saúde. Horóscopo feito sob medida para o seu signo e momento de vida.", path: "/horoscopo" });
  useStructuredData([
    { type: "breadcrumb", items: [{ name: "Início", url: window.location.origin }, { name: "Horóscopo", url: `${window.location.origin}/horoscopo` }] },
    { type: "faq", questions: [
      { question: "O Horóscopo é personalizado?", answer: "Sim! Diferente dos horóscopos genéricos, nossa leitura usa seu nome, data de nascimento e o momento astrológico atual para criar previsões únicas." },
      { question: "Com que frequência o horóscopo é atualizado?", answer: "As previsões são geradas em tempo real a cada consulta, considerando as posições astrológicas atuais." },
    ]},
  ]);
  const { restoredState, requireAuth, clearRestored } = useOracleAuth({ methodId: "horoscopo", returnTo: "/horoscopo" });
  const { product, hasAccess, purchaseReading } = useFreemium("horoscopo");
  const { recordActivity } = useStreak();
  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [interpretation, setInterpretation] = useState("");
  const [sign, setSign] = useState("");
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
    const userSign = getZodiacSign(data.birthDate);
    setSign(userSign);
    setError(false);
    setStep("loading");
    setLastData(data);
    try {
      const { data: result } = await supabase.functions.invoke("oracle-interpret", {
        body: { type: "horoscopo", data: { ...data, sign: userSign } },
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
    <OracleLayout title="Horóscopo" icon={<Sun className="w-5 h-5" />}
      extraContent={
        step === "form" ? (
          <div className="space-y-6 mt-8">
             <Card className="bg-card/60 backdrop-blur-md border-white/8 p-6">
              <h3 className="font-semibold text-foreground mb-3">Como funciona o Horóscopo Personalizado?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Diferente dos horóscopos genéricos de revista, nosso sistema cria uma previsão única baseada no seu signo solar, data de nascimento e o momento astrológico atual. Cada leitura é exclusiva para você.
              </p>
            </Card>
             <Card className="bg-card/60 backdrop-blur-md border-white/8 p-6">
              <h3 className="font-semibold text-foreground mb-3">O que você vai receber</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✨ Previsão personalizada para amor, trabalho e saúde</li>
                <li>🌙 Energia do dia e como aproveitá-la</li>
                <li>💡 Conselho prático para o seu momento</li>
              </ul>
            </Card>
            <Card className="bg-card/60 backdrop-blur-md border-white/8 p-6">
              <h3 className="font-semibold text-foreground mb-3">Explore mais</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/mapa-astral" className="p-3 rounded-xl bg-secondary/40 border border-border/20 hover:border-primary/30 transition-all text-center">
                  <p className="font-semibold text-foreground text-sm">🗺️ Mapa Astral</p>
                  <p className="text-xs text-muted-foreground">Seu mapa completo</p>
                </Link>
                <Link to="/compatibilidade" className="p-3 rounded-xl bg-secondary/40 border border-border/20 hover:border-primary/30 transition-all text-center">
                  <p className="font-semibold text-foreground text-sm">💕 Compatibilidade</p>
                  <p className="text-xs text-muted-foreground">Vocês combinam?</p>
                </Link>
              </div>
            </Card>
          </div>
        ) : undefined
      }
    >
      <AnimatePresence mode="wait">
        {step === "form" && (
          <UserDataForm key="form" title="Seu Horóscopo do Dia" description="Com seu nome e data de nascimento, criamos previsões feitas sob medida para você." onSubmit={handleStart} />
        )}
        {step === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="text-8xl mb-6">☀️</motion.div>
            <p className="text-foreground/70 text-lg">Consultando as estrelas para você...</p>
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
            <Card className="bg-card/80 backdrop-blur-md border-white/12 text-center">
              <CardContent className="pt-6">
                <div className="text-6xl mb-2">{zodiacEmojis[sign] || "⭐"}</div>
                <h2 className="font-serif text-3xl font-bold text-amber-400">{sign}</h2>
                <p className="text-muted-foreground text-sm mt-1">Horóscopo do dia — {new Date().toLocaleDateString("pt-BR")}</p>
              </CardContent>
            </Card>
             <Card className="bg-card/80 backdrop-blur-md border-white/12">
              <CardContent className="pt-6">
                <h3 className="font-serif text-xl font-bold text-amber-400 mb-4">☀️ O que os astros dizem para você hoje</h3>
                <FreemiumPaywall
                  interpretation={interpretation}
                  oracleType="horoscopo"
                  productName={product?.name || "Horóscopo do Dia"}
                  price={product?.price || 4.90}
                  previewLines={product?.preview_lines || 3}
                  hasAccess={hasAccess}
                  onPurchase={() => purchaseReading()}
                />
              </CardContent>
            </Card>
            {hasAccess && <ShareButtons text={interpretation} title={`Horóscopo - ${sign}`} />}
            <div className="text-center">
              <Button onClick={() => { setStep("form"); setInterpretation(""); setError(false); }} variant="outline" className="border-white/25 text-white hover:bg-white/5">
                <RotateCcw className="w-4 h-4 mr-2" /> Nova Consulta
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OracleLayout>
  );
}
