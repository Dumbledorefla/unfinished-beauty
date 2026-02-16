import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DateInputBR from "@/components/DateInputBR";
import Header from "@/components/Header";
import FreemiumPaywall from "@/components/FreemiumPaywall";
import { supabase } from "@/integrations/supabase/client";
import { useOracleAuth } from "@/hooks/useOracleAuth";
import { useFreemium } from "@/hooks/useFreemium";
import { toast } from "@/hooks/use-toast";
import heroBg from "@/assets/hero-bg.jpg";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import RelatedContent, { getRelatedItems } from "@/components/RelatedContent";
import { useStreak } from "@/hooks/useStreak";

export default function MapaAstral() {
  usePageSEO({ title: "Mapa Astral Completo e Grátis — Ascendente, Lua e Posições Planetárias", description: "Descubra quem você é além do signo solar. Mapa Astral completo com ascendente, lua e todas as posições planetárias do momento do seu nascimento.", path: "/mapa-astral" });
  useStructuredData([
    { type: "breadcrumb", items: [{ name: "Início", url: window.location.origin }, { name: "Mapa Astral", url: `${window.location.origin}/mapa-astral` }] },
    { type: "faq", questions: [
      { question: "O que é o Mapa Astral?", answer: "O Mapa Astral é uma fotografia do céu no momento exato do seu nascimento. Ele revela seu ascendente, posição da lua e de todos os planetas, revelando aspectos profundos da sua personalidade." },
      { question: "Preciso saber minha hora de nascimento?", answer: "Sim, a hora de nascimento é essencial para calcular seu ascendente com precisão. Se não souber, consulte sua certidão de nascimento." },
    ]},
  ]);
  const { restoredState, requireAuth, clearRestored, isAuthenticated } = useOracleAuth({ methodId: "mapa-astral", returnTo: "/mapa-astral" });
  const { product, hasAccess, purchaseReading } = useFreemium("mapa-astral");
  const { recordActivity } = useStreak();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [loading, setLoading] = useState(false);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (restoredState) {
      const { userData } = restoredState;
      clearRestored();
      setName(userData.name);
      setBirthDate(userData.birthDate);
      setBirthTime(userData.birthTime || "");
      setBirthPlace(userData.birthPlace || "");
      runGeneration(userData.name, userData.birthDate, userData.birthTime || "", userData.birthPlace || "");
    }
  }, [restoredState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate || !birthTime || !birthPlace) {
      toast({ title: "Preencha seus dados para continuar", variant: "destructive" });
      return;
    }
    if (!requireAuth({ name, birthDate, birthTime, birthPlace })) return;
    runGeneration(name, birthDate, birthTime, birthPlace);
  };

  const runGeneration = async (n: string, bd: string, bt: string, bp: string) => {
    setLoading(true);
    setInterpretation(null);
    setError(false);
    try {
      const res = await supabase.functions.invoke("oracle-interpret", {
        body: { type: "mapa-astral", data: { userName: n, birthDate: bd, birthTime: bt, birthPlace: bp } },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      setInterpretation(res.data.interpretation);
      recordActivity();
    } catch (err: any) {
      setError(true);
      toast({ title: "Não conseguimos ler as estrelas agora. Tente novamente.", description: err.message, variant: "destructive" });
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
        <PageBreadcrumb items={[{ label: "Mapa Astral" }]} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/25 mb-4">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400">Astrologia</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Seu Mapa Astral</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Quem é você além do signo solar? Descubra seu ascendente, sua lua e o que os planetas diziam quando você nasceu.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card/80 backdrop-blur-md border-white/12 mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-foreground/80">Nome completo</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" className="bg-background/50 border-white/15" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birthDate" className="text-foreground/80">Data de nascimento</Label>
                    <DateInputBR id="birthDate" value={birthDate} onChange={setBirthDate} className="bg-background/50 border-white/15" />
                  </div>
                  <div>
                    <Label htmlFor="birthTime" className="text-foreground/80">Hora de nascimento</Label>
                    <Input id="birthTime" type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="bg-background/50 border-white/15" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="birthPlace" className="text-foreground/80">Local de nascimento</Label>
                  <Input id="birthPlace" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} placeholder="Cidade, Estado, País" className="bg-background/50 border-white/15" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-white text-slate-900 hover:bg-white/90 font-semibold shadow-lg" size="lg">
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Calculando seu mapa...</>
                  ) : (
                    <><Sparkles className="w-5 h-5 mr-2" />Gerar Mapa Astral</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {error && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8 space-y-4">
            <p className="text-foreground/70 text-lg">Não foi possível gerar sua interpretação agora.</p>
            <Button onClick={() => runGeneration(name, birthDate, birthTime, birthPlace)} variant="outline" className="border-primary/30">Tentar novamente</Button>
          </motion.div>
        )}

        {interpretation && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-md border-white/12">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Compass className="w-5 h-5 text-amber-400" />
                  <h2 className="font-serif text-2xl font-bold text-foreground">O céu no momento do seu nascimento</h2>
                </div>
                <FreemiumPaywall
                  interpretation={interpretation}
                  oracleType="mapa-astral"
                  productName={product?.name || "Mapa Astral"}
                  price={product?.price || 12.90}
                  previewLines={product?.preview_lines || 2}
                  hasAccess={hasAccess}
                  onPurchase={() => purchaseReading()}
                />
                {hasAccess && (
                  <>
                    <div className="mt-6">
                      <ShareButtons text={interpretation} title="Mapa Astral" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            {/* Upsell → Consulta ao Vivo */}
            {hasAccess && (
              <Card className="glass-card border-amber-500/20">
                <CardContent className="py-6 text-center space-y-3">
                  <h3 className="font-serif text-lg font-bold text-foreground">Quer conversar sobre seu mapa?</h3>
                  <p className="text-muted-foreground text-sm">Nossos astrólogos podem aprofundar a interpretação e responder suas dúvidas em tempo real.</p>
                  <Link to="/consultas">
                    <Button className="bg-amber-500 text-slate-900 hover:bg-amber-400 font-semibold">Falar com um astrólogo agora</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        <RelatedContent items={getRelatedItems("/mapa-astral")} />
      </main>
    </div>
  );
}
