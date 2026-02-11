import { useState } from "react";
import { motion } from "framer-motion";
import { User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
      <Card className="bg-card/80 backdrop-blur-md border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="text-xl text-foreground">{title}</CardTitle>
              <CardDescription className="text-foreground/60">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-secondary/40 rounded-xl p-5 border border-primary/10 space-y-4">
              <h3 className="font-serif text-lg gold-text">Suas Informações</h3>
              <div className="space-y-2">
                <Label className="text-foreground/80 flex items-center gap-2">
                  <User className="w-4 h-4" /> Nome Completo *
                </Label>
                <Input
                  placeholder="Digite seu nome completo"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Data de Nascimento *
                </Label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading || !userName || !birthDate}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/50 text-lg py-6 mystical-glow"
            >
              {loading ? "Consultando os astros..." : "Continuar para a Leitura"}
            </Button>
            <p className="text-center text-xs text-foreground/40">* Campos obrigatórios</p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
