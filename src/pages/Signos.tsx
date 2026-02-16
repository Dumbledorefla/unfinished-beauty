import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { signos } from "@/data/signos";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import heroBg from "@/assets/hero-bg.jpg";

export default function Signos() {
  usePageSEO({
    title: "Signos do Zodíaco — Personalidade, Amor e Compatibilidade de Cada Signo",
    description: "Conheça todos os 12 signos do zodíaco: personalidade, amor, carreira, saúde e compatibilidade. Descubra tudo sobre o seu signo.",
    path: "/signos",
  });

  useStructuredData([
    {
      type: "breadcrumb",
      items: [
        { name: "Início", url: window.location.origin },
        { name: "Signos", url: `${window.location.origin}/signos` },
      ],
    },
  ]);

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <PageBreadcrumb items={[{ label: "Signos" }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Signos do Zodíaco</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conheça cada signo em profundidade: personalidade, amor, carreira, saúde e com quem você mais combina.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {signos.map((signo, index) => (
              <motion.div
                key={signo.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/signo/${signo.slug}`}>
                  <Card className="bg-card/80 backdrop-blur-md border-primary/10 group hover:border-primary/30 transition-all">
                    <CardContent className="p-5 text-center">
                      <p className="text-4xl mb-3">{signo.emoji}</p>
                      <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {signo.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{signo.dateRange}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {signo.elementEmoji} {signo.element}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
