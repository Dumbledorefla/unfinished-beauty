import { useEffect, type ReactNode } from "react";

type IconProps = { className?: string };

const Sparkles = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
  </svg>
);

const ArrowRight = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const Check = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const Gift = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
    <path d="M2 7h20v5H2z" />
    <path d="M12 22V7" />
    <path d="M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Z" />
    <path d="M12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z" />
  </svg>
);

const WA_1_PERGUNTA = "https://wa.me/5581995827762?text=Ol%C3%A1%21+Quero+fazer+uma+tiragem+de+1+pergunta+objetiva+%F0%9F%94%AE";
const WA_2_PERGUNTAS = "https://wa.me/5581995827762?text=Ol%C3%A1%21+Quero+fazer+uma+tiragem+de+2+perguntas+objetivas+%F0%9F%94%AE";
const WA_3_PERGUNTAS = "https://wa.me/5581995827762?text=Ol%C3%A1%21+Quero+fazer+uma+tiragem+de+3+perguntas+objetivas+%F0%9F%94%AE";
const WA_CARTA = "https://wa.me/5581995827762?text=Ol%C3%A1%21+Quero+a+Carta+Canalizada+%E2%AD%90";
const WA_ADOCAMENTO = "https://wa.me/5581995827762?text=Ol%C3%A1%21+Tenho+interesse+no+ritual+de+Ad%C3%A7oamento+%E2%AD%90";
const WA_CORTE = "https://wa.me/5581995827762?text=Ol%C3%A1%21+Tenho+interesse+no+ritual+de+Corte+de+La%C3%A7os+%E2%AD%90";
const WA_AUTOESTIMA = "https://wa.me/5581995827762?text=Ol%C3%A1%21+Tenho+interesse+no+ritual+de+Auto+Estima+e+Amor+Pr%C3%B3prio+%E2%AD%90";

