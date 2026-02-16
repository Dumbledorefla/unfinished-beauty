import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles, Star, Moon, Sun, Calculator, Heart,
  ArrowRight, Compass, Eye, Zap, Users
} from "lucide-react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import SocialProof from "@/components/SocialProof";
import Testimonials from "@/components/Testimonials";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import { useTrackReferral } from "@/hooks/useAffiliate";
import heroBg from "@/assets/hero-bg.jpg";
import featuresBg from "@/assets/features-bg.jpg";
import OnboardingModal from "@/components/OnboardingModal";

const services = [
  {
    id: "tarot-dia", title: "Tarot do Dia",
    description: "Uma carta, uma mensagem, um novo olhar para o seu dia. Grátis, todos os dias.",
    icon: Star, href: "/tarot/dia", badge: "Grátis",
  },
  {
    id: "tarot-amor", title: "Tarot do Amor",
    description: "Passado, presente e futuro do seu amor revelados em 3 cartas.",
    icon: Heart, href: "/tarot/amor", badge: "Grátis",
  },
  {
    id: "tarot-completo", title: "Tarot Completo",
    description: "6 cartas, uma história completa. Para quando você precisa de respostas profundas.",
    icon: Eye, href: "/tarot/completo", badge: "Premium",
  },
  {
    id: "numerologia", title: "Numerologia",
    description: "Seu nome e sua data de nascimento guardam segredos. Descubra seus números de destino.",
    icon: Calculator, href: "/numerologia", badge: "Grátis",
  },
  {
    id: "horoscopo", title: "Horóscopo do Dia",
    description: "O que os astros dizem sobre o seu dia? Previsões feitas sob medida para você.",
    icon: Sun, href: "/horoscopo", badge: "Grátis",
  },
  {
    id: "mapa-astral", title: "Mapa Astral",
    description: "Quem é você além do signo solar? Descubra seu ascendente, lua e muito mais.",
    icon: Compass, href: "/mapa-astral", badge: "Grátis",
  },
  {
    id: "compatibilidade", title: "Compatibilidade",
    description: "Descubra a sintonia entre vocês dois. Compare signos e descubra se combinam.",
    icon: Heart, href: "/compatibilidade", badge: "Novo",
  },
  {
    id: "consultas", title: "Consultas ao Vivo",
    description: "Converse com tarólogos de verdade. Por chat, vídeo ou telefone — no seu tempo.",
    icon: Users, href: "/consultas", badge: "Novo",
  },
];

const features = [
  { icon: Sparkles, title: "Sabedoria ancestral com IA", description: "Nossas leituras combinam séculos de tradição do Tarot com inteligência artificial para interpretações únicas e feitas só para você." },
  { icon: Zap, title: "Suas respostas em segundos", description: "Sem fila, sem espera. Tire suas cartas agora e receba sua leitura na hora — a qualquer momento do dia ou da noite." },
  { icon: Moon, title: "Um novo olhar a cada manhã", description: "Horóscopo e Tarot do Dia renovados diariamente para você começar cada dia com mais clareza e propósito." },
];

const lifeThemes = [
  { emoji: "💕", label: "Amor", desc: "Relacionamentos e paixão", href: "/tarot/amor" },
  { emoji: "💼", label: "Carreira", desc: "Trabalho e propósito", href: "/numerologia" },
  { emoji: "🌟", label: "Hoje", desc: "O que o dia reserva", href: "/tarot/dia" },
  { emoji: "🔮", label: "Futuro", desc: "O que está por vir", href: "/tarot/completo" },
  { emoji: "🧘", label: "Autoconhecimento", desc: "Quem você realmente é", href: "/mapa-astral" },
  { emoji: "🌙", label: "Lua", desc: "Energia do momento", href: "/calendario-lunar" },
  { emoji: "💑", label: "Compatibilidade", desc: "Vocês combinam?", href: "/compatibilidade" },
  { emoji: "📖", label: "Aprender", desc: "Cursos e artigos", href: "/blog" },
];

