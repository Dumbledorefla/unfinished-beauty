import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Briefcase, Activity, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { signos } from "@/data/signos";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import heroBg from "@/assets/hero-bg.jpg";

export default function Signo() {
  const { slug } = useParams<{ slug: string }>();
  const signo = signos.find((s) => s.slug === slug);

  usePageSEO({
    title: signo ? `${signo.name} — Personalidade, Amor, Carreira e Compatibilidade` : "Signo",
    description: signo ? `Tudo sobre ${signo.name}: personalidade, amor, carreira, saúde e compatibilidade. ${signo.description.slice(0, 120)}` : "",
    path: `/signo/${slug}`,
  });

  useStructuredData(signo ? [
    {
      type: "breadcrumb",
      items: [
        { name: "Início", url: window.location.origin },
        { name: "Signos", url: `${window.location.origin}/signos` },
        { name: signo.name, url: `${window.location.origin}/signo/${signo.slug}` },
      ],
    },
  ] : []);

  if (!signo) {
    return (
      <div className="min-h-screen relative">
        <Header />
        <div className="pt-24 pb-16 container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Signo não encontrado</h2>
          <Link to="/signos"><Button variant="outline">Ver todos os signos</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/signos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Todos os signos
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <p className="text-6xl mb-4">{signo.emoji}</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{signo.name}</h1>
            <p className="text-muted-foreground">{signo.dateRange} • {signo.element} {signo.elementEmoji} • Regente: {signo.ruler}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card/80 backdrop-blur-md border-primary/20 mb-6">
              <CardContent className="p-6">
                <p className="text-foreground/90 leading-relaxed">{signo.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {signo.traits.map((trait) => (
                    <span key={trait} className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">
                      {trait}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-card/80 border-pink-500/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-pink-400" />
                  <h3 className="font-serif text-lg font-bold text-foreground">Amor</h3>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{signo.love}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-blue-500/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                  <h3 className="font-serif text-lg font-bold text-foreground">Carreira</h3>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{signo.career}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-emerald-500/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-serif text-lg font-bold text-foreground">Saúde</h3>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{signo.health}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-amber-500/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-amber-400" />
                  <h3 className="font-serif text-lg font-bold text-foreground">Compatibilidade</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {signo.compatibility.map((comp) => {
                    const compSigno = signos.find((s) => s.name === comp);
                    return (
                      <Link key={comp} to={`/signo/${compSigno?.slug || ""}`} className="px-3 py-1.5 text-sm rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                        {compSigno?.emoji} {comp}
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <Link to="/horoscopo">
              <Button variant="outline" className="w-full border-primary/30 py-5">
                Ver horóscopo de {signo.name} hoje
              </Button>
            </Link>
            <Link to="/compatibilidade">
              <Button className="w-full bg-primary text-primary-foreground py-5">
                Testar compatibilidade de {signo.name}
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
