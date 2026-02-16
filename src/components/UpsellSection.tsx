import { Link } from "react-router-dom";

interface UpsellSectionProps {
  currentOracle?: string;
}

export default function UpsellSection({ currentOracle }: UpsellSectionProps) {
  return (
    <div className="mt-8 space-y-4">
      {/* Divisor místico */}
      <div className="flex items-center gap-3 py-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <span className="text-amber-400 text-sm font-medium">✦ Aprofunde sua jornada ✦</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      </div>

      {/* Card principal — Tarot do Amor */}
      {currentOracle !== "tarot-amor" && (
        <Link to="/tarot/amor" className="block">
          <div className="bg-gradient-to-r from-pink-500/15 to-rose-500/15 border border-pink-500/30 rounded-xl p-5 hover:border-pink-400/50 transition-all group cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">💕</span>
              <div>
                <h3 className="text-foreground font-bold group-hover:text-pink-300 transition-colors">
                  Tarot do Amor
                </h3>
                <p className="text-muted-foreground text-sm">
                  Descubra o que as cartas revelam sobre sua vida amorosa
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-emerald-400 text-xs font-medium bg-emerald-500/15 px-2 py-0.5 rounded">
                Grátis
              </span>
              <span className="text-foreground/80 text-sm group-hover:text-foreground transition-colors">
                Fazer leitura →
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Card secundário — Tarot Completo */}
      {currentOracle !== "tarot-completo" && (
        <Link to="/tarot/completo" className="block">
          <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/25 rounded-xl p-5 hover:border-amber-400/50 transition-all group cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔮</span>
              <div>
                <h3 className="text-foreground font-bold group-hover:text-amber-300 transition-colors">
                  Leitura Completa — 6 Cartas
                </h3>
                <p className="text-muted-foreground text-sm">
                  Uma visão profunda sobre qualquer área da sua vida
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-amber-400 text-xs font-medium bg-amber-500/15 px-2 py-0.5 rounded">
                Premium
              </span>
              <span className="text-foreground/80 text-sm group-hover:text-foreground transition-colors">
                Conhecer →
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Links rápidos para outros serviços */}
      <div className="flex flex-wrap gap-2 justify-center pt-2">
        <Link to="/horoscopo" className="text-muted-foreground text-xs hover:text-amber-400 transition-colors px-3 py-1.5 rounded-full border border-border/30 hover:border-amber-500/30">
          Horóscopo do Dia
        </Link>
        <Link to="/numerologia" className="text-muted-foreground text-xs hover:text-amber-400 transition-colors px-3 py-1.5 rounded-full border border-border/30 hover:border-amber-500/30">
          Numerologia
        </Link>
        <Link to="/compatibilidade" className="text-muted-foreground text-xs hover:text-amber-400 transition-colors px-3 py-1.5 rounded-full border border-border/30 hover:border-amber-500/30">
          Compatibilidade
        </Link>
      </div>
    </div>
  );
}
