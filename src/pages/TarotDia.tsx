import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, RotateCcw } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import OracleLayout from "@/components/OracleLayout";
import UserDataForm from "@/components/UserDataForm";
import PersonaSelector, { PERSONAS } from "@/components/PersonaSelector";
import SoundscapePlayer from "@/components/SoundscapePlayer";
import SaveToJournal from "@/components/SaveToJournal";
import { drawCards, TarotCard } from "@/lib/tarot-cards";
import { supabase } from "@/integrations/supabase/client";
import { useOracleAuth } from "@/hooks/useOracleAuth";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import { useStreak } from "@/hooks/useStreak";

export default function TarotDia() {
  usePageSEO({ title: "Tarot do Dia Grátis — Tire Sua Carta e Receba uma Mensagem Personalizada", description: "Tire sua carta do dia gratuitamente e receba uma interpretação personalizada com seu nome e data de nascimento.", path: "/tarot/dia" });
  useStructuredData([
    { type: "service", name: "Tarot do Dia Grátis", description: "Tire sua carta do dia gratuitamente e receba uma interpretação personalizada para o seu momento.", url: `${window.location.origin}/tarot/dia` },
    { type: "breadcrumb", items: [{ name: "Início", url: window.location.origin }, { name: "Tarot do Dia", url: `${window.location.origin}/tarot/dia` }] },
  ]);
  const { restoredState, requireAuth, clearRestored, user } = useOracleAuth({ methodId: "tarot-dia", returnTo: "/tarot/dia" });
  const { recordActivity } = useStreak();
  const [step, setStep] = useState<"form" | "drawing" | "result">("form");
  const [card, setCard] = useState<TarotCard | null>(null);
  const [interpretation, setInterpretation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [lastData, setLastData] = useState<{ userName: string; birthDate: string } | null>(null);
  const [persona, setPersona] = useState("");

  useEffect(() => {
    if (restoredState) {
      const { userData, methodState } = restoredState;
      clearRestored();
      const restoredCard = methodState?.card as TarotCard | undefined;
      runGeneration({ userName: userData.name, birthDate: userData.birthDate }, restoredCard);
    }
  }, [restoredState]);

  const handleStart = (data: { userName: string; birthDate: string }) => {
    const drawnCard = drawCards(1)[0];
    if (!requireAuth({ name: data.userName, birthDate: data.birthDate }, { card: drawnCard })) return;
    runGeneration(data, drawnCard);
  };

  const runGeneration = async (data: { userName: string; birthDate: string }, preDrawnCard?: TarotCard) => {
    setLoading(true);
    setError(false);
    setStep("drawing");
    setLastData(data);

    const drawnCard = preDrawnCard || drawCards(1)[0];
    setCard(drawnCard);

    const selectedPersona = PERSONAS.find((p) => p.id === persona);

    try {
      const { data: result } = await supabase.functions.invoke("oracle-interpret", {
        body: {
          type: "tarot-dia",
          data: { userName: data.userName, birthDate: data.birthDate, card: drawnCard },
          persona: selectedPersona?.systemPrompt || "",
        },
      });
      setInterpretation(result?.interpretation || "A interpretação não está disponível no momento.");
      if (user) {
        await supabase.from("tarot_readings").insert({
          user_id: user.id, reading_type: "dia", cards: [drawnCard] as any,
          interpretation: result?.interpretation, user_name: data.userName,
        });
      }
      recordActivity();
      setStep("result");
    } catch {
      setError(true);
      setInterpretation("");
      setStep("result");
    }
    setLoading(false);
  };

  const reset = () => {
    setStep("form");
    setCard(null);
    setInterpretation("");
    setError(false);
    setLastData(null);
  };

  return (
    <OracleLayout title="Tarot do Dia" icon={<Star className="w-5 h-5" />}>
      {step !== "form" && <SoundscapePlayer />}
      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <PersonaSelector selected={persona} onSelect={setPersona} />
            <UserDataForm title="Sua Carta do Dia" description="Seu nome e data de nascimento tornam a leitura única — feita só para você." onSubmit={handleStart} loading={loading} />
          </motion.div>
        )}
        {step === "drawing" && (
          <motion.div key="drawing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
            <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-8xl mb-6">🃏</motion.div>
            <p className="text-foreground/70 text-lg">As cartas estão se revelando...</p>
          </motion.div>
        )}
        {step === "result" && error && (
          <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 space-y-4">
            <p className="text-foreground/70 text-lg">Não foi possível gerar sua interpretação agora.</p>
            <Button onClick={() => lastData && runGeneration(lastData, card || undefined)} variant="outline" className="border-primary/30">
              Tentar novamente
            </Button>
          </motion.div>
        )}
        {step === "result" && !error && card && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <Card className="glass-card text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <CardContent className="pt-10 pb-8 relative">
                <motion.div initial={{ scale: 0, rotateY: 180 }} animate={{ scale: 1, rotateY: 0 }} transition={{ type: "spring", duration: 0.8 }}>
                  <div className={`text-8xl mb-6 ${!card.upright ? "rotate-180" : ""}`}>{card.image}</div>
                </motion.div>
                <h2 className="font-serif text-3xl font-bold text-primary mb-2">{card.name}</h2>
                <p className="text-muted-foreground text-sm mb-4">{card.upright ? "Posição Normal" : "Posição Invertida"}</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {card.keywords.map((kw) => (
                    <span key={kw} className="px-3 py-1 text-xs rounded-full bg-primary/15 text-primary border border-primary/20 font-medium">{kw}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-8 pb-6">
                <h3 className="font-serif text-xl font-bold text-primary mb-6 flex items-center gap-2">✨ O que as cartas dizem para você</h3>
                <div className="oracle-prose"><ReactMarkdown>{interpretation}</ReactMarkdown></div>
              </CardContent>
            </Card>
            <div className="flex flex-wrap gap-3 justify-center">
              <ShareButtons text={interpretation} title={`Tarot do Dia - ${card.name}`} />
              <SaveToJournal readingType="Tarot do Dia" cards={[card]} interpretation={interpretation} />
            </div>
            <div className="text-center pt-2">
              <Button onClick={reset} variant="outline" className="border-primary/20 text-foreground/70 hover:text-primary hover:bg-primary/10">
                <RotateCcw className="w-4 h-4 mr-2" /> Nova Leitura
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OracleLayout>
  );
}
