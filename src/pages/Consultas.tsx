import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Star, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";

interface Taromante {
  id: string;
  name: string;
  title: string | null;
  short_bio: string | null;
  photo_url: string | null;
  rating: number | null;
  experience: number | null;
  price_per_session: number | null;
  specialties: any;
  is_active: boolean | null;
}

export default function Consultas() {
  const [taromantes, setTaromantes] = useState<Taromante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("taromantes").select("*").eq("is_active", true).then(({ data }) => {
      setTaromantes(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/40 mb-4">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Nossos Taromantes</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Consultas Personalizadas</h1>
          <p className="text-foreground/70 max-w-2xl mx-auto">Agende uma sessão com nossos taromantes especializados</p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 rounded-xl shimmer" />)}
          </div>
        ) : taromantes.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur-md border-primary/20 text-center py-12">
            <CardContent>
              <Users className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Em breve</h3>
              <p className="text-foreground/60">Nossos taromantes estarão disponíveis em breve para consultas.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {taromantes.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="bg-card/80 backdrop-blur-md border-primary/20 hover:border-primary/50 transition-all">
                  <CardContent className="pt-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4 border-2 border-primary/30 text-3xl">
                      {t.photo_url ? <img src={t.photo_url} alt={t.name} className="w-full h-full rounded-full object-cover" /> : "🔮"}
                    </div>
                    <h3 className="font-serif text-xl font-bold text-foreground text-center">{t.name}</h3>
                    {t.title && <p className="text-primary text-sm text-center">{t.title}</p>}
                    {t.short_bio && <p className="text-foreground/60 text-sm mt-2 text-center">{t.short_bio}</p>}
                    <div className="flex justify-center gap-4 mt-4 text-xs text-foreground/50">
                      {t.rating && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-primary" />{t.rating}</span>}
                      {t.experience && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.experience} anos</span>}
                    </div>
                    {t.price_per_session && (
                      <div className="text-center mt-4">
                        <span className="text-primary font-bold text-lg">R$ {Number(t.price_per_session).toFixed(2)}</span>
                        <span className="text-foreground/50 text-sm"> / sessão</span>
                      </div>
                    )}
                    <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">Agendar Consulta</Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
