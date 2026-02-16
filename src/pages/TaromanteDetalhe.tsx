import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Clock, ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import BookingDialog from "@/components/BookingDialog";
import ReviewSection from "@/components/ReviewSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePageSEO } from "@/hooks/usePageSEO";
import heroBg from "@/assets/hero-bg.jpg";

export default function TaromanteDetalhe() {
  const { slug } = useParams<{ slug: string }>();
  const [taromante, setTaromante] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  usePageSEO({
    title: taromante ? `${taromante.name} — Taróloga na Chave do Oráculo` : "Taromante — Chave do Oráculo",
    description: taromante?.short_bio || taromante?.bio?.slice(0, 155) || "Conheça nossos taromantes e agende uma consulta personalizada.",
    path: `/taromante/${slug}`,
  });

  useEffect(() => {
    if (!slug) return;
    supabase.from("taromantes").select("*").eq("slug", slug).eq("is_active", true).single()
      .then(({ data }) => { setTaromante(data); setLoading(false); });
  }, [slug]);

  const handleBook = () => {
    if (!isAuthenticated) { navigate("/auth"); return; }
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <Link to="/consultas" className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar para Consultas
        </Link>

        {loading ? (
          <div className="h-96 rounded-xl shimmer" />
        ) : !taromante ? (
          <Card className="bg-card/80 backdrop-blur-md border-primary/20 text-center py-12">
            <CardContent>
              <h3 className="text-lg font-semibold text-foreground mb-2">Taromante não encontrado</h3>
              <Link to="/consultas"><Button variant="outline">Ver todos</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-md border-primary/20">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30 text-5xl shrink-0 mx-auto md:mx-0">
                    {taromante.photo_url
                      ? <img src={taromante.photo_url} alt={taromante.name} className="w-full h-full rounded-full object-cover" />
                      : "🔮"}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="font-serif text-3xl font-bold text-foreground">{taromante.name}</h1>
                    {taromante.title && <p className="text-primary text-lg">{taromante.title}</p>}

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-foreground/60">
                      {taromante.rating && <span className="flex items-center gap-1"><Star className="w-4 h-4 text-primary" />{taromante.rating} ({taromante.total_reviews || 0} avaliações)</span>}
                      {taromante.experience && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{taromante.experience} anos de experiência</span>}
                      {taromante.total_consultations && <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{taromante.total_consultations} consultas</span>}
                    </div>

                    {Array.isArray(taromante.specialties) && taromante.specialties.length > 0 && (
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                        {(taromante.specialties as string[]).map((s) => (
                          <span key={s} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}

                    {taromante.short_bio && <p className="text-foreground/70 mt-4">{taromante.short_bio}</p>}
                    {taromante.bio && <p className="text-foreground/60 text-sm mt-2 whitespace-pre-line">{taromante.bio}</p>}

                    <div className="flex items-center gap-4 mt-6 justify-center md:justify-start">
                      {taromante.price_per_session && (
                        <span className="text-primary font-bold text-2xl">R$ {Number(taromante.price_per_session).toFixed(2)} <span className="text-sm font-normal text-foreground/50">/ sessão</span></span>
                      )}
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="lg" onClick={handleBook}>
                        Agendar Consulta
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <ReviewSection taromanteId={taromante.id} taromanteName={taromante.name} />
          </motion.div>
        )}
      </main>

      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        taromante={taromante}
        userId={user?.id || ""}
      />
    </div>
  );
}
