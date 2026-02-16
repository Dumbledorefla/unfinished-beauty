import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles, Star, Moon, Sun, Calculator, Heart,
  ArrowRight, Compass, Eye, Zap, Users, BookOpen,
  Calendar, MessageCircle, Flame, ChevronRight, Clock,
  Wand2, Layout, Newspaper
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
import NewsletterSignup from "@/components/NewsletterSignup";
import { signos } from "@/data/signos";
import { supabase } from "@/integrations/supabase/client";

/* ─── Moon Phase Calculator ─── */
const MOON_PHASES = [
  { name: "Lua Nova", emoji: "🌑", energy: "Novos começos e intenções", color: "from-slate-500/20 to-slate-600/20" },
  { name: "Lua Crescente", emoji: "🌒", energy: "Crescimento e ação", color: "from-emerald-500/20 to-teal-500/20" },
  { name: "Quarto Crescente", emoji: "🌓", energy: "Desafios e decisões", color: "from-amber-500/20 to-orange-500/20" },
  { name: "Gibosa Crescente", emoji: "🌔", energy: "Refinamento e paciência", color: "from-blue-500/20 to-indigo-500/20" },
  { name: "Lua Cheia", emoji: "🌕", energy: "Realização e gratidão", color: "from-yellow-500/20 to-amber-500/20" },
  { name: "Gibosa Minguante", emoji: "🌖", energy: "Reflexão e partilha", color: "from-purple-500/20 to-violet-500/20" },
  { name: "Quarto Minguante", emoji: "🌗", energy: "Liberação e desapego", color: "from-rose-500/20 to-pink-500/20" },
  { name: "Lua Minguante", emoji: "🌘", energy: "Descanso e renovação", color: "from-indigo-500/20 to-slate-500/20" },
];

function getMoonPhaseIndex(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const c = Math.floor(365.25 * year);
  const e = Math.floor(30.6 * month);
  const jd = c + e + day - 694039.09;
  const phase = jd / 29.53058867;
  return Math.floor((phase - Math.floor(phase)) * 8) % 8;
}

/* ─── Data ─── */
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
  { icon: Sparkles, title: "Sabedoria ancestral, leitura única", description: "Nossas leituras combinam séculos de tradição do Tarot com interpretações profundas e personalizadas, feitas sob medida para o seu momento." },
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

/* ─── Desktop-only: Featured services (top 3 big cards) ─── */
const featuredServices = [
  {
    id: "tarot", title: "Tarot Online",
    description: "Tire suas cartas e receba uma leitura personalizada e profunda. Do Dia, do Amor ou Completo — escolha o que seu coração pede.",
    icon: Star, href: "/tarot/dia", gradient: "from-violet-600/30 to-purple-800/30",
    links: [
      { label: "Tarot do Dia", href: "/tarot/dia", badge: "Grátis" },
      { label: "Tarot do Amor", href: "/tarot/amor", badge: "Grátis" },
      { label: "Tarot Completo", href: "/tarot/completo", badge: "Premium" },
    ],
  },
  {
    id: "astro", title: "Astrologia",
    description: "Horóscopo diário personalizado, mapa astral completo e compatibilidade entre signos. Os astros falam — você escuta.",
    icon: Sun, href: "/horoscopo", gradient: "from-indigo-600/30 to-blue-800/30",
    links: [
      { label: "Horóscopo do Dia", href: "/horoscopo", badge: "Grátis" },
      { label: "Mapa Astral", href: "/mapa-astral", badge: "Grátis" },
      { label: "Compatibilidade", href: "/compatibilidade", badge: "Novo" },
    ],
  },
  {
    id: "numera", title: "Numerologia",
    description: "Descubra o que seus números revelam sobre destino, personalidade e missão de vida. Seu nome carrega segredos.",
    icon: Calculator, href: "/numerologia", gradient: "from-emerald-600/30 to-teal-800/30",
    links: [
      { label: "Mapa Numerológico", href: "/numerologia", badge: "Grátis" },
      { label: "Calendário Lunar", href: "/calendario-lunar" },
      { label: "Diário de Tarot", href: "/diario", badge: "Novo" },
    ],
  },
];

/* ─── Blog article type ─── */
interface BlogPreview {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string;
  author_name: string;
  reading_time_min: number;
  published_at: string;
}

