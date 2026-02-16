import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, RotateCcw, Sparkles } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import OracleLayout from "@/components/OracleLayout";
import UserDataForm from "@/components/UserDataForm";
import FreemiumPaywall from "@/components/FreemiumPaywall";
import TarotCardImage from "@/components/TarotCardImage";
import UpsellSection from "@/components/UpsellSection";
import SoundscapePlayer from "@/components/SoundscapePlayer";
import SaveToJournal from "@/components/SaveToJournal";
import { drawCards, TarotCard } from "@/lib/tarot-cards";
import { PERSONAS } from "@/components/PersonaSelector";
import { supabase } from "@/integrations/supabase/client";
import { useOracleAuth } from "@/hooks/useOracleAuth";
import { useFreemium } from "@/hooks/useFreemium";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useStreak } from "@/hooks/useStreak";

const positions = ["Situação Atual", "Desafio", "Base", "Passado Recente", "Melhor Resultado", "Futuro Próximo"];
const DEFAULT_PERSONA = PERSONAS.find((p) => p.id === "mistica");

export default function TarotCompleto() {
  usePageSEO({ title: "Tarot Completo — Leitura Profunda com 6 Cartas", description: "Uma leitura completa de Tarot com 6 cartas e interpretação detalhada e personalizada. Para quando você precisa de respostas profundas sobre qualquer área da vida.", path: "/tarot/completo" });
  const { restoredState, requireAuth, clearRestored, user } = useOracleAuth({ methodId: "tarot-completo", returnTo: "/tarot/completo" });
  const { product, hasAccess, purchaseReading } = useFreemium("tarot-completo");
  const { recordActivity } = useStreak();
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
        body: {
          type: "tarot-completo",
          data: { userName: data.userName, birthDate: data.birthDate, cards: drawn },
          persona: DEFAULT_PERSONA?.systemPrompt || "",
        },
      });
      setInterpretation(result?.interpretation || "Interpretação indisponível.");
      if (user) {
        await supabase.from("tarot_readings").insert({
          user_id: user.id, reading_type: "completo", cards: drawn as any,
          interpretation: result?.interpretation, user_name: data.userName,
        });
      }
      recordActivity();
      setStep("result");
    } catch {
      setError(true);
      setStep("result");
    }
    setLoading(false);
  };

  return (
    <OracleLayout title="Tarot Completo" icon={<Eye className="w-5 h-5" />}>
      {step !== "form" && <SoundscapePlayer />}
      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <UserDataForm title="Leitura Completa de Tarot" description="6 cartas, uma história completa. Para quando você precisa de respostas profundas sobre qualquer área da vida." onSubmit={handleStart} loading={loading} />
          </motion.div>
        )}
        {step === "drawing" && (
          <motion.div key="drawing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
            <div className="flex justify-center gap-2 flex-wrap max-w-xs mx-auto">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.div key={i} animate={{ rotateY: [0, 360] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }} className="w-16 h-24">
                  <img src="/tarot-cards/card-back.jpg" alt="Carta de tarot" className="w-full h-full object-cover rounded-lg shadow-xl" />
                </motion.div>
              ))}
            </div>
            <p className="text-foreground/70 text-lg mt-6">As cartas estão se revelando...</p>
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
                      <TarotCardImage card={card} size="sm" />
                      <h3 className="font-serif text-xs font-bold text-foreground mt-1">{card.name}</h3>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <Card className="bg-card/80 backdrop-blur-md border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-serif text-xl font-bold text-primary mb-4">🔮 Sua leitura completa</h3>
                <FreemiumPaywall
                  interpretation={interpretation}
                  oracleType="tarot-completo"
                  productName={product?.name || "Tarot Completo"}
                  price={product?.price || 14.90}
                  previewLines={product?.preview_lines || 4}
                  hasAccess={hasAccess}
                  onPurchase={() => purchaseReading()}
                />
              </CardContent>
            </Card>
            {hasAccess && (
              <>
                <div className="flex flex-wrap gap-3 justify-center">
                  <ShareButtons text={interpretation} title="Tarot Completo" />
                  <SaveToJournal readingType="Tarot Completo" cards={cards} interpretation={interpretation} />
                </div>
                <UpsellSection currentOracle="tarot-completo" />
              </>
            )}
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
