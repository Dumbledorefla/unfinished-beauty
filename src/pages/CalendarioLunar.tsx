import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import RelatedContent, { getRelatedItems } from "@/components/RelatedContent";
import heroBg from "@/assets/hero-bg.jpg";

const MOON_PHASES = [
  { name: "Lua Nova", emoji: "🌑", energy: "Novos começos, intenções, planejamento", ritual: "Escreva seus desejos e intenções para o ciclo" },
  { name: "Lua Crescente", emoji: "🌒", energy: "Crescimento, ação, determinação", ritual: "Comece novos projetos e tome iniciativas" },
  { name: "Quarto Crescente", emoji: "🌓", energy: "Desafios, decisões, perseverança", ritual: "Enfrente obstáculos e tome decisões importantes" },
  { name: "Gibosa Crescente", emoji: "🌔", energy: "Refinamento, ajustes, paciência", ritual: "Revise seus planos e faça ajustes necessários" },
  { name: "Lua Cheia", emoji: "🌕", energy: "Realização, gratidão, celebração", ritual: "Celebre conquistas e pratique gratidão" },
  { name: "Gibosa Minguante", emoji: "🌖", energy: "Reflexão, compartilhamento, ensino", ritual: "Compartilhe o que aprendeu e ajude outros" },
  { name: "Quarto Minguante", emoji: "🌗", energy: "Liberação, perdão, desapego", ritual: "Solte o que não serve mais e perdoe" },
  { name: "Lua Minguante", emoji: "🌘", energy: "Descanso, introspecção, renovação", ritual: "Descanse, medite e prepare-se para o novo ciclo" },
];

const ASTRO_EVENTS_2026 = [
  { date: "2026-01-03", event: "Lua Nova em Capricórnio", type: "lua-nova" },
  { date: "2026-01-10", event: "Quarto Crescente em Áries", type: "quarto" },
  { date: "2026-01-17", event: "Lua Cheia em Câncer", type: "lua-cheia" },
  { date: "2026-01-25", event: "Quarto Minguante em Escorpião", type: "quarto" },
  { date: "2026-02-01", event: "Lua Nova em Aquário", type: "lua-nova" },
  { date: "2026-02-09", event: "Quarto Crescente em Touro", type: "quarto" },
  { date: "2026-02-16", event: "Lua Cheia em Leão", type: "lua-cheia" },
  { date: "2026-02-23", event: "Quarto Minguante em Sagitário", type: "quarto" },
  { date: "2026-03-03", event: "Lua Nova em Peixes", type: "lua-nova" },
  { date: "2026-03-11", event: "Quarto Crescente em Gêmeos", type: "quarto" },
  { date: "2026-03-18", event: "Lua Cheia em Virgem", type: "lua-cheia" },
  { date: "2026-03-25", event: "Quarto Minguante em Capricórnio", type: "quarto" },
  { date: "2026-03-29", event: "Eclipse Solar Total em Áries", type: "eclipse" },
  { date: "2026-04-01", event: "Lua Nova em Áries", type: "lua-nova" },
  { date: "2026-04-09", event: "Quarto Crescente em Câncer", type: "quarto" },
  { date: "2026-04-16", event: "Lua Cheia em Libra", type: "lua-cheia" },
  { date: "2026-05-01", event: "Lua Nova em Touro", type: "lua-nova" },
  { date: "2026-05-16", event: "Lua Cheia em Escorpião", type: "lua-cheia" },
  { date: "2026-06-14", event: "Lua Cheia em Sagitário", type: "lua-cheia" },
  { date: "2026-07-14", event: "Lua Cheia em Capricórnio", type: "lua-cheia" },
  { date: "2026-08-12", event: "Lua Cheia em Aquário + Eclipse Lunar", type: "eclipse" },
  { date: "2026-09-11", event: "Lua Cheia em Peixes", type: "lua-cheia" },
  { date: "2026-09-21", event: "Eclipse Solar Anular em Virgem", type: "eclipse" },
];

function getMoonPhase(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const c = Math.floor(365.25 * year);
  const e = Math.floor(30.6 * month);
  const jd = c + e + day - 694039.09;
  const phase = jd / 29.53058867;
  return phase - Math.floor(phase);
}

function getPhaseIndex(date: Date): number {
  const phase = getMoonPhase(date);
  return Math.floor(phase * 8) % 8;
}

export default function CalendarioLunar() {
  usePageSEO({
    title: "Calendário Lunar 2026 — Fases da Lua, Eclipses e Rituais",
    description: "Acompanhe as fases da lua, eclipses e eventos astrológicos de 2026. Saiba o melhor momento para cada ação com nosso calendário lunar completo.",
    path: "/calendario-lunar",
  });
  useStructuredData([
    { type: "breadcrumb", items: [{ name: "Início", url: window.location.origin }, { name: "Calendário Lunar", url: `${window.location.origin}/calendario-lunar` }] },
  ]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();
  const todayPhase = MOON_PHASES[getPhaseIndex(today)];

  const monthName = currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const monthEvents = ASTRO_EVENTS_2026.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
  });

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <PageBreadcrumb items={[{ label: "Calendário Lunar" }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Calendário Lunar 2026</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Acompanhe as fases da lua e saiba o melhor momento para cada ação. A lua influencia nossas emoções, energia e decisões.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
             <Card className="bg-card/80 backdrop-blur-md border-white/12 mb-8">
              <CardContent className="p-6 text-center">
                <p className="text-xs text-amber-400 uppercase tracking-wider mb-2">Lua de hoje</p>
                <p className="text-5xl mb-3">{todayPhase.emoji}</p>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-2">{todayPhase.name}</h2>
                <p className="text-muted-foreground mb-3">{todayPhase.energy}</p>
                <div className="bg-secondary/40 rounded-xl p-4 max-w-md mx-auto">
                  <p className="text-sm text-foreground/80">
                    <Sparkles className="w-4 h-4 inline mr-1 text-amber-400" />
                    <strong>Ritual sugerido:</strong> {todayPhase.ritual}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={prevMonth}><ChevronLeft className="w-5 h-5" /></Button>
            <h3 className="font-serif text-xl font-bold text-foreground capitalize">{monthName}</h3>
            <Button variant="ghost" onClick={nextMonth}><ChevronRight className="w-5 h-5" /></Button>
          </div>

          <div className="space-y-3 mb-12">
            {monthEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum evento registrado para este mês.</p>
            ) : (
              monthEvents.map((event, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={`bg-card/80 border-white/8 ${event.type === "eclipse" ? "border-amber-500/30 bg-amber-500/5" : ""}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="text-center min-w-[50px]">
                        <p className="text-2xl">{event.type === "lua-nova" ? "🌑" : event.type === "lua-cheia" ? "🌕" : event.type === "eclipse" ? "🌒" : "🌓"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{event.event}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
                          {event.type === "eclipse" && <span className="ml-2 text-amber-400 font-semibold">Eclipse</span>}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          <h3 className="font-serif text-2xl font-bold text-foreground mb-6 text-center">Guia das Fases Lunares</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {MOON_PHASES.map((phase, i) => (
              <Card key={i} className="bg-card/80 border-white/8">
                <CardContent className="p-5 flex gap-4">
                  <p className="text-3xl">{phase.emoji}</p>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{phase.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{phase.energy}</p>
                    <p className="text-xs text-amber-400/70">{phase.ritual}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <RelatedContent items={getRelatedItems("/calendario-lunar")} />
        </div>
      </main>
    </div>
  );
}