const STAR_POSITIONS = Array.from({ length: 26 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53) % 100}%`,
  delay: `${(i % 8) * 0.45}s`,
  duration: `${2.8 + (i % 5) * 0.55}s`,
}));

function Stars() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STAR_POSITIONS.map((star, i) => (
        <span
          key={i}
          className="atendimentos-star absolute text-amber-300/40 text-xs"
          style={{ left: star.left, top: star.top, animationDelay: star.delay, animationDuration: star.duration }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

interface ItemCardProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  href: string;
}

function ItemCard({ emoji, title, subtitle, price, oldPrice, badge, href }: ItemCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex transform-gpu items-center justify-between gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border border-amber-500/20 bg-gradient-to-br from-violet-950/70 to-indigo-950/70 px-4 sm:px-5 py-3.5 sm:py-4 transition-all hover:-translate-y-0.5 hover:scale-[1.01] hover:border-amber-400/60 hover:shadow-[0_0_24px_-4px_rgba(201,168,76,0.4)]"
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        {emoji && <span className="text-xl sm:text-2xl shrink-0">{emoji}</span>}
        <div className="min-w-0 flex-1">
          <div className="font-serif text-[15px] sm:text-lg text-white leading-tight">{title}</div>
          {subtitle && <div className="text-[11px] sm:text-xs text-amber-200/70 mt-0.5">{subtitle}</div>}
          {badge && (
            <div className="mt-1 inline-block text-[9px] sm:text-[10px] uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 sm:px-2 py-0.5 rounded-full">
              {badge}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="text-right">
          {oldPrice && <div className="text-[10px] sm:text-xs text-white/40 line-through leading-none">{oldPrice}</div>}
          <div className="font-serif text-base sm:text-xl text-amber-300 leading-tight">{price}</div>
        </div>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center group-hover:bg-amber-300 transition-colors shrink-0">
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>
    </a>
  );
}


function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-amber-300/90 mb-5">
      {children}
    </h2>
  );
}

export default function Atendimentos() {
  useEffect(() => {
    document.title = "Amanda — Chave do Oráculo · Atendimentos";
    const meta = document.querySelector('meta[name="description"]');
    const content = "Tiragens de Tarot, Carta Canalizada e Rituais Especiais com Amanda — Chave do Oráculo. Promoção de lançamento.";
    if (meta) meta.setAttribute("content", content);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = content;
      document.head.appendChild(m);
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a1f]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/40 via-[#0a0a1f] to-[#050510]" />
      <div className="absolute top-0 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(265_70%_45%_/_0.22)_0%,transparent_68%)]" />
      <Stars />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-8 sm:px-5 sm:py-14">
        {/* Header */}
        <header className="atendimentos-fade-up text-center">
          {/* Amanda photo */}
          <div className="relative w-28 h-28 sm:w-40 sm:h-40 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 blur-md opacity-60" />
            <div className="relative w-full h-full rounded-full p-[3px] bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700">
              <img
                src="/amanda-foto.webp"
                alt="Amanda Oráculos"
                width={400}
                height={400}
                fetchPriority="high"
                decoding="async"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="absolute -top-2 -right-1 text-amber-300 text-base sm:text-lg animate-pulse">✦</span>
            <span className="absolute -bottom-1 -left-2 text-amber-300/70 text-xs sm:text-sm">✦</span>
          </div>

          <h1 className="mt-4 sm:mt-6 font-serif text-3xl sm:text-5xl text-amber-300" style={{ fontFamily: "Cinzel, serif" }}>
            Amanda Oráculos
          </h1>
          <p className="mt-2 text-[10px] sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/70">
            Baralho Cigano · Cartas Canalizadas
          </p>

          {/* Promo badge */}
          <div className="mt-4 sm:mt-6 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-amber-500/30 bg-violet-900/60 text-amber-200 text-[11px] sm:text-sm">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>Promoção de lançamento — por tempo limitado</span>
          </div>
        </header>



        {/* DESTAQUE — Tiragens */}
        <section className="atendimentos-fade-up mt-8 sm:mt-10 relative rounded-2xl sm:rounded-3xl p-[1.5px] bg-gradient-to-br from-amber-400 via-amber-500/40 to-amber-600 shadow-[0_0_40px_-10px_rgba(201,168,76,0.5)] [animation-delay:120ms]">
          <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-950/95 via-indigo-950/95 to-[#0a0a1f] p-5 sm:p-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em]">
              <Sparkles className="w-3 h-3" /> Destaque
            </div>

            <h2 className="mt-3 sm:mt-4 font-serif text-2xl sm:text-4xl text-white leading-tight" style={{ fontFamily: "Cinzel, serif" }}>
              Tiragens <span className="italic text-amber-300">de Tarot</span>
            </h2>
            <p className="mt-2 text-white/70 text-[13px] sm:text-base leading-relaxed">
              Respostas claras e diretas para o que você precisa saber agora.
            </p>

            {/* Includes */}
            <div className="mt-5 sm:mt-6 rounded-xl sm:rounded-2xl border border-white/10 bg-black/20 p-3.5 sm:p-5">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-amber-300/90 mb-2.5 sm:mb-3">
                O que está incluso
              </div>
              <ul className="space-y-2 sm:space-y-2.5 text-[13px] sm:text-sm text-white/85">
                <li className="flex gap-2 sm:gap-2.5"><Check className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />Leitura personalizada com as cartas do Baralho Cigano</li>
                <li className="flex gap-2 sm:gap-2.5"><Check className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />Explicação completa da tiragem com fotos das cartas</li>
                <li className="flex gap-2 sm:gap-2.5"><Gift className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />Áudio explicativo com a Amanda</li>
                <li className="flex gap-2 sm:gap-2.5"><Gift className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />Interpretação detalhada de cada carta</li>
                <li className="flex gap-2 sm:gap-2.5"><Gift className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />Orientação prática para sua situação</li>
              </ul>
            </div>

            {/* Options */}
            <div className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
              <ItemCard title="1 pergunta objetiva" price="R$ 13" href={WA_1_PERGUNTA} />
              <ItemCard title="2 perguntas objetivas" price="R$ 26" href={WA_2_PERGUNTAS} />
              <ItemCard
                title="3 perguntas objetivas"
                subtitle="🔥 melhor custo"
                price="R$ 29"
                badge="Mais escolhida"
                href={WA_3_PERGUNTAS}
              />
            </div>
          </div>
        </section>


        {/* Carta Canalizada */}
        <section className="atendimentos-fade-up mt-10 sm:mt-14 [animation-delay:180ms]">
          <SectionTitle>Carta Canalizada</SectionTitle>
          <p className="text-center text-white/70 text-[13px] sm:text-sm mb-4 sm:mb-5 max-w-md mx-auto px-2">
            O que ele(a) sente por você mas não tem coragem de dizer.
          </p>
          <ItemCard
            title="Carta Canalizada"
            subtitle="Mensagem do coração dele(a)"
            price="R$ 25"
            oldPrice="R$ 79"
            badge="68% off"
            href={WA_CARTA}
          />
        </section>

        {/* Rituais Especiais */}
        <section className="atendimentos-fade-up mt-10 sm:mt-14 [animation-delay:240ms]">
          <SectionTitle>Rituais Especiais</SectionTitle>
          <div className="space-y-2.5 sm:space-y-3">
            <ItemCard emoji="🍯" title="Adoçamento" subtitle="Materiais inclusos" price="R$ 300" href={WA_ADOCAMENTO} />
            <ItemCard emoji="✂️" title="Corte de Laços" subtitle="Materiais inclusos" price="R$ 500" href={WA_CORTE} />
            <ItemCard emoji="💖" title="Auto estima e amor próprio" subtitle="Materiais inclusos" price="R$ 350" href={WA_AUTOESTIMA} />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-white/10 flex flex-col items-center gap-3 text-center">
          <img src="/chave-oraculo-logo.webp" alt="" width={80} height={80} loading="lazy" decoding="async" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full opacity-90" />
          <p className="text-[11px] sm:text-xs text-white/50 px-4">
            © 2025 Chave do Oráculo · Todos os direitos reservados
          </p>
        </footer>

      </div>
    </div>
  );
}
