import { useEffect, type ReactNode } from "react";

// ============== Facebook Pixel + Conversions API ==============
const FB_PIXEL_ID = "3545701582264861";
const CAPI_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/facebook-capi`;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : undefined;
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "ev_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
}

/**
 * Fires a Lead event to BOTH Pixel (browser) and Conversions API (server)
 * using the same event_id so Meta deduplicates.
 * Non-blocking — never delays navigation to WhatsApp.
 */
function trackLead(opts: { content_name: string; value: number; currency?: string }) {
  const eventId = uuid();
  const currency = opts.currency || "BRL";

  // 1. Browser Pixel
  try {
    window.fbq?.("track", "Lead", {
      content_name: opts.content_name,
      value: opts.value,
      currency,
    }, { eventID: eventId });
  } catch (err) {
    console.warn("fbq track failed", err);
  }

  // 2. Server CAPI (fire-and-forget, with keepalive so it survives navigation)
  try {
    fetch(CAPI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        event_name: "Lead",
        event_id: eventId,
        event_source_url: window.location.href,
        action_source: "website",
        value: opts.value,
        currency,
        content_name: opts.content_name,
        fbp: getCookie("_fbp"),
        fbc: getCookie("_fbc"),
        client_user_agent: navigator.userAgent,
      }),
    }).catch((err) => console.warn("CAPI Lead failed", err));
  } catch (err) {
    console.warn("CAPI Lead exception", err);
  }
}


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

const whatsappLink = (message: string) => `https://wa.me/5581995827762?text=${encodeURIComponent(message)}`;

const WA_1_PERGUNTA = whatsappLink("Olá! Quero fazer uma tiragem de 1 pergunta objetiva");
const WA_2_PERGUNTAS = whatsappLink("Olá! Quero fazer uma tiragem de 2 perguntas objetivas");
const WA_3_PERGUNTAS = whatsappLink("Olá! Quero fazer uma tiragem de 3 perguntas objetivas");
const WA_CARTA = whatsappLink("Olá! Quero a Carta Canalizada");
const WA_ADOCAMENTO = whatsappLink("Olá! Tenho interesse no ritual de Adoçamento");
const WA_CORTE = whatsappLink("Olá! Tenho interesse no ritual de Corte de Laços");
const WA_AUTOESTIMA = whatsappLink("Olá! Tenho interesse no ritual de Auto Estima e Amor Próprio");

const STAR_POSITIONS = Array.from({ length: 42 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53) % 100}%`,
  delay: `${(i % 10) * 0.35}s`,
  duration: `${2.6 + (i % 6) * 0.5}s`,
  size: i % 5 === 0 ? "text-base" : i % 3 === 0 ? "text-sm" : "text-xs",
  color: i % 4 === 0 ? "text-amber-200/70" : "text-amber-300/45",
}));

function Stars() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STAR_POSITIONS.map((star, i) => (
        <span
          key={i}
          className={`atendimentos-star absolute ${star.size} ${star.color}`}
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
  /** Numeric value (R$) — required for Facebook Lead tracking */
  leadValue: number;
  /** Human-readable name reported to Meta (defaults to title) */
  leadName?: string;
}

function ItemCard({ emoji, title, subtitle, price, oldPrice, badge, href, leadValue, leadName }: ItemCardProps) {
  const handleClick = () => {
    trackLead({ content_name: leadName || title, value: leadValue });
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onAuxClick={handleClick}
      data-fb-lead-value={leadValue}
      className="group relative flex transform-gpu items-center justify-between gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border border-amber-500/20 bg-gradient-to-br from-violet-950/70 to-indigo-950/70 px-4 sm:px-5 py-3.5 sm:py-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-amber-400/70 hover:shadow-[0_10px_40px_-8px_rgba(201,168,76,0.55)] hover:bg-gradient-to-br hover:from-violet-900/80 hover:to-indigo-900/80"
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
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center group-hover:bg-amber-300 group-hover:shadow-[0_0_18px_rgba(252,211,77,0.7)] transition-all duration-300 shrink-0">
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
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

    // ============== Facebook Pixel snippet ==============
    if (typeof window !== "undefined" && !window.fbq) {
      /* eslint-disable */
      (function (f: any, b, e, v, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      /* eslint-enable */
      window.fbq?.("init", FB_PIXEL_ID);
      window.fbq?.("track", "PageView");
    }
  }, []);


  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a1f]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/40 via-[#0a0a1f] to-[#050510]" />
      <div className="atendimentos-bg-drift absolute top-0 left-1/2 h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,hsl(265_70%_45%_/_0.22)_0%,transparent_68%)]" style={{ transform: "translateX(-50%)" }} />
      <Stars />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-8 sm:px-5 sm:py-14">
        {/* Header */}
        <header className="atendimentos-fade-up text-center">
          {/* Amanda photo */}
          <div className="relative w-28 h-28 sm:w-40 sm:h-40 mx-auto atendimentos-float-slow">
            <div className="atendimentos-halo absolute -inset-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 blur-xl" />
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
            <span className="absolute -bottom-1 -left-2 text-amber-300/70 text-xs sm:text-sm atendimentos-star" style={{ animationDuration: "3s" }}>✦</span>
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
        <section className="atendimentos-fade-up mt-8 sm:mt-10 [animation-delay:120ms]">
          <div className="atendimentos-border-glow relative overflow-hidden rounded-2xl sm:rounded-3xl p-[1.5px] bg-gradient-to-br from-amber-400 via-amber-500/40 to-amber-600">
          <div className="atendimentos-shimmer relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-950/95 via-indigo-950/95 to-[#0a0a1f] p-5 sm:p-8">
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
              <ItemCard title="1 pergunta objetiva" price="R$ 13" href={WA_1_PERGUNTA} leadValue={13} />
              <ItemCard title="2 perguntas objetivas" price="R$ 26" href={WA_2_PERGUNTAS} leadValue={26} />
              <ItemCard
                title="3 perguntas objetivas"
                subtitle="🔥 melhor custo"
                price="R$ 29"
                badge="Mais escolhida"
                href={WA_3_PERGUNTAS}
                leadValue={29}
              />
            </div>

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
            leadValue={25}
          />
        </section>

        {/* Rituais Especiais */}
        <section className="atendimentos-fade-up mt-10 sm:mt-14 [animation-delay:240ms]">
          <SectionTitle>Rituais Especiais</SectionTitle>
          <div className="space-y-2.5 sm:space-y-3">
            <ItemCard emoji="🍯" title="Adoçamento" subtitle="Materiais inclusos" price="R$ 300" href={WA_ADOCAMENTO} leadValue={300} />
            <ItemCard emoji="✂️" title="Corte de Laços" subtitle="Materiais inclusos" price="R$ 500" href={WA_CORTE} leadValue={500} />
            <ItemCard emoji="💖" title="Auto estima e amor próprio" subtitle="Materiais inclusos" price="R$ 350" href={WA_AUTOESTIMA} leadValue={350} />
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
