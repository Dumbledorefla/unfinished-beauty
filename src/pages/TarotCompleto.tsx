import { useState, useEffect } from "react";
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
import { useOracleAuth } from "@/hooks/useOracleAuth";
import { usePageSEO } from "@/hooks/usePageSEO";

const positions = ["Situação Atual", "Desafio", "Base", "Passado Recente", "Melhor Resultado", "Futuro Próximo"];

export default function TarotCompleto() {
  usePageSEO({ title: "Tarot Completo — Cruz Celta", description: "Leitura profunda de Tarot com 6 cartas e interpretação por IA sobre sua jornada e destino.", path: "/tarot/completo" });
  const { restoredState, requireAuth, clearRestored, user } = useOracleAuth({ methodId: "tarot-completo", returnTo: "/tarot/completo" });
  const [step, setStep] = useState<"form" | "drawing" | "result">("form");
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [interpretation, setInterpretation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [lastData, setLastData] = useState<{ userName: string; birthDate: string } | null>(null);

  useEffect(() => {
    if (restoredState) {
      const { userData, methodState } = restoredState;
      clearRestored();
      runGeneration({ userName: userData.name, birthDate: userData.birthDate }, methodState?.cards as TarotCard[] | undefined);
    }
  }, [restoredState]);

  const handleStart = (data: { userName: string; birthDate: string }) => {
    const drawn = drawCards(6);
    if (!requireAuth({ name: data.userName, birthDate: data.birthDate }, { cards: drawn })) return;
    runGeneration(data, drawn);
  };

  const runGeneration = async (data: { userName: string; birthDate: string }, preDrawn?: TarotCard[]) => {
    setLoading(true);
    setError(false);
    setStep("drawing");
    setLastData(data);
    const drawn = preDrawn || drawCards(6);
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
      setStep("result");
    } catch {
      setError(true);
      setStep("result");
    }
    setLoading(false);
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
            <p className="text-foreground/70 text-lg">Gerando sua interpretação…</p>
          </motion.div>
        )}
        {step === "result" && error && (
          <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 space-y-4">
            <p className="text-foreground/70 text-lg">Não foi possível gerar sua interpretação agora.</p>
            <Button onClick={() => lastData && runGeneration(lastData, cards.length ? cards : undefined)} variant="outline" className="border-primary/30">Tentar novamente</Button>
          </motion.div>
        )}
        {step === "result" && !error && cards.length > 0 && (
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
                <div className="oracle-prose"><ReactMarkdown>{interpretation}</ReactMarkdown></div>
              </CardContent>
            </Card>
            <ShareButtons text={interpretation} title="Tarot Completo" />
            <div className="text-center">
              <Button onClick={() => { setStep("form"); setCards([]); setInterpretation(""); setError(false); }} variant="outline" className="border-primary/30">
                <RotateCcw className="w-4 h-4 mr-2" /> Nova Leitura
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OracleLayout>
  );
}
