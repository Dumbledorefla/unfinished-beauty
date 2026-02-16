import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Star, Heart, Sparkles, ArrowRight, Play, Pause, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { drawCards } from "@/lib/tarot-cards";
import { useStreak } from "@/hooks/useStreak";
import { useJournal } from "@/hooks/useJournal";
import { usePageSEO } from "@/hooks/usePageSEO";
import heroBg from "@/assets/hero-bg.jpg";

const AFFIRMATIONS = [
  "Eu confio no meu caminho e nas minhas escolhas.",
  "A sabedoria do universo me guia a cada passo.",
  "Eu sou merecedora de amor, abundância e paz.",
  "Hoje eu escolho ver as oportunidades em cada desafio.",
  "Minha intuição é minha bússola mais confiável.",
  "Eu libero o que não me serve e acolho o que me fortalece.",
  "A cada dia, eu me conheço mais e me amo mais.",
  "O universo conspira a meu favor, mesmo quando não percebo.",
  "Eu sou forte, sábia e capaz de transformar minha realidade.",
  "Hoje é um dia de clareza, coragem e conexão.",
];

const STEPS = [
  { id: "breathe", title: "Respire", subtitle: "Acalme sua mente", duration: 120, icon: Moon },
  { id: "card", title: "Sua Carta", subtitle: "A mensagem do dia", duration: 0, icon: Star },
  { id: "reflect", title: "Reflita", subtitle: "O que isso significa para você?", duration: 0, icon: Heart },
  { id: "affirm", title: "Afirmação", subtitle: "Leve isso com você", duration: 0, icon: Sparkles },
];

