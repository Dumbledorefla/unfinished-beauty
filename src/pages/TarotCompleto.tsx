import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, RotateCcw, Sparkles } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import OracleLayout from "@/components/OracleLayout";
import UserDataForm from "@/components/UserDataForm";
import { drawCards, TarotCard } from "@/lib/tarot-cards";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const positions = ["Situação Atual", "Desafio", "Base", "Passado Recente", "Melhor Resultado", "Futuro Próximo"];

export default function TarotCompleto() {
  const { user } = useAuth();
  const [step, setStep] = useState<"form" | "drawing" | "result">("form");
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [interpretation, setInterpretation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async (data: { userName: string; birthDate: string }) => {
    setLoading(true);
    setStep("drawing");
    const drawn = drawCards(6);
    setCards(drawn);

    try {
      const { data: result } = await supabase.functions.invoke("oracle-interpret", {
        body: { type: "tarot-completo", data: { userName: data.userName, birthDate: data.birthDate, cards: drawn } },
      });
      setInterpretation(result?.interpretation || "Interpretação indisponível.");
      if (user) {
        await supabase.from("tarot_readings").insert({
          user_id: user.id, reading_type: "completo", cards: drawn as any,
          interpretation: result?.interpretation, user_name: data.userName,
        });
      }
    } catch { setInterpretation("Erro ao consultar o oráculo."); }
    setLoading(false);
    setStep("result");
  };

  return (
    <OracleLayout title="Tarot Completo" icon={<Eye className="w-5 h-5" />}>
      <AnimatePresence mode="wait">
        {step === "form" && (
          <UserDataForm key="form" title="Leitura Completa de Tarot" description="Uma leitura profunda com 6 cartas sobre sua jornada de vida." onSubmit={handleStart} loading={loading} />
        )}
        {step === "drawing" && (
          <motion.div key="drawing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
            <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-8xl mb-6">🔮</motion.div>
            <p className="text-foreground/70 text-lg">Consultando os arcanos...</p>
          </motion.div>
        )}
        {step === "result" && cards.length > 0 && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center gap-2 justify-center mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm text-primary font-medium">Leitura Premium</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {cards.map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
                  <Card className="bg-card/80 backdrop-blur-md border-primary/20 text-center">
                    <CardContent className="pt-3 pb-3">
                      <p className="text-xs text-primary/80 font-medium mb-1">{positions[i]}</p>
                      <div className={`text-4xl mb-1 ${!card.upright ? "rotate-180" : ""}`}>{card.image}</div>
                      <h3 className="font-serif text-xs font-bold text-foreground">{card.name}</h3>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <Card className="bg-card/80 backdrop-blur-md border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-serif text-xl font-bold gold-text mb-4">🔮 Leitura Completa</h3>
                <div className="prose prose-invert max-w-none prose-headings:text-primary prose-strong:text-foreground/90 prose-p:text-foreground/80"><ReactMarkdown>{interpretation}</ReactMarkdown></div>
              </CardContent>
            </Card>
            <ShareButtons text={interpretation} title="Tarot Completo" />
            <div className="text-center">
              <Button onClick={() => { setStep("form"); setCards([]); setInterpretation(""); }} variant="outline" className="border-primary/30">
                <RotateCcw className="w-4 h-4 mr-2" /> Nova Leitura
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OracleLayout>
  );
}
