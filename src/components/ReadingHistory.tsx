import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, Eye, Calculator, Sun, Compass, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmptyState from "@/components/EmptyState";
import ReactMarkdown from "react-markdown";

interface Reading {
  id: string;
  reading_type: string;
  cards: any;
  interpretation: string | null;
  user_name: string | null;
  created_at: string;
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  dia: { label: "Tarot do Dia", icon: Star, color: "text-amber-400" },
  amor: { label: "Tarot do Amor", icon: Heart, color: "text-pink-400" },
  completo: { label: "Tarot Completo", icon: Eye, color: "text-purple-400" },
  numerologia: { label: "Numerologia", icon: Calculator, color: "text-emerald-400" },
  horoscopo: { label: "Horóscopo", icon: Sun, color: "text-orange-400" },
  "mapa-astral": { label: "Mapa Astral", icon: Compass, color: "text-blue-400" },
};

function ReadingCard({ reading }: { reading: Reading }) {
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[reading.reading_type] || {
    label: reading.reading_type,
    icon: Star,
    color: "text-primary",
  };
  const Icon = config.icon;

  return (
    <div className="rounded-xl bg-secondary/40 border border-primary/10 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ${config.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">{config.label}</p>
            <div className="flex items-center gap-2 text-xs text-foreground/50">
              <Clock className="w-3 h-3" />
              {new Date(reading.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
        {reading.interpretation && (
          expanded ? <ChevronUp className="w-4 h-4 text-foreground/40" /> : <ChevronDown className="w-4 h-4 text-foreground/40" />
        )}
      </button>

      <AnimatePresence>
        {expanded && reading.interpretation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-primary/10 pt-3">
              <div className="prose prose-sm prose-invert max-w-none text-foreground/70">
                <ReactMarkdown>{reading.interpretation}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ReadingHistory({ readings }: { readings: Reading[] }) {
  if (readings.length === 0) {
    return (
      <Card className="bg-card/80 backdrop-blur-md border-primary/20">
        <CardHeader>
          <CardTitle className="gold-text flex items-center gap-2">
            <Clock className="w-5 h-5" /> Histórico de Leituras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Star}
            title="Nenhuma leitura realizada"
            description="Faça sua primeira leitura de tarot e descubra o que os astros revelam para você."
            actionLabel="Fazer Leitura Gratuita"
            actionHref="/tarot/dia"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-md border-primary/20">
      <CardHeader>
        <CardTitle className="gold-text flex items-center gap-2">
          <Clock className="w-5 h-5" /> Histórico de Leituras
          <span className="text-sm font-normal text-foreground/50 ml-auto">
            {readings.length} {readings.length === 1 ? "leitura" : "leituras"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {readings.map((reading) => (
          <ReadingCard key={reading.id} reading={reading} />
        ))}
      </CardContent>
    </Card>
  );
}
