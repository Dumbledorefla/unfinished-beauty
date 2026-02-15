import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, RotateCcw } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import OracleLayout from "@/components/OracleLayout";
import UserDataForm from "@/components/UserDataForm";
import { getZodiacSign, zodiacEmojis } from "@/lib/tarot-cards";
import { supabase } from "@/integrations/supabase/client";
import { useOracleAuth } from "@/hooks/useOracleAuth";
import { usePageSEO } from "@/hooks/usePageSEO";

export default function Horoscopo() {
  usePageSEO({ title: "Horóscopo do Dia", description: "Previsões diárias personalizadas para amor, trabalho e saúde com base no seu signo.", path: "/horoscopo" });
  const { restoredState, requireAuth, clearRestored } = useOracleAuth({ methodId: "horoscopo", returnTo: "/horoscopo" });
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
      setStep("result");
    } catch {
      setError(true);
      setStep("result");
    }
  };

  return (
    <OracleLayout title="Horóscopo" icon={<Sun className="w-5 h-5" />}>
      <AnimatePresence mode="wait">
        {step === "form" && (
          <UserDataForm key="form" title="Seus Dados para Horóscopo" description="Para personalizar suas previsões astrológicas, precisamos do seu nome completo e data de nascimento." onSubmit={handleStart} />
        )}
        {step === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="text-8xl mb-6">☀️</motion.div>
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
            <Card className="bg-card/80 backdrop-blur-md border-primary/20 text-center">
              <CardContent className="pt-6">
                <div className="text-6xl mb-2">{zodiacEmojis[sign] || "⭐"}</div>
                <h2 className="font-serif text-3xl font-bold gold-text">{sign}</h2>
                <p className="text-foreground/60 text-sm mt-1">Horóscopo do dia - {new Date().toLocaleDateString("pt-BR")}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-md border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-serif text-xl font-bold gold-text mb-4">☀️ Previsões do Dia</h3>
                <div className="oracle-prose"><ReactMarkdown>{interpretation}</ReactMarkdown></div>
              </CardContent>
            </Card>
            <ShareButtons text={interpretation} title={`Horóscopo - ${sign}`} />
            <div className="text-center">
              <Button onClick={() => { setStep("form"); setInterpretation(""); setError(false); }} variant="outline" className="border-primary/30">
                <RotateCcw className="w-4 h-4 mr-2" /> Nova Consulta
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OracleLayout>
  );
}
