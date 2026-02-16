import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import OracleLayout from "@/components/OracleLayout";
import UserDataFormAmor from "@/components/UserDataFormAmor";
import FreemiumPaywall from "@/components/FreemiumPaywall";
import TarotCardImage from "@/components/TarotCardImage";
import SoundscapePlayer from "@/components/SoundscapePlayer";
import SaveToJournal from "@/components/SaveToJournal";
import { drawCards, TarotCard } from "@/lib/tarot-cards";
import { PERSONAS } from "@/components/PersonaSelector";
import { supabase } from "@/integrations/supabase/client";
import { useOracleAuth } from "@/hooks/useOracleAuth";
import { useFreemium } from "@/hooks/useFreemium";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import { useStreak } from "@/hooks/useStreak";

const positions = ["Passado", "Presente", "Futuro"];
const DEFAULT_PERSONA = PERSONAS.find((p) => p.id === "mistica");

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
  const [lastData, setLastData] = useState<{ userName: string; birthDate: string; question?: string } | null>(null);

  useEffect(() => {
    if (restoredState) {
      const { userData, methodState } = restoredState;
      clearRestored();
      runGeneration({ userName: userData.name, birthDate: userData.birthDate, question: methodState?.question as string }, methodState?.cards as TarotCard[] | undefined);
    }
  }, [restoredState]);

  const handleStart = (data: { userName: string; birthDate: string; question: string }) => {
    const drawn = drawCards(3);
    if (!requireAuth({ name: data.userName, birthDate: data.birthDate }, { cards: drawn, question: data.question })) return;
    runGeneration(data, drawn);
  };

  const runGeneration = async (data: { userName: string; birthDate: string; question?: string }, preDrawn?: TarotCard[]) => {
    setLoading(true);
    setError(false);
    setStep("drawing");
    setLastData(data);
    const drawn = preDrawn || drawCards(3);
    setCards(drawn);

    try {
      const { data: result } = await supabase.functions.invoke("oracle-interpret", {
        body: {
          type: "tarot-amor",
          data: { userName: data.userName, birthDate: data.birthDate, cards: drawn, question: data.question },
          persona: DEFAULT_PERSONA?.systemPrompt || "",
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
            <UserDataFormAmor onSubmit={handleStart} loading={loading} />
          </motion.div>
        )}
        {step === "drawing" && (
          <motion.div key="drawing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12 space-y-8">
            {/* Phase 1: Shuffling */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 1, 0] }}
              transition={{ duration: 4, times: [0, 0.8, 1] }}
              className="space-y-4"
            >
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      x: [0, (i - 2) * 15, 0, (2 - i) * 10, 0],
                      rotateZ: [0, -5 + i * 3, 0, 5 - i * 2, 0],
                    }}
                    transition={{ duration: 1.5, repeat: 2, delay: i * 0.1 }}
                    className="w-12 h-[4.5rem] rounded-lg overflow-hidden shadow-lg"
                  >
                    <img src="/tarot-cards/card-back.jpg" alt="" className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
              <p className="text-foreground/70 text-lg font-serif">Embaralhando as cartas...</p>
              <p className="text-muted-foreground text-sm">Concentre-se na sua pergunta</p>
            </motion.div>

            {/* Phase 2: Revealing */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5 }}
              className="space-y-4"
            >
              <div className="flex justify-center gap-6">
                {["Passado", "Presente", "Futuro"].map((pos, i) => (
                  <motion.div
                    key={pos}
                    initial={{ opacity: 0, y: 40, rotateY: 180 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ delay: 4 + i * 1.2, duration: 0.8, type: "spring" }}
                    className="text-center"
                  >
                    <div className="w-16 h-24 rounded-lg overflow-hidden border border-primary/25 mb-2 shadow-xl">
                      <img src="/tarot-cards/card-back.jpg" alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-muted-foreground">{pos}</span>
                  </motion.div>
                ))}
              </div>
              <p className="text-foreground/70 text-lg font-serif">As cartas estão se revelando...</p>
            </motion.div>
          </motion.div>
        )}
        {step === "result" && error && (
          <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 space-y-4">
            <p className="text-foreground/70 text-lg">Não foi possível gerar sua interpretação agora.</p>
            <Button onClick={() => lastData && runGeneration(lastData, cards.length ? cards : undefined)} variant="outline" className="border-white/25 text-white hover:bg-white/5">Tentar novamente</Button>
          </motion.div>
        )}
        {step === "result" && !error && cards.length > 0 && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {cards.map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}>
                  <Card className="bg-card/80 backdrop-blur-md border-white/12 text-center">
                    <CardContent className="pt-4 pb-4">
                      <p className="text-xs text-amber-400 font-medium mb-2">{positions[i]}</p>
                      <TarotCardImage card={card} size="sm" />
                      <h3 className="font-serif text-sm font-bold text-foreground mt-2">{card.name}</h3>
                      <p className="text-foreground/50 text-xs">{card.upright ? "Normal" : "Invertida"}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <Card className="bg-card/80 backdrop-blur-md border-white/12">
              <CardContent className="pt-6">
                <h3 className="font-serif text-xl font-bold text-amber-400 mb-4">💕 O que as cartas revelam sobre o seu amor</h3>
                <FreemiumPaywall
                  interpretation={interpretation}
                  oracleType="tarot-amor"
                  productName={product?.name || "Tarot do Amor"}
                  price={product?.price || 9.90}
                  previewLines={product?.preview_lines || 3}
                  hasAccess={hasAccess}
                  onPurchase={() => purchaseReading()}
                />
              </CardContent>
            </Card>
            {hasAccess && (
              <>
                <div className="flex flex-wrap gap-3 justify-center">
                  <ShareButtons text={interpretation} title="Tarot do Amor" />
                  <SaveToJournal readingType="Tarot do Amor" cards={cards} interpretation={interpretation} />
                </div>
                {/* Upsell → Tarot Completo */}
                <Card className="glass-card border-amber-500/20">
                  <CardContent className="py-6 text-center space-y-3">
                    <h3 className="font-serif text-lg font-bold text-foreground">Quer uma visão ainda mais profunda?</h3>
                    <p className="text-muted-foreground text-sm">O Tarot Completo usa 6 cartas para analisar todas as áreas da sua vida com detalhes.</p>
                    <Link to="/tarot/completo">
                      <Button className="bg-amber-500 text-slate-900 hover:bg-amber-400 font-semibold">Fazer Tarot Completo (6 cartas)</Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            )}
            <div className="text-center">
              <Button onClick={() => { setStep("form"); setCards([]); setInterpretation(""); setError(false); }} variant="outline" className="border-white/25 text-white hover:bg-white/5">
                <RotateCcw className="w-4 h-4 mr-2" /> Nova Leitura
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OracleLayout>
  );
}
