import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface RelatedItem {
  title: string;
  description: string;
  href: string;
  emoji: string;
  badge?: string;
}

interface RelatedContentProps {
  title?: string;
  items: RelatedItem[];
  className?: string;
}

const defaultItems: Record<string, RelatedItem[]> = {
  tarot: [
    { title: "Tarot do Dia", description: "Tire sua carta diária", href: "/tarot/dia", emoji: "⭐", badge: "Grátis" },
    { title: "Tarot do Amor", description: "Passado, presente e futuro", href: "/tarot/amor", emoji: "💕", badge: "Grátis" },
    { title: "Tarot Completo", description: "Leitura profunda com 6 cartas", href: "/tarot/completo", emoji: "🔮", badge: "Premium" },
  ],
  astrologia: [
    { title: "Horóscopo do Dia", description: "Previsões personalizadas", href: "/horoscopo", emoji: "☀️", badge: "Grátis" },
    { title: "Mapa Astral", description: "Seu céu completo", href: "/mapa-astral", emoji: "🗺️", badge: "Grátis" },
    { title: "Compatibilidade", description: "Descubra a sintonia", href: "/compatibilidade", emoji: "💕" },
  ],
  numerologia: [
    { title: "Numerologia", description: "Seus números de destino", href: "/numerologia", emoji: "🔢", badge: "Grátis" },
    { title: "Calendário Lunar", description: "Fases e rituais", href: "/calendario-lunar", emoji: "🌙" },
    { title: "Signos do Zodíaco", description: "Conheça cada signo", href: "/signos", emoji: "♈" },
  ],
};

export function getRelatedItems(currentPath: string): RelatedItem[] {
  const all = [...defaultItems.tarot, ...defaultItems.astrologia, ...defaultItems.numerologia];
  return all.filter((item) => item.href !== currentPath).slice(0, 3);
}

export default function RelatedContent({ title = "Você também pode gostar", items, className = "" }: RelatedContentProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className={`mt-12 pt-8 border-t border-border/20 ${className}`}>
      <h3 className="font-serif text-xl font-bold text-foreground mb-5">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link key={item.href} to={item.href}>
            <Card className="bg-card/60 backdrop-blur-md border-primary/10 hover:border-primary/30 transition-all group h-full">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{item.emoji}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary border border-primary/20 font-medium uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 flex-1">{item.description}</p>
                <div className="flex items-center gap-1 text-xs text-primary/70 mt-3 group-hover:text-primary transition-colors">
                  Explorar <ArrowRight className="w-3 h-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
