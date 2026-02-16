import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const signoNames: Record<string, string> = {
  aries: "Áries", touro: "Touro", gemeos: "Gêmeos", cancer: "Câncer",
  leao: "Leão", virgem: "Virgem", libra: "Libra", escorpiao: "Escorpião",
  sagitario: "Sagitário", capricornio: "Capricórnio", aquario: "Aquário", peixes: "Peixes",
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-border/20 bg-secondary/30 backdrop-blur-md">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-serif text-lg font-bold text-foreground">Chave do Oráculo</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tarot online grátis com inteligência artificial. Leituras personalizadas para iluminar seu caminho.
            </p>
          </div>

          {/* Oráculos */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Oráculos</h4>
            <div className="space-y-2">
              <Link to="/tarot/dia" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Tarot do Dia</Link>
              <Link to="/tarot/amor" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Tarot do Amor</Link>
              <Link to="/tarot/completo" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Tarot Completo</Link>
              <Link to="/numerologia" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Numerologia</Link>
              <Link to="/horoscopo" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Horóscopo do Dia</Link>
              <Link to="/mapa-astral" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Mapa Astral</Link>
              <Link to="/compatibilidade" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Compatibilidade</Link>
            </div>
          </div>

          {/* Signos */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Signos</h4>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(signoNames).map(([slug, name]) => (
                <Link key={slug} to={`/signo/${slug}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mais */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Mais</h4>
            <div className="space-y-2">
              <Link to="/blog" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
              <Link to="/calendario-lunar" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Calendário Lunar</Link>
              <Link to="/consultas" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Consultas ao Vivo</Link>
              <Link to="/cursos" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Cursos</Link>
              <Link to="/produtos" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Loja</Link>
              <Link to="/signos" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Signos do Zodíaco</Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border/20 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Chave do Oráculo. Leituras de Tarot com inteligência artificial para entretenimento e autoconhecimento.
          </p>
        </div>
      </div>
    </footer>
  );
}
