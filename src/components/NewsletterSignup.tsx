import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterSignupProps {
  variant?: "inline" | "card" | "footer";
  source?: string;
}

export default function NewsletterSignup({ variant = "card", source = "website" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      await supabase.from("newsletter_subscribers").upsert(
        { email, name: name || null, source, is_active: true },
        { onConflict: "email" }
      );
      setSubmitted(true);
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <Check className="w-6 h-6 text-emerald-400" />
        </div>
        <p className="font-semibold text-foreground">Inscrição confirmada!</p>
        <p className="text-sm text-muted-foreground mt-1">Você vai receber nosso conteúdo exclusivo no seu e-mail.</p>
      </motion.div>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu melhor e-mail" required
          className="bg-input/50 border-border/50 flex-1"
        />
        <Button type="submit" disabled={loading} className="bg-amber-500 text-slate-900 hover:bg-amber-400 font-semibold whitespace-nowrap">
          {loading ? "..." : "Quero receber"}
        </Button>
      </form>
    );
  }

  return (
    <div className={`${variant === "card" ? "bg-secondary/60 backdrop-blur-md border border-white/12 rounded-2xl p-8" : ""}`}>
      <div className="text-center mb-5">
        <Mail className="w-8 h-8 text-amber-400 mx-auto mb-3" />
        <h3 className="font-serif text-xl font-bold text-foreground">Receba orientações no seu e-mail</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Horóscopo semanal, dicas de Tarot e conteúdos exclusivos. Grátis, sem spam.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-md mx-auto">
        <Input
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Seu primeiro nome" className="bg-input/50 border-white/15 focus:border-amber-500/50"
        />
        <Input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu melhor e-mail" required className="bg-input/50 border-white/15 focus:border-amber-500/50"
        />
        <Button type="submit" disabled={loading} className="w-full bg-amber-500 text-slate-900 hover:bg-amber-400 font-semibold pulse-glow-gold">
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? "Inscrevendo..." : "Quero receber conteúdo exclusivo"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">Sem spam. Cancele quando quiser.</p>
      </form>
    </div>
  );
}
