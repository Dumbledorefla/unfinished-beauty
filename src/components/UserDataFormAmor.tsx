import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Calendar, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import DateInputBR from "@/components/DateInputBR";

interface UserDataFormAmorProps {
  onSubmit: (data: { userName: string; birthDate: string; question: string }) => void;
  loading?: boolean;
}

const suggestions = [
  "O que as cartas dizem sobre meu relacionamento atual?",
  "Vou encontrar o amor em breve?",
  "Devo dar uma nova chance a essa pessoa?",
  "O que preciso curar para atrair o amor?",
];

export default function UserDataFormAmor({ onSubmit, loading }: UserDataFormAmorProps) {
  const [userName, setUserName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ userName, birthDate, question });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-card/80 backdrop-blur-md border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-pink-400" />
            <div>
              <CardTitle className="text-xl text-foreground">Tarot do Amor</CardTitle>
              <CardDescription className="text-foreground/60">
                Descubra o que as cartas revelam sobre o seu coração — passado, presente e futuro.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-secondary/40 rounded-xl p-5 border border-primary/10 space-y-4">
              <h3 className="font-serif text-lg text-amber-400">Vamos personalizar sua leitura</h3>

              <div className="space-y-2">
                <Label className="text-foreground/80 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Seu nome completo
                </Label>
                <Input
                  placeholder="Nome e sobrenome"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground/80 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Data de nascimento
                </Label>
                <DateInputBR
                  value={birthDate}
                  onChange={setBirthDate}
                  required
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground/80 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> O que você quer saber sobre o amor?
                </Label>
                <Textarea
                  placeholder="Escreva sua pergunta ou escolha uma sugestão abaixo..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  rows={3}
                  className="bg-input/50 border-border/50 focus:border-primary resize-none"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setQuestion(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        question === s
                          ? "bg-pink-500/15 border-pink-500/30 text-pink-300"
                          : "bg-secondary/60 border-border/50 text-muted-foreground hover:border-pink-500/20 hover:text-pink-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !userName || !birthDate || !question}
              className="w-full bg-pink-500 text-white hover:bg-pink-400 border border-pink-500/50 text-lg py-6 shadow-lg shadow-pink-500/20"
            >
              {loading ? "Embaralhando as cartas..." : "Consultar as cartas do amor"}
            </Button>
            <p className="text-center text-xs text-foreground/40">
              Suas informações personalizam a leitura e não são compartilhadas.
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
