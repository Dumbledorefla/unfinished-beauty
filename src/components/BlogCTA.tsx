import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Calculator, Star, Moon, Compass } from "lucide-react";

interface BlogCTAProps {
  category: string;
  variant?: "inline" | "footer";
}

const CTA_MAP: Record<string, { icon: React.ElementType; title: string; description: string; link: string; buttonText: string }> = {
  tarot: {
    icon: Star,
    title: "Quer saber o que as cartas dizem para você?",
    description: "Tire sua carta do dia gratuitamente e receba uma mensagem personalizada com base na sua data de nascimento.",
    link: "/tarot/dia",
    buttonText: "Tirar minha carta grátis",
  },
  amor: {
    icon: Heart,
    title: "Descubra o que as cartas revelam sobre seu amor",
    description: "Faça uma tiragem de 3 cartas focada no seu relacionamento e receba orientações para o seu coração.",
    link: "/tarot/amor",
    buttonText: "Consultar o Tarot do Amor",
  },
  numerologia: {
    icon: Calculator,
    title: "Descubra o poder dos seus números",
    description: "Calcule seu número pessoal e entenda o que ele revela sobre sua personalidade e destino.",
    link: "/numerologia",
    buttonText: "Calcular meu número",
  },
  astrologia: {
    icon: Moon,
    title: "Veja o que os astros reservam para você",
    description: "Confira as previsões do seu signo e entenda as energias que influenciam sua semana.",
    link: "/horoscopo",
    buttonText: "Ver meu horóscopo",
  },
  autoconhecimento: {
    icon: Compass,
    title: "Aprofunde sua jornada de autoconhecimento",
    description: "Combine Tarot, Numerologia e Astrologia para uma visão completa de quem você é.",
    link: "/mapa-astral",
    buttonText: "Explorar meu Mapa Astral",
  },
  default: {
    icon: Sparkles,
    title: "Explore as ferramentas do Chave do Oráculo",
    description: "Tarot, Numerologia, Horóscopo e muito mais — tudo gratuito para iluminar seu caminho.",
    link: "/",
    buttonText: "Começar agora",
  },
};

export default function BlogCTA({ category, variant = "footer" }: BlogCTAProps) {
  const cta = CTA_MAP[category.toLowerCase()] || CTA_MAP.default;
  const Icon = cta.icon;

  if (variant === "inline") {
    return (
      <div className="my-8 p-5 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center gap-4">
        <Icon className="w-8 h-8 text-primary shrink-0" />
        <div className="flex-1 text-center sm:text-left">
          <p className="font-semibold text-foreground text-sm">{cta.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{cta.description}</p>
        </div>
        <Link to={cta.link}>
          <Button size="sm" className="bg-primary text-primary-foreground whitespace-nowrap">
            {cta.buttonText}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/60 to-primary/5 backdrop-blur-md border border-primary/20 text-center">
      <Icon className="w-10 h-10 text-primary mx-auto mb-3" />
      <h3 className="font-serif text-xl font-bold text-foreground mb-2">{cta.title}</h3>
      <p className="text-muted-foreground text-sm mb-5 max-w-md mx-auto">{cta.description}</p>
      <Link to={cta.link}>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Sparkles className="w-4 h-4 mr-2" />
          {cta.buttonText}
        </Button>
      </Link>
    </div>
  );
}
