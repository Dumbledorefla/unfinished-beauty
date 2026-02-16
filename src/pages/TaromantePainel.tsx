import { useEffect, useState } from "react";
import { useNoIndex } from "@/hooks/useNoIndex";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Star, DollarSign, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import heroBg from "@/assets/hero-bg.jpg";

interface Consultation {
  id: string;
  scheduled_at: string;
  status: string;
  consultation_type: string;
  duration: number;
  price: number;
  topic: string | null;
  notes: string | null;
}

export default function TaromantePainel() {
  useNoIndex();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [taromante, setTaromante] = useState<any>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate("/auth"); return; }

    const load = async () => {
      // Check if user is a taromante
      const { data: t } = await supabase.from("taromantes").select("*").eq("user_id", user!.id).single();
      if (!t) { navigate("/"); return; }
      setTaromante(t);

      const { data: c } = await supabase
        .from("consultations")
        .select("*")
        .eq("taromante_id", t.id)
        .order("scheduled_at", { ascending: false });
      setConsultations(c || []);
      setLoading(false);
    };
    load();
  }, [user, isAuthenticated, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0"><img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" /><div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background" /></div>
        <Header />
        <main className="relative z-10 container mx-auto px-4 pt-24 pb-16">
          <div className="h-64 rounded-xl shimmer" />
        </main>
      </div>
    );
  }

  const upcoming = consultations.filter(c => new Date(c.scheduled_at) >= new Date() && c.status !== "cancelled");
  const past = consultations.filter(c => new Date(c.scheduled_at) < new Date() || c.status === "completed");
  const totalRevenue = consultations.filter(c => c.status === "completed").reduce((s, c) => s + c.price, 0);

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    confirmed: "bg-emerald-500/20 text-emerald-400",
    completed: "bg-primary/20 text-primary",
    cancelled: "bg-destructive/20 text-destructive",
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0"><img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" /><div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background" /></div>
      <Header />
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Painel do Taromante</h1>
          <p className="text-foreground/60 mb-8">Olá, {taromante?.name}! Gerencie suas consultas aqui.</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Calendar, label: "Próximas", value: upcoming.length, color: "text-emerald-400" },
              { icon: Users, label: "Total", value: consultations.length, color: "text-primary" },
              { icon: Star, label: "Avaliação", value: taromante?.rating?.toFixed(1) || "—", color: "text-yellow-400" },
              { icon: DollarSign, label: "Faturamento", value: `R$ ${totalRevenue.toFixed(0)}`, color: "text-emerald-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <Card key={label} className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardContent className="p-4 text-center">
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-foreground/50">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="upcoming">
            <TabsList className="bg-card/80 border border-primary/20">
              <TabsTrigger value="upcoming">Próximas ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="past">Histórico ({past.length})</TabsTrigger>
            </TabsList>

            {["upcoming", "past"].map(tab => (
              <TabsContent key={tab} value={tab}>
                {(tab === "upcoming" ? upcoming : past).length === 0 ? (
                  <Card className="bg-card/80 backdrop-blur-md border-primary/20 text-center py-8">
                    <CardContent>
                      <p className="text-foreground/50">Nenhuma consulta {tab === "upcoming" ? "agendada" : "no histórico"}.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {(tab === "upcoming" ? upcoming : past).map(c => (
                      <Card key={c.id} className="bg-card/80 backdrop-blur-md border-primary/20">
                        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="text-foreground font-medium">
                                {new Date(c.scheduled_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                                {" às "}
                                {new Date(c.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground/60">
                              <Clock className="w-3 h-3" /> {c.duration} min — {c.consultation_type}
                              {c.topic && <span>• {c.topic}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-primary font-semibold">R$ {c.price.toFixed(2)}</span>
                            <Badge className={statusColor[c.status] || "bg-foreground/10 text-foreground/60"}>
                              {c.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
