import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, RotateCcw } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import OracleLayout from "@/components/OracleLayout";
import UserDataForm from "@/components/UserDataForm";
import { drawCards, TarotCard } from "@/lib/tarot-cards";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePageSEO } from "@/hooks/usePageSEO";

export default function TarotDia() {
  usePageSEO({ title: "Tarot do Dia Grátis", description: "Tire sua carta do dia gratuitamente e receba uma interpretação personalizada por IA.", path: "/tarot/dia" });
  const { user } = useAuth();
  const [step, setStep] = useState<"form" | "drawing" | "result">("form");
  const [card, setCard] = useState<TarotCard | null>(null);
  const [interpretation, setInterpretation] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({ userName: "", birthDate: "" });

  const handleStart = async (data: { userName: string; birthDate: string }) => {
    setUserData(data);
    setLoading(true);
    setStep("drawing");

    const [drawnCard] = drawCards(1);
    setCard(drawnCard);

    try {
      const { data: result } = await supabase.functions.invoke("oracle-interpret", {
        body: { type: "tarot-dia", data: { userName: data.userName, birthDate: data.birthDate, card: drawnCard } },
      });
      setInterpretation(result?.interpretation || "A interpretação não está disponível no momento.");

      if (user) {
        await supabase.from("tarot_readings").insert({
          user_id: user.id,
          reading_type: "dia",
          cards: [drawnCard] as any,
          interpretation: result?.interpretation,
          user_name: data.userName,
        });
      }
    } catch {
      setInterpretation("Não foi possível conectar ao oráculo. Tente novamente.");
    }
    setLoading(false);
    setStep("result");
  };

  const reset = () => {
    setStep("form");
    setCard(null);
    setInterpretation("");
  };

  return (
    <OracleLayout title="Tarot do Dia" icon={<Star className="w-5 h-5" />}>
      <AnimatePresence mode="wait">
        {step === "form" && (
          <UserDataForm
            key="form"
            title="Seus Dados Pessoais"
            description="Para personalizar sua leitura de Tarot, precisamos de algumas informações básicas."
            onSubmit={handleStart}
            loading={loading}
          />
        )}

        {step === "drawing" && (
          <motion.div key="drawing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
            <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-8xl mb-6">
              🃏
            </motion.div>
            <p className="text-foreground/70 text-lg">Consultando o universo...</p>
          </motion.div>
        )}

        {step === "result" && card && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-md border-primary/20 text-center">
              <CardContent className="pt-8 pb-6">
                <motion.div initial={{ scale: 0, rotateY: 180 }} animate={{ scale: 1, rotateY: 0 }} transition={{ type: "spring", duration: 0.8 }}>
                  <div className={`text-8xl mb-4 ${!card.upright ? "rotate-180" : ""}`}>{card.image}</div>
                </motion.div>
                <h2 className="font-serif text-3xl font-bold gold-text mb-2">{card.name}</h2>
                <p className="text-foreground/60 text-sm">{card.upright ? "Posição Normal" : "Posição Invertida"}</p>
                <div className="flex gap-2 justify-center mt-3 flex-wrap">
                  {card.keywords.map((kw) => (
                    <span key={kw} className="px-3 py-1 text-xs rounded-full bg-primary/20 text-primary border border-primary/30">{kw}</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-md border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-serif text-xl font-bold gold-text mb-4">✨ Interpretação</h3>
                <div className="prose prose-invert max-w-none prose-headings:text-primary prose-strong:text-foreground/90 prose-p:text-foreground/80"><ReactMarkdown>{interpretation}</ReactMarkdown></div>
              </CardContent>
            </Card>

            <ShareButtons text={interpretation} title={`Tarot do Dia - ${card.name}`} />
            <div className="text-center">
              <Button onClick={reset} variant="outline" className="border-primary/30 text-foreground hover:bg-primary/10">
                <RotateCcw className="w-4 h-4 mr-2" /> Nova Leitura
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OracleLayout>
  );
}
