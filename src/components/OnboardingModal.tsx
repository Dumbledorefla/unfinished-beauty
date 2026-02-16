import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Calculator, Users, ArrowRight,
  Sparkles, X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ONBOARDING_KEY = "oraculo-onboarding-seen";

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const steps: OnboardingStep[] = [
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "Bem-vinda ao Chave do Oráculo",
    description: "Sua jornada de autoconhecimento começa aqui. Descubra o que os astros, as cartas e os números revelam sobre você.",
    color: "text-primary",
  },
  {
    icon: <Star className="w-8 h-8" />,
    title: "Tarot Personalizado",
    description: "Tire cartas e receba interpretações únicas feitas por inteligência artificial, baseadas em conhecimentos ancestrais.",
    color: "text-amber-400",
  },
  {
    icon: <Calculator className="w-8 h-8" />,
    title: "Numerologia e Horóscopo",
    description: "Descubra seus números pessoais e receba previsões diárias para amor, trabalho e saúde.",
    color: "text-emerald-400",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Consultas com Taromantes",
    description: "Agende sessões ao vivo com taromantes experientes para orientação personalizada.",
    color: "text-pink-400",
  },
];

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setVisible(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleStartReading = () => {
    handleClose();
    navigate("/tarot/dia");
  };

  if (!visible) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-card border border-primary/20 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-secondary/60 hover:bg-secondary text-foreground/50 hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="relative p-8 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* Icon */}
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center ${step.color}`}>
                  {step.icon}
                </div>

                {/* Text */}
                <div>
                  <h2 className="text-xl font-serif font-bold text-foreground mb-2">
                    {step.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-6 mb-6">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? "bg-primary w-6"
                      : "bg-foreground/20 hover:bg-foreground/40"
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {isLast ? (
                <Button
                  onClick={handleStartReading}
                  className="w-full bg-primary text-primary-foreground gap-2"
                >
                  <Star className="w-4 h-4" />
                  Fazer Minha Primeira Leitura
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="w-full bg-primary text-primary-foreground gap-2"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleClose}
                className="w-full text-foreground/50"
              >
                {isLast ? "Explorar por conta própria" : "Pular introdução"}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
