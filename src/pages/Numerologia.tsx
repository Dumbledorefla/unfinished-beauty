import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import OracleLayout from "@/components/OracleLayout";
import UserDataForm from "@/components/UserDataForm";
import { supabase } from "@/integrations/supabase/client";

export default function Numerologia() {
  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [interpretation, setInterpretation] = useState("");

  const handleStart = async (data: { userName: string; birthDate: string }) => {
    setStep("loading");
    try {
      const { data: result } = await supabase.functions.invoke("oracle-interpret", {
        body: { type: "numerologia", data },
      });
      setInterpretation(result?.interpretation || "Interpretação indisponível.");
    } catch { setInterpretation("Erro ao consultar."); }
    setStep("result");
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
            <p className="text-foreground/70 text-lg">Calculando seus números...</p>
          </motion.div>
        )}
        {step === "result" && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-md border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-serif text-xl font-bold gold-text mb-4">🔢 Seu Mapa Numerológico</h3>
                <div className="prose prose-invert max-w-none prose-headings:text-primary prose-strong:text-foreground/90 prose-p:text-foreground/80"><ReactMarkdown>{interpretation}</ReactMarkdown></div>
              </CardContent>
            </Card>
            <div className="text-center">
              <Button onClick={() => { setStep("form"); setInterpretation(""); }} variant="outline" className="border-primary/30">
                <RotateCcw className="w-4 h-4 mr-2" /> Novo Cálculo
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OracleLayout>
  );
}