export default function Home() {
  usePageSEO({
    title: "Chave do Oráculo — Tarot Online Grátis, Numerologia e Horóscopo Personalizado",
    description: "Tire sua carta do dia, descubra seu mapa numerológico e receba previsões personalizadas. Leituras de Tarot feitas sob medida para iluminar seu caminho.",
    path: "/",
  });

  useTrackReferral();

  useStructuredData([
    {
      type: "website",
      name: "Chave do Oráculo",
      description: "Tarot online, numerologia, horóscopo e mapa astral com interpretações personalizadas.",
      url: window.location.origin,
    },
    {
      type: "faq",
      questions: [
        { question: "O Tarot do Dia é grátis?", answer: "Sim! O Tarot do Dia é 100% gratuito. Tire sua carta todos os dias e receba uma mensagem personalizada com seu nome e data de nascimento." },
        { question: "Como funciona a leitura de Tarot personalizada?", answer: "Nossas leituras combinam séculos de tradição do Tarot com seu nome, data de nascimento e momento de vida para criar interpretações únicas e profundas, feitas especialmente para você." },
        { question: "Posso fazer consulta com tarólogo ao vivo?", answer: "Sim! Temos tarólogos experientes disponíveis para consultas por chat, vídeo ou telefone. Acesse a página de Consultas para ver os profissionais disponíveis." },
        { question: "O que é o Mapa Numerológico?", answer: "O Mapa Numerológico revela seus números pessoais de destino, expressão e alma a partir do seu nome completo e data de nascimento. É uma ferramenta poderosa de autoconhecimento." },
      ],
    },
  ]);

  // Moon phase
  const moonPhase = useMemo(() => MOON_PHASES[getMoonPhaseIndex()], []);

  // Blog articles (desktop only)
  const [blogPosts, setBlogPosts] = useState<BlogPreview[]>([]);
  useEffect(() => {
    const loadBlog = async () => {
      try {
        const { data } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, cover_image_url, category, author_name, reading_time_min, published_at")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(3);
        if (data) setBlogPosts(data as BlogPreview[]);
      } catch {
        // silent fail
      }
    };
    loadBlog();
  }, []);

  // Today's date formatted
  const todayFormatted = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30 sm:opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background sm:from-background/30 sm:via-background/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(265_72%_60%/0.18),transparent_70%)] sm:bg-[radial-gradient(ellipse_at_top,hsl(265_72%_60%/0.12),transparent_60%)]" />
      </div>
      <Header />

      {/* ═══════════════════════════════════════════════════════════════
          HERO — Mobile: centralizado (original) | Desktop: assimétrico
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-28 sm:pt-24 lg:pt-28 pb-8 sm:pb-10 lg:pb-6 z-10">
        <div className="container mx-auto relative z-10 px-5 sm:px-4">
          {/* Mobile Hero (unchanged) */}
          <div className="lg:hidden max-w-2xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="sm:hidden mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shadow-[0_0_30px_hsl(265_72%_60%/0.2)]">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-5 leading-[1.2] sm:leading-[1.15] text-foreground tracking-tight">
                As respostas que você{" "}
                <span className="text-primary">procura</span>
                <span className="sm:hidden"> </span>
                <br className="hidden sm:block" />
                já estão nas cartas
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md sm:max-w-lg mx-auto leading-relaxed">
                Tire sua carta agora e descubra o que o Tarot, a Numerologia e os Astros revelam sobre o seu momento.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center px-2 sm:px-0">
                <Link to="/tarot/dia" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base px-5 sm:px-7 py-4 sm:py-5 pulse-glow">
                    <Star className="w-4 h-4 mr-2 shrink-0" />
                    Receber minha mensagem do dia
                  </Button>
                </Link>
                <Link to="/consultas" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-secondary text-sm sm:text-base px-5 sm:px-7 py-4 sm:py-5">
                    <Users className="w-4 h-4 mr-2 shrink-0" />
                    Falar com um tarólogo
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Desktop Hero — Asymmetric layout */}
          <div className="hidden lg:grid lg:grid-cols-5 lg:gap-10 lg:items-center">
            {/* Left: Text + CTA */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              <p className="text-primary/70 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
                {todayFormatted}
              </p>
              <h1 className="text-4xl xl:text-5xl font-bold mb-5 leading-[1.15] text-foreground tracking-tight">
                Seu portal de{" "}
                <span className="text-primary">autoconhecimento</span>
                <br />
                e orientação espiritual
              </h1>
              <p className="text-base xl:text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
                Tarot personalizado, horóscopo do dia, numerologia, mapa astral, consultas ao vivo e muito mais. Tudo em um só lugar para iluminar seu caminho.
              </p>
              <div className="flex gap-3">
                <Link to="/tarot/dia">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-7 py-5 pulse-glow">
                    <Star className="w-4 h-4 mr-2" />
                    Tirar minha carta do dia
                  </Button>
                </Link>
                <Link to="/consultas">
                  <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary px-7 py-5">
                    <Users className="w-4 h-4 mr-2" />
                    Consultar tarólogo
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right: Quick-access widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="glass-card rounded-2xl p-6 space-y-4">
                {/* Moon phase widget */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/5 border border-primary/15">
                  <span className="text-3xl">{moonPhase.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{moonPhase.name}</p>
                    <p className="text-xs text-muted-foreground">{moonPhase.energy}</p>
                  </div>
                  <Link to="/calendario-lunar" className="ml-auto">
                    <ChevronRight className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                  </Link>
                </div>

                {/* Quick links */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acesso rápido</p>
                  {[
                    { icon: Star, label: "Tarot do Dia", desc: "Sua mensagem diária", href: "/tarot/dia", badge: "Grátis" },
                    { icon: Sun, label: "Horóscopo", desc: "Previsões personalizadas", href: "/horoscopo", badge: "Grátis" },
                    { icon: Calculator, label: "Numerologia", desc: "Seus números de destino", href: "/numerologia", badge: "Grátis" },
                    { icon: Heart, label: "Tarot do Amor", desc: "Energias do coração", href: "/tarot/amor", badge: "Grátis" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} to={item.href}>
                        <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors group cursor-pointer">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                          <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium uppercase tracking-wider">
                            {item.badge}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Consultas CTA */}
                <Link to="/consultas">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-accent/15 hover:border-accent/30 transition-colors cursor-pointer group">
                    <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">Consultas ao Vivo</p>
                      <p className="text-xs text-muted-foreground">Fale com um tarólogo agora</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SIGNOS BAR — Desktop only: 12 signos clicáveis
         ═══════════════════════════════════════════════════════════════ */}
      <section className="hidden lg:block py-4 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-1">
            {signos.map((signo) => (
              <Link key={signo.slug} to={`/signo/${signo.slug}`}>
                <motion.div
                  whileHover={{ y: -3, scale: 1.05 }}
                  className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group"
                >
                  <span className="text-lg mb-0.5">{signo.emoji}</span>
                  <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors">{signo.name}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SOCIAL PROOF — Both mobile and desktop
         ═══════════════════════════════════════════════════════════════ */}
      <section className="pt-2 sm:pt-4 lg:pt-2 pb-8 relative z-10">
        <div className="container mx-auto px-4">
          {/* Separador decorativo — mobile */}
          <div className="sm:hidden flex items-center gap-3 mb-5 px-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/20" />
            <Sparkles className="w-3.5 h-3.5 text-primary/40" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/20" />
          </div>
          <SocialProof />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURED SERVICES — Desktop: 3 big cards | Mobile: hidden
         ═══════════════════════════════════════════════════════════════ */}
      <section className="hidden lg:block py-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-primary/70 text-xs font-semibold tracking-[0.2em] uppercase">Explore nosso portal</span>
              <h2 className="text-3xl font-bold mt-2 text-foreground">Ferramentas de autoconhecimento</h2>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {featuredServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full glass-card group overflow-hidden">
                    <CardContent className="p-0">
                      {/* Header gradient */}
                      <div className={`bg-gradient-to-br ${service.gradient} p-6 pb-4`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-foreground" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground">{service.title}</h3>
                        </div>
                        <p className="text-sm text-foreground/70 leading-relaxed">{service.description}</p>
                      </div>
                      {/* Links */}
                      <div className="p-4 space-y-1">
                        {service.links.map((link) => (
                          <Link key={link.href} to={link.href}>
                            <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group/link">
                              <div className="flex items-center gap-2">
                                <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                <span className="text-sm text-foreground group-hover/link:text-primary transition-colors">{link.label}</span>
                              </div>
                              {link.badge && (
                                <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium uppercase tracking-wider ${
                                  link.badge === "Premium"
                                    ? "bg-accent/15 text-accent border border-accent/25"
                                    : link.badge === "Novo"
                                    ? "bg-primary/15 text-primary border border-primary/25"
                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                }`}>
                                  {link.badge}
                                </span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          "O QUE VOCÊ QUER SABER?" — Mobile only
         ═══════════════════════════════════════════════════════════════ */}
      <section className="lg:hidden py-12 relative z-10">
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

      {/* ═══════════════════════════════════════════════════════════════
          SERVICES GRID — Mobile: 2-col | Desktop: 4-col with extras
         ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto relative z-10 px-4">
          <div className="text-center mb-8">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-primary/70 text-xs font-semibold tracking-[0.2em] uppercase">Leituras e Oráculos</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 text-foreground">
                <span className="lg:hidden">Qual pergunta não te deixa dormir?</span>
                <span className="hidden lg:inline">Todos os nossos oráculos e ferramentas</span>
              </h2>
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

          {/* Desktop: Additional quick links */}
          <div className="hidden lg:flex justify-center gap-4 mt-6">
            {[
              { label: "Calendário Lunar", href: "/calendario-lunar", icon: Calendar },
              { label: "Diário de Tarot", href: "/diario", icon: BookOpen },
              { label: "Spreads Customizados", href: "/spreads", icon: Layout },
              { label: "Ritual Diário", href: "/ritual", icon: Wand2 },
              { label: "Blog", href: "/blog", icon: Newspaper },
            ].map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} to={link.href}>
                  <Button variant="outline" size="sm" className="border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BLOG FEED — Desktop only: 3 recent articles
         ═══════════════════════════════════════════════════════════════ */}
      {blogPosts.length > 0 && (
        <section className="hidden lg:block py-12 relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-primary/70 text-xs font-semibold tracking-[0.2em] uppercase">Blog</span>
                <h2 className="text-3xl font-bold mt-1 text-foreground">Artigos recentes</h2>
              </div>
              <Link to="/blog">
                <Button variant="outline" size="sm" className="border-border/50 text-muted-foreground hover:text-primary gap-2">
                  Ver todos os artigos
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              {blogPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/blog/${post.slug}`}>
                    <Card className="h-full glass-card group cursor-pointer overflow-hidden">
                      {post.cover_image_url && (
                        <div className="aspect-[16/9] overflow-hidden">
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-0.5 text-[10px] rounded-full bg-primary/15 text-primary border border-primary/25 font-medium uppercase tracking-wider">
                            {post.category}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.reading_time_min} min
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{post.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
                          <span className="text-xs text-muted-foreground">{post.author_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.published_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          DESKTOP EXTRA: Lua de Hoje + Ritual + Diário
         ═══════════════════════════════════════════════════════════════ */}
      <section className="hidden lg:block py-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Moon Phase Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Moon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Lua de Hoje</h3>
                  </div>
                  <div className="text-center py-4">
                    <span className="text-6xl block mb-3">{moonPhase.emoji}</span>
                    <p className="text-lg font-bold text-foreground">{moonPhase.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{moonPhase.energy}</p>
                  </div>
                  <Link to="/calendario-lunar">
                    <Button variant="outline" size="sm" className="w-full mt-2 border-border/50 text-muted-foreground hover:text-primary gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Ver calendário lunar completo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Ritual Diário */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <h3 className="font-semibold text-foreground">Ritual Diário</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Comece seu dia com um ritual guiado de 5 minutos. Meditação, carta do dia e intenção — tudo em um só lugar.
                  </p>
                  <div className="space-y-2 mb-4">
                    {["Meditação guiada", "Carta do dia", "Intenção diária", "Soundscapes relaxantes"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/ritual">
                    <Button variant="outline" size="sm" className="w-full border-border/50 text-muted-foreground hover:text-primary gap-2">
                      <Wand2 className="w-3.5 h-3.5" />
                      Começar ritual de hoje
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Diário de Tarot */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-semibold text-foreground">Diário de Tarot</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Registre suas leituras, acompanhe seu humor e veja padrões ao longo do tempo. Seu diário espiritual pessoal.
                  </p>
                  <div className="space-y-2 mb-4">
                    {["Registro de leituras", "Mood tracking", "Padrões e insights", "Histórico completo"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/diario">
                    <Button variant="outline" size="sm" className="w-full border-border/50 text-muted-foreground hover:text-primary gap-2">
                      <BookOpen className="w-3.5 h-3.5" />
                      Abrir meu diário
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES — Both mobile and desktop
         ═══════════════════════════════════════════════════════════════ */}
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

      {/* Newsletter */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto px-4 max-w-xl">
          <NewsletterSignup source="homepage" />
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
