import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles, Star, Moon, Sun, Calculator, Heart,
  ArrowRight, Compass, Eye, Zap, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { usePageSEO } from "@/hooks/usePageSEO";
import heroBg from "@/assets/hero-bg.jpg";
import featuresBg from "@/assets/features-bg.jpg";

const services = [
  {
    id: "tarot-dia", title: "Tarot do Dia",
    description: "A mensagem que o universo reservou para o seu dia.",
    icon: Star, href: "/tarot/dia", badge: "Grátis",
  },
  {
    id: "tarot-amor", title: "Tarot do Amor",
    description: "Explore as energias que cercam sua vida afetiva.",
    icon: Heart, href: "/tarot/amor", badge: "Grátis",
  },
  {
    id: "tarot-completo", title: "Tarot Completo",
    description: "Uma leitura profunda sobre sua jornada de vida.",
    icon: Eye, href: "/tarot/completo", badge: "Premium",
  },
  {
    id: "numerologia", title: "Numerologia",
    description: "Seus números pessoais revelam propósito e talentos.",
    icon: Calculator, href: "/numerologia", badge: "Grátis",
  },
  {
    id: "horoscopo", title: "Horóscopo",
    description: "Previsões diárias para amor, trabalho e saúde.",
    icon: Sun, href: "/horoscopo", badge: "Grátis",
  },
  {
    id: "mapa-astral", title: "Mapa Astral",
    description: "Descubra seu ascendente e posições planetárias.",
    icon: Compass, href: "/mapa-astral", badge: "Grátis",
  },
  {
    id: "consultas", title: "Consultas ao Vivo",
    description: "Sessões personalizadas com taromantes experientes.",
    icon: Users, href: "/consultas", badge: "Novo",
  },
];

const features = [
  { icon: Sparkles, title: "Interpretações Profundas", description: "Cada leitura é cuidadosamente elaborada com base em conhecimentos ancestrais." },
  { icon: Zap, title: "Resultados Instantâneos", description: "Receba suas previsões e análises sem espera, de forma simples e direta." },
  { icon: Moon, title: "Atualizações Diárias", description: "Horóscopo e mensagens renovadas todos os dias para guiar sua jornada." },
];

export default function Home() {
  usePageSEO({
    title: "Tarot Online Grátis, Numerologia e Horóscopo",
    description: "Tarot online grátis com IA, Mapa Numerológico, Horóscopo do Dia e Mapa Astral. Descubra seu destino no Chave do Oráculo.",
    path: "/",
  });

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
      </div>
      <Header />

      {/* Hero — Compact */}
      <section className="relative pt-24 pb-10 z-10">
        <div className="container mx-auto relative z-10 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-[1.15] text-foreground tracking-tight">
                Desvende os{" "}
                <span className="text-primary">Mistérios</span>
                <br />do Universo
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                Tarot, Numerologia e Astrologia reunidos para guiar sua jornada de autoconhecimento.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/tarot/dia">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-7 py-5 pulse-glow">
                    <Star className="w-4 h-4 mr-2" />
                    Tirar Carta do Dia
                  </Button>
                </Link>
                <Link to="/consultas">
                  <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary text-base px-7 py-5">
                    <Users className="w-4 h-4 mr-2" />
                    Agendar Consulta
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid — Above the fold */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto relative z-10 px-4">
          <div className="text-center mb-8">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-primary/70 text-xs font-semibold tracking-[0.2em] uppercase">Nossos Métodos</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 text-foreground">Escolha seu caminho</h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={service.href}>
                    <Card className="h-full glass-card group cursor-pointer">
                      <CardContent className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-300">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <span className={
                            service.badge === "Premium"
                              ? "px-2 py-0.5 text-[10px] rounded-full bg-accent/15 text-accent border border-accent/25 font-semibold uppercase tracking-wider"
                              : service.badge === "Novo"
                              ? "px-2 py-0.5 text-[10px] rounded-full bg-primary/15 text-primary border border-primary/25 font-semibold uppercase tracking-wider"
                              : "px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium uppercase tracking-wider"
                          }>
                            {service.badge}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm md:text-base text-foreground mb-1">{service.title}</h3>
                        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-2">{service.description}</p>
                        <div className="flex items-center text-primary text-xs font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span>Explorar</span>
                          <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 relative z-10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={featuresBg} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-background/80" />
        </div>
        <div className="container mx-auto relative z-10 px-4">
          <div className="text-center mb-12">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-primary/70 text-xs font-semibold tracking-[0.2em] uppercase">Por que escolher</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 text-foreground">O Oráculo Místico</h2>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center glass-card rounded-2xl p-7"
                >
                  <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl gradient-border p-8 md:p-14 bg-secondary/60 backdrop-blur-md"
          >
            <div className="relative text-center max-w-xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-foreground leading-tight break-words">
                Comece sua jornada de{" "}
                <span className="text-primary">autoconhecimento</span>
              </h2>
              <p className="text-muted-foreground mb-8 text-base leading-relaxed">
                Tire sua primeira carta gratuitamente e descubra o que o universo tem a dizer sobre seu caminho.
              </p>
              <Link to="/tarot/dia">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 py-5 pulse-glow">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Começar Agora — É Grátis
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 relative z-10">
        <div className="section-divider" />
        <div className="container mx-auto relative z-10 px-4 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="font-serif text-lg font-bold text-foreground">Oráculo Místico</span>
            </div>
            <nav className="flex items-center gap-5">
              <Link to="/tarot/dia" className="text-sm text-muted-foreground hover:text-primary transition-colors">Tarot</Link>
              <Link to="/numerologia" className="text-sm text-muted-foreground hover:text-primary transition-colors">Numerologia</Link>
              <Link to="/horoscopo" className="text-sm text-muted-foreground hover:text-primary transition-colors">Horóscopo</Link>
              <Link to="/consultas" className="text-sm text-muted-foreground hover:text-primary transition-colors">Consultas</Link>
            </nav>
            <p className="text-sm text-muted-foreground/60">© 2026 Oráculo Místico</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
