import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, RotateCcw } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import OracleLayout from "@/components/OracleLayout";
import UserDataForm from "@/components/UserDataForm";
import FreemiumPaywall from "@/components/FreemiumPaywall";
import PersonaSelector, { PERSONAS } from "@/components/PersonaSelector";
import SoundscapePlayer from "@/components/SoundscapePlayer";
import SaveToJournal from "@/components/SaveToJournal";
import { drawCards, TarotCard } from "@/lib/tarot-cards";
import { supabase } from "@/integrations/supabase/client";
import { useOracleAuth } from "@/hooks/useOracleAuth";
import { useFreemium } from "@/hooks/useFreemium";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import { useStreak } from "@/hooks/useStreak";

const positions = ["Passado", "Presente", "Futuro"];

export default function TarotAmor() {
  usePageSEO({ title: "Tarot do Amor — Leitura de 3 Cartas Sobre Sua Vida Amorosa", description: "Descubra o que as cartas revelam sobre o passado, presente e futuro do seu amor. Leitura gratuita e personalizada.", path: "/tarot/amor" });
  useStructuredData([
    { type: "service", name: "Tarot do Amor", description: "Descubra o que as cartas revelam sobre o passado, presente e futuro do seu amor.", url: `${window.location.origin}/tarot/amor` },
    { type: "breadcrumb", items: [{ name: "Início", url: window.location.origin }, { name: "Tarot do Amor", url: `${window.location.origin}/tarot/amor` }] },
  ]);
  const { restoredState, requireAuth, clearRestored, user } = useOracleAuth({ methodId: "tarot-amor", returnTo: "/tarot/amor" });
  const { product, hasAccess, purchaseReading } = useFreemium("tarot-amor");
  const { recordActivity } = useStreak();
  const [step, setStep] = useState<"form" | "drawing" | "result">("form");
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [interpretation, setInterpretation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [lastData, setLastData] = useState<{ userName: string; birthDate: string } | null>(null);
  const [persona, setPersona] = useState("");

  useEffect(() => {
    if (restoredState) {
      const { userData, methodState } = restoredState;
      clearRestored();
      runGeneration({ userName: userData.name, birthDate: userData.birthDate }, methodState?.cards as TarotCard[] | undefined);
    }
  }, [restoredState]);

  const handleStart = (data: { userName: string; birthDate: string }) => {
    const drawn = drawCards(3);
    if (!requireAuth({ name: data.userName, birthDate: data.birthDate }, { cards: drawn })) return;
    runGeneration(data, drawn);
  };

  const runGeneration = async (data: { userName: string; birthDate: string }, preDrawn?: TarotCard[]) => {
    setLoading(true);
    setError(false);
    setStep("drawing");
    setLastData(data);
    const drawn = preDrawn || drawCards(3);
    setCards(drawn);

    const selectedPersona = PERSONAS.find((p) => p.id === persona);

    try {
      const { data: result } = await supabase.functions.invoke("oracle-interpret", {
        body: {
          type: "tarot-amor",
          data: { userName: data.userName, birthDate: data.birthDate, cards: drawn },
          persona: selectedPersona?.systemPrompt || "",
        },
      });
      setInterpretation(result?.interpretation || "Interpretação indisponível.");
      if (user) {
        await supabase.from("tarot_readings").insert({
          user_id: user.id, reading_type: "amor", cards: drawn as any,
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
    <OracleLayout title="Tarot e o Amor" icon={<Heart className="w-5 h-5" />}>
      {step !== "form" && <SoundscapePlayer />}
      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <PersonaSelector selected={persona} onSelect={setPersona} />
            <UserDataForm title="Tarot do Amor" description="Descubra o que as cartas revelam sobre o seu coração — passado, presente e futuro." onSubmit={handleStart} loading={loading} />
          </motion.div>
        )}
        {step === "drawing" && (
          <motion.div key="drawing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
            <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-8xl mb-6">💕</motion.div>
            <p className="text-foreground/70 text-lg">As cartas estão se revelando...</p>
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
            <div className="grid grid-cols-3 gap-4">
              {cards.map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}>
                  <Card className="bg-card/80 backdrop-blur-md border-primary/20 text-center">
                    <CardContent className="pt-4 pb-4">
                      <p className="text-xs text-primary font-medium mb-2">{positions[i]}</p>
                      <div className={`text-5xl mb-2 ${!card.upright ? "rotate-180" : ""}`}>{card.image}</div>
                      <h3 className="font-serif text-sm font-bold text-foreground">{card.name}</h3>
                      <p className="text-foreground/50 text-xs">{card.upright ? "Normal" : "Invertida"}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <Card className="bg-card/80 backdrop-blur-md border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-serif text-xl font-bold text-primary mb-4">💕 O que as cartas revelam sobre o seu amor</h3>
                <FreemiumPaywall
                  interpretation={interpretation}
                  oracleType="tarot-amor"
                  productName={product?.name || "Tarot do Amor"}
                  price={product?.price || 9.90}
                  previewLines={product?.preview_lines || 4}
                  hasAccess={hasAccess}
                  onPurchase={() => purchaseReading()}
                />
              </CardContent>
            </Card>
            {hasAccess && (
              <div className="flex flex-wrap gap-3 justify-center">
                <ShareButtons text={interpretation} title="Tarot do Amor" />
                <SaveToJournal readingType="Tarot do Amor" cards={cards} interpretation={interpretation} />
              </div>
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