export default function Home() {
  usePageSEO({
    title: "Chave do Oráculo — Tarot Online Grátis com IA, Numerologia e Horóscopo",
    description: "Tire sua carta do dia, descubra seu mapa numerológico e receba previsões personalizadas. Leituras de Tarot com inteligência artificial feitas para iluminar seu caminho.",
    path: "/",
  });

  useTrackReferral();

  useStructuredData([
    {
      type: "website",
      name: "Chave do Oráculo",
      description: "Tarot online, numerologia, horóscopo e mapa astral com interpretação por IA.",
      url: window.location.origin,
    },
    {
      type: "faq",
      questions: [
        { question: "O Tarot do Dia é grátis?", answer: "Sim! O Tarot do Dia é 100% gratuito. Tire sua carta todos os dias e receba uma mensagem personalizada com seu nome e data de nascimento." },
        { question: "Como funciona a leitura de Tarot com IA?", answer: "Nossa inteligência artificial combina séculos de tradição do Tarot com tecnologia avançada para criar interpretações únicas e personalizadas para cada pessoa." },
        { question: "Posso fazer consulta com tarólogo ao vivo?", answer: "Sim! Temos tarólogos experientes disponíveis para consultas por chat, vídeo ou telefone. Acesse a página de Consultas para ver os profissionais disponíveis." },
        { question: "O que é o Mapa Numerológico?", answer: "O Mapa Numerológico revela seus números pessoais de destino, expressão e alma a partir do seu nome completo e data de nascimento. É uma ferramenta poderosa de autoconhecimento." },
      ],
    },
  ]);

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(265_72%_60%/0.12),transparent_60%)]" />
      </div>
      <Header />

      {/* Hero — Compact */}
      <section className="relative pt-24 pb-10 z-10">
        <div className="container mx-auto relative z-10 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-[1.15] text-foreground tracking-tight">
                As respostas que você{" "}
                <span className="text-primary">procura</span>
                <br />já estão nas cartas
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                Tire sua carta agora e descubra o que o Tarot, a Numerologia e os Astros revelam sobre o seu momento.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/tarot/dia">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-7 py-5 pulse-glow">
                    <Star className="w-4 h-4 mr-2" />
                    Receber minha mensagem do dia
                  </Button>
                </Link>
                <Link to="/consultas">
                  <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary text-base px-7 py-5">
                    <Users className="w-4 h-4 mr-2" />
                    Falar com um tarólogo
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 relative z-10">
        <div className="container mx-auto px-4">
          <SocialProof />
        </div>
      </section>

      {/* O que você quer saber? */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">O que você quer saber?</h2>
            <p className="text-muted-foreground text-sm mt-2">Escolha o tema e encontre a leitura certa para você</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {lifeThemes.map((tema, i) => (
              <Link key={i} to={tema.href}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-xl p-4 text-center group hover:border-primary/30 transition-all cursor-pointer"
                >
                  <p className="text-2xl mb-2">{tema.emoji}</p>
                  <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{tema.label}</p>
                  <p className="text-xs text-muted-foreground">{tema.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto relative z-10 px-4">
          <div className="text-center mb-8">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-primary/70 text-xs font-semibold tracking-[0.2em] uppercase">Leituras e Oráculos</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 text-foreground">Qual pergunta não te deixa dormir?</h2>
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
              <span className="text-primary/70 text-xs font-semibold tracking-[0.2em] uppercase">Por que confiar</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 text-foreground">No Chave do Oráculo</h2>
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

      {/* Testimonials */}
      <Testimonials />

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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 text-foreground leading-tight">
                Sua intuição te trouxe até aqui.{" "}
                <span className="text-primary">Confie nela.</span>
              </h2>
              <p className="text-muted-foreground mb-8 text-sm sm:text-base leading-relaxed">
                Tire sua primeira carta gratuitamente e veja o que as cartas têm a dizer sobre você — leva menos de 1 minuto.
              </p>
              <Link to="/tarot/dia">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base px-6 sm:px-8 py-5 pulse-glow w-auto">
                  <Sparkles className="w-4 h-4 mr-2 shrink-0" />
                  Tirar minha carta grátis
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <OnboardingModal />

      <Footer />
    </div>
  );
}
