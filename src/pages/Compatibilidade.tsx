import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DateInputBR from "@/components/DateInputBR";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import RelatedContent, { getRelatedItems } from "@/components/RelatedContent";
import heroBg from "@/assets/hero-bg.jpg";

export default function Compatibilidade() {
  usePageSEO({
    title: "Compatibilidade Amorosa — Descubra a Sintonia Entre Vocês",
    description: "Compare dois signos ou datas de nascimento e descubra a compatibilidade amorosa entre vocês. Análise gratuita e personalizada.",
    path: "/compatibilidade",
  });
  useStructuredData([
    { type: "breadcrumb", items: [{ name: "Início", url: window.location.origin }, { name: "Compatibilidade", url: `${window.location.origin}/compatibilidade` }] },
    { type: "faq", questions: [
      { question: "Como funciona a análise de compatibilidade?", answer: "Nossa análise considera os signos solares, elementos e energias de cada pessoa para revelar a compatibilidade emocional, intelectual e física entre vocês." },
      { question: "A compatibilidade amorosa é gratuita?", answer: "Sim! A análise de compatibilidade é 100% gratuita. Basta informar os nomes e datas de nascimento das duas pessoas." },
    ]},
  ]);

  const [name1, setName1] = useState("");
  const [birth1, setBirth1] = useState("");
  const [name2, setName2] = useState("");
  const [birth2, setBirth2] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [step, setStep] = useState<"form" | "loading" | "result">("form");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("loading");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("oracle-interpret", {
        body: {
          type: "compatibilidade",
          userName: `${name1} e ${name2}`,
          birthDate: birth1,
          extraData: { name1, birth1, name2, birth2 },
          prompt: `Analise a compatibilidade amorosa entre ${name1} (nascido em ${birth1}) e ${name2} (nascido em ${birth2}). 
          
          Inclua:
          1. Signo solar de cada um e como se relacionam
          2. Pontos fortes da relação
          3. Desafios e como superá-los
          4. Compatibilidade emocional, intelectual e física (nota de 1 a 10 para cada)
          5. Conselho final para o casal
          
          Use linguagem acolhedora e esperançosa. Formato Markdown.`,
        },
      });

      if (error) throw error;
      setResult(data?.interpretation || "Não foi possível gerar a análise.");
      setStep("result");
    } catch {
      setResult("Ops, algo deu errado. Tente novamente.");
      setStep("result");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <PageBreadcrumb items={[{ label: "Compatibilidade" }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-pink-500/15 border border-pink-500/25 flex items-center justify-center">
              <Heart className="w-7 h-7 text-pink-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Compatibilidade Amorosa</h1>
            <p className="text-muted-foreground">
              Descubra a sintonia entre vocês dois. A análise considera os signos, elementos e energias de cada um.
            </p>
          </motion.div>

          {step === "form" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-secondary/40 rounded-xl p-5 border border-pink-500/10 space-y-4">
                      <h3 className="font-serif text-lg text-pink-400">Você</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground/80">Seu nome</Label>
                          <Input value={name1} onChange={(e) => setName1(e.target.value)} required placeholder="Seu primeiro nome" className="bg-input/50 border-border/50" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground/80">Sua data de nascimento</Label>
                          <DateInputBR value={birth1} onChange={setBirth1} required className="bg-input/50 border-border/50" />
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Heart className="w-8 h-8 text-pink-400 mx-auto animate-pulse" />
                    </div>

                    <div className="bg-secondary/40 rounded-xl p-5 border border-pink-500/10 space-y-4">
                      <h3 className="font-serif text-lg text-pink-400">A outra pessoa</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground/80">Nome da pessoa</Label>
                          <Input value={name2} onChange={(e) => setName2(e.target.value)} required placeholder="Nome da pessoa" className="bg-input/50 border-border/50" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground/80">Data de nascimento</Label>
                          <DateInputBR value={birth2} onChange={setBirth2} required className="bg-input/50 border-border/50" />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-pink-500 text-white hover:bg-pink-600 text-lg py-6">
                      <Heart className="w-5 h-5 mr-2" /> Descobrir nossa compatibilidade
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "form" && (
            <div className="mt-8 space-y-4">
              <Card className="bg-card/60 backdrop-blur-md border-pink-500/10 p-5">
                <h3 className="font-semibold text-foreground mb-2 text-sm">💕 Como funciona a análise?</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Nossa análise considera os signos solares de cada pessoa, seus elementos (Fogo, Terra, Ar, Água) e as energias astrológicas para revelar a compatibilidade emocional, intelectual e física entre vocês.
                </p>
              </Card>
              <Card className="bg-card/60 backdrop-blur-md border-pink-500/10 p-5">
                <h3 className="font-semibold text-foreground mb-2 text-sm">✨ O que você vai descobrir</h3>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5">
                  <li>• Signo solar de cada um e como se relacionam</li>
                  <li>• Pontos fortes e desafios da relação</li>
                  <li>• Notas de compatibilidade (emocional, intelectual, física)</li>
                  <li>• Conselho personalizado para o casal</li>
                </ul>
              </Card>
            </div>
          )}

          {step === "loading" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <Loader2 className="w-12 h-12 text-pink-400 mx-auto animate-spin mb-4" />
              <p className="text-muted-foreground font-serif text-lg">Analisando a sintonia entre vocês...</p>
            </motion.div>
          )}

          {step === "result" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardContent className="p-6">
                  <h2 className="font-serif text-2xl font-bold text-pink-400 mb-6 text-center">💕 {name1} & {name2}</h2>
                  <div className="oracle-prose">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                  <div className="mt-6">
                    <ShareButtons text={result} title={`Compatibilidade: ${name1} & ${name2}`} />
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => { setStep("form"); setResult(""); }} className="border-pink-500/30 text-foreground">
                      Testar outro casal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          <RelatedContent items={getRelatedItems("/compatibilidade")} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
