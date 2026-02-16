import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import DateInputBR from "@/components/DateInputBR";

interface UserDataFormProps {
  title: string;
  description: string;
  onSubmit: (data: { userName: string; birthDate: string }) => void;
  loading?: boolean;
}

export default function UserDataForm({ title, description, onSubmit, loading }: UserDataFormProps) {
  const [userName, setUserName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ userName, birthDate });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-card/80 backdrop-blur-md border-white/12">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <div>
              <CardTitle className="text-xl text-foreground">{title}</CardTitle>
              <CardDescription className="text-foreground/60">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-secondary/40 rounded-xl p-5 border border-primary/10 space-y-4">
              <h3 className="font-serif text-lg gold-text">Vamos personalizar sua leitura</h3>
              <div className="space-y-2">
                <Label className="text-foreground/80 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Como você se chama?
                </Label>
                <Input
                  placeholder="Seu primeiro nome ou nome completo"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Quando você nasceu?
                </Label>
                <DateInputBR
                  value={birthDate}
                  onChange={setBirthDate}
                  required
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading || !userName || !birthDate}
              className="w-full bg-white text-slate-900 hover:bg-white/90 border border-white/20 text-lg py-6 font-semibold shadow-lg shadow-white/10"
            >
              {loading ? "As cartas estão se revelando..." : "Revelar minhas cartas"}
            </Button>
            <p className="text-center text-xs text-foreground/40">Seu nome e data de nascimento são a chave para uma leitura feita especialmente para você.</p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
