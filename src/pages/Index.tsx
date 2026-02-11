import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles, Star, Moon, Sun, Calculator, Heart,
  ArrowRight, Compass, Eye, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";

const services = [
  {
    id: "tarot-dia", title: "Tarot do Dia",
    description: "Descubra a mensagem que o universo tem para você hoje com uma carta especial.",
    icon: Star, color: "from-purple-500/20 to-violet-500/20",
    borderColor: "border-purple-500/30", iconColor: "text-purple-400",
    href: "/tarot/dia", badge: "Grátis"
  },
  {
    id: "tarot-amor", title: "Tarot e o Amor",
    description: "Explore as energias que cercam sua vida amorosa com uma tiragem de 3 cartas.",
    icon: Heart, color: "from-pink-500/20 to-rose-500/20",
    borderColor: "border-pink-500/30", iconColor: "text-pink-400",
    href: "/tarot/amor", badge: "Grátis"
  },
  {
    id: "tarot-completo", title: "Tarot Completo",
    description: "Uma leitura profunda com 6 cartas sobre sua jornada de vida e destino.",
    icon: Eye, color: "from-purple-500/20 to-violet-500/20",
    borderColor: "border-purple-500/30", iconColor: "text-purple-400",
    href: "/tarot/completo", badge: "Premium"
  },
  {
    id: "numerologia", title: "Mapa Numerológico",
    description: "Calcule seus números pessoais e descubra seu propósito, talentos e desafios.",
    icon: Calculator, color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30", iconColor: "text-emerald-400",
    href: "/numerologia", badge: "Grátis"
  },
  {
    id: "horoscopo", title: "Horóscopo do Dia",
    description: "Previsões diárias personalizadas para amor, trabalho e vida em geral.",
    icon: Sun, color: "from-orange-500/20 to-amber-500/20",
    borderColor: "border-orange-500/30", iconColor: "text-orange-400",
    href: "/horoscopo", badge: "Grátis"
  },
  {
    id: "mapa-astral", title: "Mapa Astral",
    description: "Descubra seu ascendente, lua e posições planetárias no momento do seu nascimento.",
    icon: Compass, color: "from-blue-500/20 to-indigo-500/20",
    borderColor: "border-blue-500/30", iconColor: "text-blue-400",
    href: "/mapa-astral", badge: "Em breve"
  }
];

const features = [
  { icon: Sparkles, title: "Interpretações Profundas", description: "Cada leitura é baseada em conhecimentos ancestrais e interpretações cuidadosamente elaboradas." },
  { icon: Zap, title: "Resultados Instantâneos", description: "Receba suas previsões e análises imediatamente, sem espera ou complicações." },
  { icon: Moon, title: "Atualizações Diárias", description: "Horóscopo e mensagens renovadas todos os dias para guiar sua jornada." }
];

