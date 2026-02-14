import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, Sparkles, Loader2 } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import heroBg from "@/assets/hero-bg.jpg";

export default function MapaAstral() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [loading, setLoading] = useState(false);
  const [interpretation, setInterpretation] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (!name || !birthDate || !birthTime || !birthPlace) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setLoading(true);
    setInterpretation(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("oracle-interpret", {
        body: {
          type: "mapa-astral",
          data: { userName: name, birthDate, birthTime, birthPlace },
        },
      });

      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      
      setInterpretation(res.data.interpretation);
    } catch (err: any) {
      toast({ title: "Erro ao gerar mapa astral", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/40 mb-4">
            <Compass className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Astrologia</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Mapa Astral</h1>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Descubra seu ascendente, lua e posições planetárias com base na sua data, hora e local de nascimento
          </p>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card/80 backdrop-blur-md border-primary/20 mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-foreground/80">Nome completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="bg-background/50 border-primary/20"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birthDate" className="text-foreground/80">Data de nascimento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="bg-background/50 border-primary/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthTime" className="text-foreground/80">Hora de nascimento</Label>
                    <Input
                      id="birthTime"
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="bg-background/50 border-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="birthPlace" className="text-foreground/80">Local de nascimento</Label>
                  <Input
                    id="birthPlace"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="Cidade, Estado, País"
                    className="bg-background/50 border-primary/20"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mystical-glow"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Calculando seu mapa...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Gerar Mapa Astral
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interpretation Result */}
        {interpretation && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card/80 backdrop-blur-md border-primary/20">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Compass className="w-5 h-5 text-primary" />
                  <h2 className="font-serif text-2xl font-bold text-foreground">Seu Mapa Astral</h2>
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-foreground/80 leading-relaxed [&_h1]:text-primary [&_h2]:text-primary/90 [&_h3]:text-primary/80 [&_strong]:text-foreground [&_ul]:list-disc [&_ol]:list-decimal">
                  <ReactMarkdown>{interpretation}</ReactMarkdown>
                </div>
                <div className="mt-6">
                  <ShareButtons text={interpretation} title="Mapa Astral" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