export default function RitualDiario() {
  usePageSEO({ title: "Ritual Diário — Meditação + Carta do Dia", description: "Comece seu dia com meditação, uma carta de tarot, reflexão e uma afirmação poderosa.", path: "/ritual" });

  const { recordActivity } = useStreak();
  const { createEntry } = useJournal();
  const [currentStep, setCurrentStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [breathTimer, setBreathTimer] = useState(120);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [card, setCard] = useState<ReturnType<typeof drawCards>[0] | null>(null);
  const [reflection, setReflection] = useState("");
  const [affirmation] = useState(() => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);

  useEffect(() => {
    if (started && currentStep === 0 && !isPaused && breathTimer > 0) {
      timerRef.current = setInterval(() => {
        setBreathTimer((t) => { if (t <= 1) { clearInterval(timerRef.current!); return 0; } return t - 1; });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [started, currentStep, isPaused, breathTimer]);

  useEffect(() => {
    if (currentStep !== 0 || !started) return;
    const elapsed = 120 - breathTimer;
    const cycle = elapsed % 12;
    if (cycle < 4) setBreathPhase("inhale");
    else if (cycle < 8) setBreathPhase("hold");
    else setBreathPhase("exhale");
  }, [breathTimer, currentStep, started]);

  const startRitual = () => { setStarted(true); setCard(drawCards(1)[0]); };

  const nextStep = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
      recordActivity();
      if (reflection.trim() && card) {
        await createEntry({
          title: `Ritual Diário — ${card.name}`,
          entry_type: "ritual",
          content: `**Carta:** ${card.name} (${card.upright ? "Normal" : "Invertida"})\n\n**Reflexão:** ${reflection}\n\n**Afirmação:** ${affirmation}`,
          cards: [{ name: card.name, upright: card.upright }],
          tags: ["ritual-diario", card.name.toLowerCase().replace(/\s/g, "-")],
        });
      }
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const StepIcon = STEPS[currentStep]?.icon || Sparkles;

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          {!started ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <Moon className="w-16 h-16 text-primary mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-foreground mb-4 font-serif">Ritual Diário</h1>
              <p className="text-muted-foreground mb-2">4 passos para começar o dia com clareza:</p>
              <div className="space-y-2 mb-8 text-sm text-foreground/60">
                {STEPS.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-3 justify-center">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">{i + 1}</span>
                    <span>{step.title} — {step.subtitle}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mb-6">Duração: ~5 minutos</p>
              <Button size="lg" onClick={startRitual}><Play className="w-5 h-5 mr-2" /> Começar ritual</Button>
            </motion.div>
          ) : completed ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3 font-serif">Ritual Completo</h2>
              <p className="text-muted-foreground mb-6">Que este dia seja guiado por <strong className="text-primary">{card?.name}</strong>.</p>
              <p className="text-lg italic text-foreground/70 mb-8">"{affirmation}"</p>
              <Button variant="outline" onClick={() => window.location.reload()}><RotateCcw className="w-4 h-4 mr-2" /> Fazer novamente</Button>
            </motion.div>
          ) : (
            <div>
              <div className="flex gap-2 mb-8">
                {STEPS.map((_, i) => <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= currentStep ? "bg-primary" : "bg-secondary/40"}`} />)}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
                  <StepIcon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-foreground mb-1 font-serif">{STEPS[currentStep].title}</h2>
                  <p className="text-muted-foreground mb-8">{STEPS[currentStep].subtitle}</p>

                  {currentStep === 0 && (
                    <div>
                      <motion.div animate={{ scale: breathPhase === "inhale" ? 1.3 : breathPhase === "hold" ? 1.3 : 1 }} transition={{ duration: 4, ease: "easeInOut" }}
                        className="w-40 h-40 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6">
                        <span className="text-lg text-primary font-medium">{breathPhase === "inhale" ? "Inspire..." : breathPhase === "hold" ? "Segure..." : "Expire..."}</span>
                      </motion.div>
                      <p className="text-3xl font-bold text-foreground mb-4">{formatTime(breathTimer)}</p>
                      <div className="flex gap-3 justify-center">
                        <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)}>{isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}</Button>
                        <Button size="sm" onClick={nextStep}>Pular <ArrowRight className="w-4 h-4 ml-1" /></Button>
                      </div>
                      {breathTimer === 0 && <Button className="mt-4" onClick={nextStep}>Continuar <ArrowRight className="w-4 h-4 ml-1" /></Button>}
                    </div>
                  )}

                  {currentStep === 1 && card && (
                    <div>
                      <motion.div initial={{ rotateY: 180 }} animate={{ rotateY: 0 }} transition={{ duration: 0.8 }}
                        className="w-48 h-72 bg-secondary/30 backdrop-blur border border-primary/20 rounded-2xl flex flex-col items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/10">
                        <span className="text-6xl mb-3">{card.image}</span>
                        <p className="font-serif font-bold text-foreground text-lg">{card.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{card.upright ? "Normal" : "Invertida"}</p>
                        <div className="flex flex-wrap gap-1 mt-3 justify-center px-4">
                          {card.keywords.map((kw) => <span key={kw} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{kw}</span>)}
                        </div>
                      </motion.div>
                      <p className="text-sm text-muted-foreground mb-6">Observe a carta. O que ela desperta em você?</p>
                      <Button onClick={nextStep}>Continuar <ArrowRight className="w-4 h-4 ml-1" /></Button>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div>
                      <p className="text-sm text-foreground/70 mb-4">A carta <strong className="text-primary">{card?.name}</strong> apareceu hoje. O que ela significa?</p>
                      <Textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="Escreva livremente..." className="min-h-[120px] mb-6" />
                      <Button onClick={nextStep}>{reflection.trim() ? "Continuar" : "Pular"} <ArrowRight className="w-4 h-4 ml-1" /></Button>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div>
                      <div className="bg-secondary/30 backdrop-blur border border-primary/20 rounded-2xl p-8 mb-8 shadow-lg shadow-primary/10">
                        <p className="text-xl italic text-foreground leading-relaxed">"{affirmation}"</p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-6">Repita essa afirmação. Leve-a com você hoje.</p>
                      <Button onClick={nextStep}><Check className="w-4 h-4 mr-2" /> Completar ritual</Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