function AnimatedStars() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5, ease: "easeInOut" }}
        >
          <span className="text-primary/60 text-xs">✦</span>
        </motion.div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Global mystical background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background via-purple-950/30 to-background" />
      <AnimatedStars />
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden z-10 min-h-[70vh] flex items-center">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/50 via-purple-950/40 to-background/60" />

        {/* Animated glow effects */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[80px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />

        <div className="container mx-auto relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/40 mb-6 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">Descubra seu destino</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-foreground"
            >
              Desvende os{" "}
              <span className="gold-text" style={{ filter: "drop-shadow(0 0 30px hsl(45 70% 55% / 0.5))" }}>Mistérios</span>
              <br />do Universo
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Tarot, Numerologia e Astrologia em um só lugar.
              Receba orientações personalizadas para guiar sua jornada
              e descobrir seu verdadeiro potencial.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/tarot/dia">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/50 text-lg px-8 py-6 mystical-glow">
                  <Star className="w-5 h-5 mr-2" />
                  Tirar Carta do Dia
                </Button>
              </Link>
              <Link to="/horoscopo">
                <Button size="lg" variant="outline" className="border-foreground/30 text-foreground hover:bg-foreground/10 backdrop-blur-sm text-lg px-8 py-6">
                  <Sun className="w-5 h-5 mr-2" />
                  Ver Horóscopo
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-foreground/30 flex items-start justify-center p-2">
            <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="py-12 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-purple-950/50 to-background/70" />
        <div className="container mx-auto relative z-10 px-4">
          <div className="text-center mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-primary text-sm font-medium tracking-wider uppercase">Explore nossos serviços</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 mt-2 text-foreground">Nossos Oráculos</h2>
              <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
                Escolha entre diferentes métodos de autoconhecimento e orientação espiritual
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isComingSoon = service.badge === "Em breve";

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {isComingSoon ? (
                    <Card className={`h-full bg-background/40 backdrop-blur-md border ${service.borderColor} opacity-60 cursor-not-allowed`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-foreground/10 flex items-center justify-center">
                            <Icon className={`w-6 h-6 ${service.iconColor}`} />
                          </div>
                          <span className="px-2 py-1 text-xs rounded-full bg-foreground/10 text-foreground/60">{service.badge}</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-foreground">{service.title}</h3>
                        <p className="text-foreground/60 text-sm">{service.description}</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Link to={service.href}>
                      <Card className={`h-full bg-gradient-to-br ${service.color} backdrop-blur-md border ${service.badge === "Premium" ? "border-primary/50 shadow-[0_0_20px_hsl(45_70%_55%/0.15)]" : service.borderColor} hover:border-primary/50 transition-all cursor-pointer group hover:shadow-[0_0_30px_hsl(45_70%_55%/0.2)]`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-foreground/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Icon className={`w-6 h-6 ${service.iconColor}`} />
                            </div>
                            <span className={service.badge === "Premium"
                              ? "px-3 py-1 text-xs rounded-full bg-primary/30 text-primary border border-primary/30 flex items-center gap-1 font-semibold"
                              : "px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium"
                            }>
                              {service.badge === "Premium" && <Sparkles className="w-3 h-3" />}
                              {service.badge}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold mb-2 text-foreground">{service.title}</h3>
                          <p className="text-foreground/70 text-sm mb-4">{service.description}</p>
                          <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                            <span>Acessar</span>
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative z-10 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-background/70" />
        <div className="container mx-auto relative z-10 px-4">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-primary text-sm font-medium tracking-wider uppercase">Por que nos escolher</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 mt-2 text-foreground">Por que escolher o Oráculo Místico?</h2>
              <p className="text-foreground/70 max-w-2xl mx-auto text-lg">Uma experiência completa de autoconhecimento ao seu alcance</p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center bg-background/40 backdrop-blur-md rounded-2xl p-8 border border-primary/20 hover:border-primary/40 transition-all"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-purple-950/50 to-background/70" />
        <div className="container mx-auto relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-primary/30 p-8 md:p-16 bg-gradient-to-br from-purple-950/80 to-background/90"
          >
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

            {/* Decorative stars */}
            <motion.div className="absolute top-4 left-4 text-primary text-2xl" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>✦</motion.div>
            <motion.div className="absolute top-8 right-12 text-primary/60 text-xl" animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}>✧</motion.div>
            <motion.div className="absolute bottom-8 left-16 text-primary/40 text-3xl" animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}>✦</motion.div>
            <motion.div className="absolute bottom-4 right-8 text-primary text-xl" animate={{ rotate: -360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}>✧</motion.div>

            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Comece sua jornada de{" "}
                <span className="gold-text" style={{ filter: "drop-shadow(0 0 20px hsl(45 70% 55% / 0.5))" }}>autoconhecimento</span>
              </h2>
              <p className="text-foreground/80 mb-10 text-lg leading-relaxed">
                Tire sua primeira carta gratuitamente e descubra o que o universo tem a dizer sobre seu caminho.
              </p>
              <Link to="/tarot/dia">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/50 text-lg px-10 py-6 pulse-glow">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Começar Agora - É Grátis
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-primary/20 relative z-10">
        <div className="absolute inset-0 bg-background/60" />
        <div className="container mx-auto relative z-10 px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/30 flex items-center justify-center border border-primary/30">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="font-serif text-lg font-bold gold-text">Oráculo Místico</span>
            </div>

            <nav className="flex items-center gap-6">
              <Link to="/tarot/dia" className="text-sm text-foreground/70 hover:text-primary transition-colors">Tarot</Link>
              <Link to="/numerologia" className="text-sm text-foreground/70 hover:text-primary transition-colors">Numerologia</Link>
              <Link to="/horoscopo" className="text-sm text-foreground/70 hover:text-primary transition-colors">Horóscopo</Link>
            </nav>

            <p className="text-sm text-foreground/50">© 2026 Oráculo Místico. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
