import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Camila R.",
    text: "Fiz o Tarot do Amor num momento difícil e a leitura foi tão certeira que chorei. Me deu a clareza que eu precisava para seguir em frente.",
    rating: 5,
    service: "Tarot do Amor",
  },
  {
    name: "Juliana M.",
    text: "O Mapa Numerológico me surpreendeu. Coisas que eu sentia mas não sabia explicar, estavam todas ali nos meus números. Incrível.",
    rating: 5,
    service: "Numerologia",
  },
  {
    name: "Fernanda S.",
    text: "Uso o Tarot do Dia toda manhã antes de sair de casa. Virou meu ritual. As mensagens são sempre pertinentes e me ajudam a começar o dia com mais leveza.",
    rating: 5,
    service: "Tarot do Dia",
  },
  {
    name: "Ana Paula L.",
    text: "A consulta ao vivo foi maravilhosa. A tarologa foi super acolhedora e me ajudou a enxergar caminhos que eu não via. Super recomendo.",
    rating: 5,
    service: "Consulta ao Vivo",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 relative z-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-primary/70 text-xs font-semibold tracking-[0.2em] uppercase">Depoimentos</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-foreground">O que dizem sobre nós</h2>
          </motion.div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 flex flex-col"
            >
              <Quote className="w-6 h-6 text-primary/30 mb-3" />
              <p className="text-foreground/80 text-sm leading-relaxed flex-1 italic">"{t.text}"</p>
              <div className="mt-4 pt-4 border-t border-border/20">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-foreground font-semibold text-sm">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.service}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
